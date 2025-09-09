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
        where: {created_at: {gte: fromDate}},
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

    let totalProfit = 0;

    invoices.forEach(inv => {
        let invoiceCost = 0;

        // Calculate total cost for each item in the invoice based on unit buying price and quantity
        inv.invoice_items.forEach(item => {
            const qty = Number(item.qty) || 0;

            // Get the unit buying price for the stock item
            const unitBuyingPrice = Number(item.stock.unit_buying_price) || 0;

            // Calculate the total cost for this item: Unit Buying Price * Quantity
            const itemCost = unitBuyingPrice * qty;

            invoiceCost += itemCost;
        });

        // Invoice total amount (total amount of the invoice)
        const invoiceTotal = Number(inv.total_amount) || 0;

        // Calculate the profit for this invoice: Invoice Total - Invoice Cost
        const invoiceProfit = invoiceTotal - invoiceCost;

        totalProfit += invoiceProfit;

    });

    // Top Products
    const productSales = {};
    invoices.forEach(inv => {
        inv.invoice_items.forEach(item => {
            const title = item.stock.product.title;
            if (!productSales[title]) productSales[title] = {qty: 0, revenue: 0};
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
        if (!customerSales[customer]) customerSales[customer] = {orders: 0, total: 0};

        // Only include payments that are not REJECTED or EXPIRED
        inv.payment_history.forEach(payment => {
            if (payment.status !== 'REJECTED' && payment.status !== 'EXPIRED') {
                customerSales[customer].total += payment.paid_amount || 0;
            }
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

// Monthly Aggregation
    const monthlyData = {};

    invoices.forEach(inv => {
        const month = inv.created_at.toLocaleString('default', {month: 'short'});

        if (!monthlyData[month]) {
            monthlyData[month] = {
                total_amount: 0,
                total_paid_amount: 0,
                total_pending_amount: 0,
                pending_invoice_count: 0,
                paid_invoice_count: 0,
            };
        }

        // Add invoice total
        monthlyData[month].total_amount += inv.total_amount || 0;

        // Add payments (CLEARED + PENDING only, ignore REJECTED & EXPIRED)
        let invoicePaid = 0;
        inv.payment_history.forEach(payment => {
            if (payment.status === 'CLEARED' || payment.status === 'PENDING') {
                invoicePaid += payment.paid_amount || 0;
            }
        });

        monthlyData[month].total_paid_amount += invoicePaid;

        // Calculate pending for this invoice
        const invoicePending = (inv.total_amount || 0) - invoicePaid;
        monthlyData[month].total_pending_amount += invoicePending > 0 ? invoicePending : 0;

        // Invoice status counts
        if (inv.status === 'PAID') {
            monthlyData[month].paid_invoice_count += 1;
        } else {
            monthlyData[month].pending_invoice_count += 1;
        }
    });

    const allCustomers = await DB.customer.findMany({
        where: {status_id: 1},
        orderBy: {id: 'asc'},
    });

    return {
        totalRevenue,
        totalProfit,
        totalOrders,
        avgOrderValue,
        categorySales,
        salesTrend: monthlyData,
        topProducts,
        topCustomers,
        allCustomers,
    };
};

