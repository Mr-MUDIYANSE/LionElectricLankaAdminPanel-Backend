import DB from "../db/db.js";

const getDateRange = (range) => {
    const now = new Date();
    switch (range) {
        case '60d':
            return new Date(now.setDate(now.getDate() - 60));
        case '90d':
            return new Date(now.setDate(now.getDate() - 90));
        case '1y':
            return new Date(now.setFullYear(now.getFullYear() - 1));
        default:
            return new Date(now.setDate(now.getDate() - 30));
    }
};

export const getDashboardDataByRange = async (range) => {
    const fromDate = getDateRange(range);

    // All Invoices in Time Range
    const invoices = await DB.invoice.findMany({
        where: { created_at: { gte: fromDate } },
        include: {
            customer: true,
            payment_history: true, // Include payment_history to fetch paid_amount
            invoice_items: {
                include: {
                    stock: {
                        include: {
                            product: {
                                include: {
                                    main_category: true,
                                }
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

    let profit = 0;

    invoices.forEach(inv => {
        let invoiceProfit = 0;

        // Calculate the total selling price for the items in the invoice
        inv.invoice_items.forEach(item => {
            const sellingPrice = Number(item.selling_price) || 0;
            const qty = Number(item.qty) || 0;
            invoiceProfit += sellingPrice * qty;
        });

        // Invoice total amount (total amount of the invoice)
        const invoiceTotal = Number(inv.total_amount) || 0;

        // Discount is the difference between the invoice profit (selling price) and total amount
        const invoiceDiscount = invoiceProfit - invoiceTotal;

        // Profit = Invoice total - Discount
        profit += invoiceTotal - invoiceDiscount;

    });

    const totalProfit = totalRevenue - profit;

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
        .map(([title, data]) => ({
            title,
            qty: data.qty,
            revenue: data.revenue,
        }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

    // Top Customers
    const customerSales = {};
    invoices.forEach(inv => {
        const customer = inv.customer.name;
        if (!customerSales[customer]) customerSales[customer] = { orders: 0, total: 0 };

        // Sum up the paid amount from the payment history
        inv.payment_history.forEach(payment => {
            customerSales[customer].total += payment.paid_amount || 0;
        });

        customerSales[customer].orders += 1;
    });

    const topCustomers = Object.entries(customerSales)
        .map(([name, data]) => ({
            name,
            orders: data.orders,
            total: data.total,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    // Sales Trend (month-wise aggregation)
    const salesTrend = {};
    invoices.forEach(inv => {
        const month = inv.created_at.toLocaleString('default', { month: 'short' });

        // Filter payments with status 'CLEARED' only
        inv.payment_history.forEach(payment => {
            if (payment.status === 'CLEARED') {
                if (!salesTrend[month]) salesTrend[month] = 0;
                salesTrend[month] += payment.paid_amount || 0;
            }
        });
    });

    const allCustomers = await DB.customer.findMany({
        where: { status_id: 1 },
        orderBy: { id: 'asc' },
    });

    return {
        totalRevenue,
        totalProfit,
        totalOrders,
        avgOrderValue,
        categorySales,
        salesTrend,
        topProducts,
        topCustomers,
        allCustomers,
    };
};

