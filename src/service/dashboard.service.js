import DB from "../db/db.js";

export const getDashboardDataByRange = async (range) => {
    const now = new Date();
    let fromDate, toDate;

    if (/^\d{4}$/.test(range)) {
        // Range is a year like "2024"
        const year = parseInt(range, 10);
        fromDate = new Date(year, 0, 1);   // Jan 1 of that year
        toDate = new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31 of that year
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
            categorySales[cat] += item.qty;
        });
    });

    let totalProfit = 0;
    invoices.forEach(inv => {
        let invoiceCost = 0;

        // Calculate cost for each invoice item, considering returned quantity
        inv.invoice_items.forEach(item => {
            const soldQty = item.qty - item.returned_qty; // Actual sold quantity
            const unitBuyingPrice = Number(item.stock.unit_buying_price) || 0;
            invoiceCost += unitBuyingPrice * soldQty; // Calculate cost for sold quantity
        });

        totalProfit = totalRevenue - invoiceCost;
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
            const soldQty = item.qty - (item.returned_qty || 0);
            let lineTotal = soldQty * item.selling_price;

            // apply discount if available
            if (item.discount && item.discount > 0) {
                lineTotal -= item.discount;
            }

            invoiceTotal += lineTotal;
        });

        customerSales[custName].total += invoiceTotal;

        // ---- Paid calculation ----
        let paid = 0;
        inv.payment_history.forEach(p => {
            if (p.status === "CLEARED") {
                paid += p.paid_amount || 0;
            }
        });

        customerSales[custName].paid_total += paid;
        customerSales[custName].pending_total += invoiceTotal - paid;
    });

// ---- Top customers ----
    const topCustomers = Object.entries(customerSales)
        .map(([name, data]) => ({
            name,
            orders: data.orders,
            total: data.total,         // total with discount applied
            paid_total: data.paid_total,
            pending_total: data.pending_total
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    // Calculate the total amount for each invoice (excluding returned items)
    const totalAmountForInvoice = (items) => {
        let invoiceTotal = 0;
        items.forEach(item => {
            // Calculate the total quantity considering the returned quantity
            const qtyToCalculate = item.qty - (item.returned_qty || 0);

            // Ensure the quantity is not negative
            const validQty = Math.max(qtyToCalculate, 0);

            // Calculate the item total (selling price * quantity - discount)
            const itemTotal = validQty * (item.selling_price - (item.discount_amount / item.qty));
            invoiceTotal += itemTotal;

        });
        return invoiceTotal;
    };

    // Monthly Aggregation
    const monthlyData = {};
    invoices.forEach(inv => {
        const month = inv.created_at.toLocaleString("default", {month: "short"});

        if (!monthlyData[month]) {
            monthlyData[month] = {
                total_amount: 0,
                total_paid_amount: 0,
                total_pending_amount: 0,
                pending_invoice_count: 0,
                paid_invoice_count: 0,
            };
        }

        // Calculate invoice total (with returns considered)
        const invoiceTotal = totalAmountForInvoice(inv.invoice_items);
        monthlyData[month].total_amount += invoiceTotal;

        // Calculate paid amount, including cheque cleared
        let rawPaid = 0;
        inv.payment_history.forEach(payment => {
            if (
                (payment.payment_type === "CASH" && payment.status === "CLEARED") ||
                (payment.payment_type === "CHEQUE" && payment.chequeDetail?.status === "CLEARED")
            ) {
                rawPaid += payment.paid_amount || 0;
            }
        });

        // Cap paid at invoiceTotal
        const invoicePaid = Math.min(invoiceTotal, rawPaid);
        monthlyData[month].total_paid_amount += invoicePaid;

        // Pending amount
        const invoicePending = invoiceTotal - invoicePaid;
        monthlyData[month].total_pending_amount += invoicePending > 0 ? invoicePending : 0;

        // Count invoices correctly based on pending amount
        if (invoicePending <= 0) {
            monthlyData[month].paid_invoice_count += 1; // fully paid
        } else {
            monthlyData[month].pending_invoice_count += 1; // has pending
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