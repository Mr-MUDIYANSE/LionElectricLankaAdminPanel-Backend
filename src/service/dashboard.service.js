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
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const avgOrderValue = totalOrders ? parseFloat((totalRevenue / totalOrders).toFixed(2)) : 0;

    // Sales by Category
    const categorySales = {};
    invoices.forEach(inv => {
        inv.invoice_items.forEach(item => {
            const cat = item.stock.product.main_category.name;
            if (!categorySales[cat]) categorySales[cat] = 0;
            categorySales[cat] += item.qty;
        });
    });

    // Profit Calculation
    let totalProfit = 0;
    invoices.forEach(inv => {
        let invoiceCost = 0;
        inv.invoice_items.forEach(item => {
            const qty = Number(item.qty) || 0;
            const unitBuyingPrice = Number(item.stock.unit_buying_price) || 0;
            invoiceCost += unitBuyingPrice * qty;
        });
        totalProfit += (Number(inv.total_amount) || 0) - invoiceCost;
    });

    // Top Products
    const productSales = {};
    invoices.forEach(inv => {
        inv.invoice_items.forEach(item => {
            const title = item.stock.product.title;
            if (!productSales[title]) productSales[title] = { qty: 0, revenue: 0 };
            productSales[title].qty += item.qty;
            productSales[title].revenue += item.qty * item.selling_price;
        });
    });

    const topProducts = Object.entries(productSales)
        .map(([title, data]) => ({ title, qty: data.qty, revenue: data.revenue }))
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

        // full invoice price (paid + pending)
        customerSales[custName].total += inv.total_amount || 0;

        // sum payments
        let paid = 0;
        inv.payment_history.forEach(p => {
            if (p.status === "CLEARED") {
                paid += p.paid_amount || 0;
            }
        });

        customerSales[custName].paid_total += paid;
        customerSales[custName].pending_total += (inv.total_amount || 0) - paid;
    });

    const topCustomers = Object.entries(customerSales)
        .map(([name, data]) => ({
            name,
            orders: data.orders,
            total: data.total,              // full invoice total
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    // Monthly Aggregation
    const monthlyData = {};
    invoices.forEach(inv => {
        const month = inv.created_at.toLocaleString("default", { month: "short" });

        if (!monthlyData[month]) {
            monthlyData[month] = {
                total_amount: 0,
                total_paid_amount: 0,
                total_pending_amount: 0,
                pending_invoice_count: 0,
                paid_invoice_count: 0,
            };
        }

        monthlyData[month].total_amount += inv.total_amount || 0;

        let invoicePaid = 0;
        inv.payment_history.forEach(payment => {
            if (payment.status === "CLEARED" || payment.status === "PENDING") {
                invoicePaid += payment.paid_amount || 0;
            }
        });

        monthlyData[month].total_paid_amount += invoicePaid;

        const invoicePending = (inv.total_amount || 0) - invoicePaid;
        monthlyData[month].total_pending_amount += invoicePending > 0 ? invoicePending : 0;

        if (inv.status === "PAID") {
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
        avgOrderValue,
        categorySales,
        salesTrend: monthlyData,
        topProducts,
        topCustomers,
        allCustomersCount: customerCount,
    };
};