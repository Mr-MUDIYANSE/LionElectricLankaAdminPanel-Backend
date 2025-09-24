import DB from "../db/db.js";

export const getDashboardDataByRange = async (range) => {
    const now = new Date();
    let fromDate, toDate;

    if (/^\d{4}$/.test(range)) {
        // Range is a year like "2024"
        const year = parseInt(range, 10);
        fromDate = new Date(year, 0, 1);   // Jan 1
        toDate = new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31
    } else if (/^\d{4}-\d{2}$/.test(range)) {
        // Range is year-month like "2024-09"
        const [year, month] = range.split("-").map(Number);
        fromDate = new Date(year, month - 1, 1); // first day of month
        toDate = new Date(year, month, 0, 23, 59, 59, 999); // last day of month
    } else {
        // Default: current year
        const currentYear = now.getFullYear();
        fromDate = new Date(currentYear, 0, 1);
        toDate = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    }

    // All Invoices in Time Range
    const invoices = await DB.invoice.findMany({
        where: {
            created_at: {
                gte: fromDate,
                lte: toDate,
            },
        },
        include: {
            customer: true,
            payment_history: true,
            invoice_items: {
                include: {
                    stock: {
                        include: {
                            product: {
                                include: {
                                    main_category: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    const totalOrders = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => {
        // Calculate the revenue for each invoice item considering the return qty
        const invoiceRevenue = inv.invoice_items.reduce((itemSum, item) => {
            const soldQty = item.qty - item.returned_qty; // Actual sold quantity
            const itemRevenue = soldQty * (item.selling_price - (item.discount_amount / item.qty)); // Revenue for this item
            return itemSum + itemRevenue; // Add the item revenue to the sum
        }, 0);

        return sum + invoiceRevenue; // Add this invoice's total revenue to the overall sum
    }, 0);

    // Sales by Category
    const categorySales = {};
    invoices.forEach(inv => {
        inv.invoice_items.forEach(item => {
            const cat = item.stock.product.main_category.name;
            if (!categorySales[cat]) categorySales[cat] = 0;
            categorySales[cat] += item.qty - item.returned_qty;
        });
    });

    let totalProfit = 0;
    invoices.forEach(inv => {
        let invoiceCost = 0;

        inv.invoice_items.forEach(item => {
            const soldQty = (item.qty - item.returned_qty);
            const unitSellingPrice = Number(item.stock.unit_selling_price) - (item.discount_amount / item.qty);
            const unitBuyingPrice = Number(item.stock.unit_buying_price) || 0;
            // const unitSellingPrice = Number(item.stock.unit_selling_price) || 0;
            totalProfit += (unitSellingPrice - unitBuyingPrice) * soldQty;
        });

    });

    // Top Products
    const productSales = {};
    invoices.forEach(inv => {
        inv.invoice_items.forEach(item => {
            const title = item.stock.product.title;
            if (!productSales[title]) productSales[title] = {qty: 0, revenue: 0};

            // Actual sold quantity (excluding returns)
            const soldQty = item.qty - item.returned_qty;

            // Update qty and revenue (no discount considered)
            productSales[title].qty += soldQty;
            productSales[title].revenue += soldQty * item.selling_price;
        });
    });

    const topProducts = Object.entries(productSales)
        .map(([title, data]) => ({
            title,
            qty: data.qty,
            revenue: data.revenue
        }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);


    const customerSales = {};
    invoices.forEach(inv => {
        const custName = inv.customer?.name || "Unknown";

        if (!customerSales[custName]) {
            customerSales[custName] = {
                orders: 0,
                total: 0,
                paid_total: 0,
                pending_total: 0
            };
        }

        customerSales[custName].orders += 1;

        // ---- Calculate invoice total with discount ----
        let invoiceTotal = 0;
        inv.invoice_items.forEach(item => {
            const qtyToCalculate = item.qty - item.returned_qty;
            const perUnitDiscount = item.discount_amount / item.qty;
            invoiceTotal += qtyToCalculate * (item.selling_price - perUnitDiscount);
        });

        customerSales[custName].total += invoiceTotal;

        // ---- Paid calculation ----
        let paid = 0;
        inv.payment_history.forEach(p => {
            if (p.status === "CLEARED") {
                paid += p.paid_amount || 0;
            }
        });

    });

    // ---- Top customers ----
    const topCustomers = Object.entries(customerSales)
        .map(([name, data]) => ({
            name,
            orders: data.orders,
            total: data.total,         // total with discount applied
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    const totalAmountForInvoice = (items) => {
        let invoiceTotal = 0;
        items.forEach(item => {
            const qtyToCalculate = Math.max(item.qty - (item.returned_qty || 0), 0);
            const perUnitDiscount = (item.discount_amount || 0) / item.qty;
            invoiceTotal += qtyToCalculate * (item.selling_price - perUnitDiscount);
        });
        return invoiceTotal;
    };

// Aggregate monthly data
    const monthlyData = {};

    invoices.forEach(inv => {
        const month = inv.created_at.toLocaleString("default", {month: "short"});

        if (!monthlyData[month]) {
            monthlyData[month] = {
                total_amount: 0,
                total_paid_amount: 0,
                total_pending_amount: 0,
                paid_invoice_count: 0,
                pending_invoice_count: 0
            };
        }

        // Calculate invoice total
        const invoiceTotal = totalAmountForInvoice(inv.invoice_items);

        // Calculate paid amount from payment history
        let invoicePaid = 0;
        inv.payment_history.forEach(p => {
            // Only include valid payments
            if (p.status === "CLEARED") {
                invoicePaid += p.paid_amount || 0;
            }
        });

        // Cap paid amount to invoice total
        invoicePaid = Math.min(invoicePaid, invoiceTotal);

        // Calculate pending amount
        const invoicePending = Math.max(invoiceTotal - invoicePaid, 0);

        // Update monthly totals
        monthlyData[month].total_amount += invoiceTotal;
        monthlyData[month].total_paid_amount += invoicePaid;
        monthlyData[month].total_pending_amount += invoicePending;

        // Count invoices
        if (invoicePending <= 0) {
            monthlyData[month].paid_invoice_count += 1;
        } else {
            monthlyData[month].pending_invoice_count += 1;
        }
    });

    const allCustomers = await DB.customer.findMany();

    const customerCount = allCustomers.length;

    return {
        totalRevenue,
        totalProfit,
        totalOrders,
        categorySales,
        salesTrend: monthlyData,
        topProducts,
        topCustomers,
        allCustomersCount: customerCount,
    };
};