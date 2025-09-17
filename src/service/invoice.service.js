import DB from "../db/db.js";
import {startOfMonth, endOfMonth} from 'date-fns';
import cryptoRandomString from "crypto-random-string";

export const getAllInvoices = async (date) => {
    let whereClause = {};

    if (date) {
        // Year + month (e.g., '2025-07')
        if (/^\d{4}-\d{2}$/.test(date)) {
            const start = new Date(`${date}-01T00:00:00`);
            const end = endOfMonth(start);
            whereClause.created_at = {gte: start, lte: end};
        }
        // Year only (e.g., '2025')
        else if (/^\d{4}$/.test(date)) {
            const year = parseInt(date);
            const start = new Date(`${year}-01-01T00:00:00`);
            const end = new Date(`${year}-12-31T23:59:59`);
            whereClause.created_at = {gte: start, lte: end};
        }
        // Full date (e.g., '2025-07-21')
        else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const dayStart = new Date(`${date}T00:00:00`);
            const dayEnd = new Date(`${date}T23:59:59`);
            whereClause.created_at = {gte: dayStart, lte: dayEnd};
        } else {
            throw new Error("Invalid date format. Use yyyy, yyyy-mm, or yyyy-mm-dd");
        }
    } else {
        // Default: current month
        const now = new Date();
        const start = startOfMonth(now);
        const end = endOfMonth(now);
        whereClause.created_at = {
            gte: start,
            lte: end
        };
    }

    const invoices = await DB.invoice.findMany({
        orderBy: {created_at: "desc"},
        where: whereClause,
        include: {
            customer: true,
            payment_history: {
                include: {
                    chequeDetail: true,
                }
            },
            invoice_items: {
                include: {
                    stock: {
                        include: {
                            status: true,
                            product: {
                                include: {
                                    brand: true,
                                    status: true,
                                    main_category: true,
                                    phase: true,
                                    speed: true,
                                    motor_type: true,
                                    size: true,
                                    gear_box_type: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    return invoices;
};

export const getAllMetaData = async (year, month) => {
    // Fetch invoices with invoice items and return history
    const invoices = await DB.invoice.findMany({
        include: {
            invoice_items: true,
            Product_Return: {
                include: {return_item: true}
            },
            payment_history: {include: {chequeDetail: true}}
        }
    });

    // Calculate total / paid / pending for a list of invoices
    const calculateMeta = (invoiceList) => {
        let totalAmount = 0, totalPaidAmount = 0, totalPendingAmount = 0;
        let pendingCount = 0, paidCount = 0;

        invoiceList.forEach((inv) => {
            // Calculate total invoice amount considering returned quantities
            let invoiceTotal = 0;
            inv.invoice_items.forEach(item => {
                const soldQty = item.qty - (item.returned_qty || 0); // actual sold qty
                const perUnitDiscount = (item.discount_amount || 0) / item.qty; // prorated discount per unit
                const itemTotal = soldQty * (item.selling_price - perUnitDiscount); // apply discount per sold unit
                invoiceTotal += itemTotal;
            });

            totalAmount += invoiceTotal;

            // Calculate cleared payments
            let clearedPaid = inv.payment_history.reduce((sum, p) => {
                if (p.payment_type === "CASH" && p.status === "CLEARED") return sum + p.paid_amount;
                if (p.payment_type === "CHEQUE" && p.chequeDetail?.status === "CLEARED") return sum + p.paid_amount;
                return sum;
            }, 0);

            // Don't allow paid > invoiceTotal (after return deduction)
            clearedPaid = Math.min(clearedPaid, invoiceTotal);

            totalPaidAmount += clearedPaid;

            const pending = invoiceTotal - clearedPaid;
            totalPendingAmount += pending;

            if (pending === 0) paidCount++;
            else pendingCount++;
        });

        return {
            total_amount: totalAmount,
            total_paid_amount: totalPaidAmount,
            total_pending_amount: totalPendingAmount,
            pending_invoice_count: pendingCount,
            paid_invoice_count: paidCount
        };
    };

    // Overall data
    const overallData = calculateMeta(invoices);
    const result = {data: overallData};

    // Monthly / Yearly data
    if (year) {
        const selectedYear = parseInt(year);
        const selectedMonth = month ? parseInt(month) : null;

        const monthlyInvoices = invoices.filter(inv => {
            const invDate = new Date(inv.created_at);
            const invYear = invDate.getFullYear();
            const invMonth = invDate.getMonth() + 1;
            if (selectedMonth) return invYear === selectedYear && invMonth === selectedMonth;
            return invYear === selectedYear;
        });

        result.monthly_data = monthlyInvoices.length
            ? calculateMeta(monthlyInvoices)
            : {
                total_amount: 0,
                total_paid_amount: 0,
                total_pending_amount: 0,
                pending_invoice_count: 0,
                paid_invoice_count: 0
            };
    }

    return result;
};

export const getInvoiceById = async (invoiceId) => {
    if (!invoiceId) {
        throw new Error("Invalid id required");
    }

    const invoice = await DB.invoice.findUnique({
        where: {id: invoiceId},
        include: {
            customer: true,
            payment_history: {
                include: {
                    chequeDetail: true,
                }
            },
            invoice_items: {
                include: {
                    stock: {
                        include: {
                            status: true,
                            product: {
                                include: {
                                    brand: true,
                                    status: true,
                                    main_category: true,
                                    phase: true,
                                    speed: true,
                                    motor_type: true,
                                    size: true,
                                    gear_box_type: true
                                }
                            }
                        }
                    }
                }
            },
            Product_Return: {
                include: {
                    return_item: true, // all returned items
                }
            }
        }
    });

    if (!invoice) {
        const error = new Error("Invoice not found");
        error.status = 404;
        throw error;
    }

    return invoice;
};

export const createInvoices = async (customerId, data) => {
    const {paid_amount, payment_type, items, chequeDetail} = data;

    const errors = [];
    if (!customerId || isNaN(customerId)) errors.push("Valid customer ID required.");

    const customer = await DB.customer.findUnique({
        where: {id: Number(customerId)}
    });
    if (!customer) {
        const error = new Error(`Customer not found for ID ${customerId}`);
        error.status = 404;
        error.errors = [`Customer with ID ${customerId} does not exist.`];
        throw error;
    }

    if (!Array.isArray(items) || items.length === 0) errors.push("At least one invoice item required.");
    if (paid_amount < 0) errors.push("Paid amount cannot be negative.");
    if (!payment_type) errors.push("Payment type is required.");

    const validPaymentTypes = ["CASH", "CHEQUE", "PURCHASE_ORDER"];
    if (!validPaymentTypes.includes(payment_type)) {
        errors.push(`Invalid payment type. Must be one of: ${validPaymentTypes.join(", ")}`);
    }

    if (payment_type === "CHEQUE" && !chequeDetail) {
        errors.push("Cheque details are required for cheque payments.");
    }

    // PURCHASE_ORDER should always start with 0
    if (payment_type === "PURCHASE_ORDER" && paid_amount !== 0) {
        errors.push("Purchase Order must start with paid amount = 0");
    }

    if (errors.length > 0) {
        const error = new Error("Validation failed");
        error.errors = errors;
        throw error;
    }

    // validate stock
    for (const item of items) {
        const stock = await DB.stock.findUnique({
            where: {id: item.stock_id},
            include: {product: true}
        });
        if (!stock) throw new Error(`Stock ID ${item.stock_id} not found`);
        if (stock.qty < item.qty) {
            throw new Error(
                `Insufficient stock for product "${stock.product.title}". Available: ${stock.qty}, Required: ${item.qty}`
            );
        }
    }

    // Calculate the total for the invoice
    let invoiceTotal = 0;
    items.forEach(item => {
        const itemTotal = (item.selling_price * item.qty) - (item.discount_amount || 0);
        invoiceTotal += itemTotal;
    });

    // decide invoice status
    let invoiceStatus = "PENDING";

    if (payment_type === "CASH") {
        if (paid_amount === invoiceTotal) {
            invoiceStatus = "PAID";
        } else if (paid_amount > 0) {
            invoiceStatus = "PARTIALLY_PAID";
        }
    } else if (payment_type === "CHEQUE") {
        invoiceStatus = "PENDING";
    } else if (payment_type === "PURCHASE_ORDER") {
        invoiceStatus = "PENDING";
    }

    // generate invoice id
    let uniqueId = cryptoRandomString({length: 15, type: "numeric"});
    while (await DB.invoice.findUnique({where: {id: uniqueId}})) {
        uniqueId = cryptoRandomString({length: 15, type: "numeric"});
    }

    // create invoice with nested items + payments
    const invoice = await DB.invoice.create({
        data: {
            id: uniqueId,
            customer_id: Number(customerId),
            status: invoiceStatus,
            invoice_items: {
                create: items.map((item) => ({
                    qty: item.qty,
                    selling_price: item.selling_price,
                    discount_amount: item.discount_amount,
                    stock: {connect: {id: item.stock_id}}
                }))
            },
            payment_history: {
                create: {
                    paid_amount: Number(payment_type === "PURCHASE_ORDER" ? 0 : paid_amount),
                    payment_type: payment_type,
                    status: payment_type === "CASH" ? "CLEARED" : "PENDING",
                    ...(payment_type === "CHEQUE" && chequeDetail
                        ? {
                            chequeDetail: {
                                create: {
                                    cheque_number: chequeDetail.cheque_number,
                                    bank_name: chequeDetail.bank_name,
                                    cheque_date: new Date(chequeDetail.cheque_date),
                                }
                            }
                        }
                        : {})
                }
            }
        },
        include: {
            invoice_items: true,
            payment_history: {include: {chequeDetail: true}}
        }
    });

    // update stock qty
    for (const item of items) {
        await DB.stock.update({
            where: {id: item.stock_id},
            data: {qty: {decrement: item.qty}}
        });
    }

    return invoice;
};

export const updatedInvoices = async (invoiceId, data) => {
    const {paid_amount, payment_type, chequeDetail} = data;

    const errors = [];
    if (!invoiceId) errors.push("Invoice ID is required.");
    if (paid_amount == null || isNaN(paid_amount) || paid_amount < 0) errors.push("Valid paid amount is required.");
    const validPaymentTypes = ["CASH", "CHEQUE"];
    if (!payment_type || !validPaymentTypes.includes(payment_type)) {
        errors.push(`Invalid payment type. Must be one of: ${validPaymentTypes.join(", ")}`);
    }

    if (payment_type === "CHEQUE" && !chequeDetail) {
        errors.push("Cheque details are required for cheque payments.");
    }

    if (errors.length > 0) {
        const error = new Error("Validation failed");
        error.errors = errors;
        throw error;
    }

    // Fetch the invoice
    const invoice = await DB.invoice.findUnique({
        where: {id: invoiceId},
        include: {
            invoice_items: true,
            payment_history: {include: {chequeDetail: true}}
        }
    });

    if (!invoice) {
        const error = new Error(`Invoice ID ${invoiceId} not found`);
        error.status = 404;
        throw error;
    }

    // Calculate total already paid (ignore rejected or expired cheques)
    const totalPaid = invoice.payment_history.reduce((sum, ph) => {
        if (
            ph.payment_type === "CHEQUE" &&
            (ph.status === "REJECTED" || ph.status === "EXPIRED")
        ) {
            return sum; // skip these
        }
        return sum + ph.paid_amount;
    }, 0);


    // Prevent overpayment
    if (totalPaid + Number(paid_amount) > invoice.total_amount) {
        const error = new Error("Paid amount exceeds total invoice amount.");
        error.status = 400;
        error.errors = [`Total paid (${totalPaid + Number(paid_amount)}) cannot exceed invoice total (${invoice.total_amount})`];
        throw error;
    }

    // Decide invoice status
    let invoiceStatus = "PENDING";

    if (payment_type === "CASH") {
        const totalPaid = invoice.payment_history.reduce((sum, ph) => {
            if (ph.payment_type === "CHEQUE" && (ph.status === "REJECTED" || ph.status === "EXPIRED")) {
                return sum;
            }
            return sum + ph.paid_amount;
        }, 0) + paid_amount;

        if (totalPaid === invoice.total_amount) {
            invoiceStatus = "PAID";
        } else if (totalPaid > 0) {
            invoiceStatus = "PARTIALLY_PAID";
        }
    } else if (payment_type === "CHEQUE") {
        invoiceStatus = "PENDING"; // always pending until cheque cleared
    }

    // Create a new payment history entry
    const newPayment = await DB.payment_History.create({
        data: {
            invoice_id: invoiceId,
            paid_amount: Number(paid_amount),
            payment_type,
            status: payment_type === "CASH" ? "CLEARED" : "PENDING",
            ...(payment_type === "CHEQUE" && chequeDetail
                ? {
                    chequeDetail: {
                        create: {
                            cheque_number: chequeDetail.cheque_number,
                            bank_name: chequeDetail.bank_name,
                            cheque_date: new Date(chequeDetail.cheque_date),
                        }
                    }
                }
                : {})
        },
        include: {chequeDetail: true}
    });

    // Update invoice status
    const updatedInvoice = await DB.invoice.update({
        where: {id: invoiceId},
        data: {status: invoiceStatus},
        include: {
            invoice_items: true,
            payment_history: {include: {chequeDetail: true}}
        }
    });

    return updatedInvoice;
};

export const updateChequePayment = async (paymentId, data) => {
    const {status} = data;

    const validStatuses = ["PENDING", "CLEARED", "REJECTED", "EXPIRED"];
    const errors = [];

    if (!paymentId) errors.push("Payment ID is required.");
    if (status && !validStatuses.includes(status)) {
        errors.push(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
    }
    if (errors.length > 0) {
        const error = new Error("Validation failed");
        error.errors = errors;
        throw error;
    }

    const chequePayment = await DB.cheque_Details.findUnique({
        where: {payment_id: paymentId}
    });

    if (!chequePayment) {
        const error = new Error(`Cheque details not found for Payment ID ${paymentId}`);
        error.status = 404;
        throw error;
    }

    // Check expiry before update
    if (chequePayment.cheque_date && new Date(chequePayment.cheque_date) < new Date()) {
        const error = new Error("Cheque has expired. Cannot update this payment.");
        error.status = 400;
        throw error;
    }

    let finalStatus = status;

    // Auto-expire logic
    if (chequePayment.cheque_date && new Date(chequePayment.cheque_date) < new Date()) {
        finalStatus = "EXPIRED";
    }

    // Update payment history
    await DB.payment_History.update({
        where: {id: paymentId},
        data: {
            status: finalStatus
        }
    });

    // Update cheque
    const updatedCheque = await DB.cheque_Details.update({
        where: {payment_id: paymentId},
        data: {
            status: finalStatus
        }
    });

    // If cleared, re-check invoice status
    if (finalStatus === "CLEARED") {
        const payment = await DB.payment_History.findUnique({
            where: {id: paymentId},
            include: {invoice: true},
        });

        if (payment) {
            const invoice = payment.invoice;

            // Get all payments for invoice
            const payments = await DB.payment_History.findMany({
                where: {invoice_id: invoice.id},
            });

            // Count only valid cleared payments
            const totalCleared = payments.reduce((sum, p) => {
                if (p.payment_type === "CASH" || (p.payment_type === "CHEQUE" && p.status === "CLEARED")) {
                    return sum + p.paid_amount;
                }
                return sum;
            }, 0);

            let invoiceStatus = "PENDING";
            if (totalCleared === invoice.total_amount) invoiceStatus = "PAID";
            else if (totalCleared > 0) invoiceStatus = "PARTIALLY_PAID";

            await DB.invoice.update({
                where: {id: invoice.id},
                data: {status: invoiceStatus},
            });
        }
    }

    return updatedCheque;
};

export const getPaymentHistoryByInvoiceId = async (invoiceId) => {
    if (!invoiceId) {
        const error = new Error("Invoice ID is required.");
        error.status = 400;
        throw error;
    }

    const paymentHistory = await DB.payment_History.findMany({
        where: {invoice_id: invoiceId},
        include: {chequeDetail: true}
    });

    if (!paymentHistory) {
        const error = new Error(`Invoice with ID ${invoiceId} not found.`);
        error.status = 404;
        throw error;
    }

    return paymentHistory;
};

export const createProductReturn = async (data) => {
    const {invoice_id, product_id, return_qty, reason} = data;

    if (!invoice_id) {
        throw new Error("Invoice ID is required.");
    }
    if (!product_id) {
        throw new Error("Product ID is required.");
    }
    if (!return_qty) {
        throw new Error("Return Quantity is required.");
    }

    // Fetch the invoice with payment history and invoice items
    const invoice = await DB.invoice.findUnique({
        where: {id: invoice_id},
        include: {
            invoice_items: {
                include: {
                    stock: {
                        include: {
                            product: true
                        }
                    }
                }
            },
            payment_history: true
        }
    });

    if (!invoice) {
        throw new Error("Invoice not found.");
    }

    const currentDate = new Date();
    const invoiceDate = new Date(invoice.created_at);
    const diffTime = Math.abs(currentDate - invoiceDate); // Difference in milliseconds
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convert ms to days

    if (diffDays > 14) {
        throw new Error("Product return period has expired. Returns are only allowed within 14 days of the invoice creation.");
    }

    const invoiceItem = invoice.invoice_items.find(item => item.stock && item.stock.product && item.stock.product.id === product_id);

    if (!invoiceItem) {
        throw new Error("Product not found in the invoice.");
    }

    if (return_qty > invoiceItem.qty - invoiceItem.returned_qty) {
        throw new Error("Return quantity cannot exceed purchased quantity.");
    }

    const refundAmount = ((invoiceItem.selling_price * return_qty) - (invoiceItem.discount_amount / invoiceItem.qty) * return_qty);

    // Create the product return record
    const productReturn = await DB.product_Return.create({
        data: {
            invoice_id,
            product_id,
            return_qty,
            reason,
            return_item: {
                create: [{
                    returned_qty: return_qty,
                    selling_price: invoiceItem.selling_price,
                    discount_amount: (invoiceItem.discount_amount / invoiceItem.qty) * return_qty
                }]
            }
        }
    });

    // Update the returned quantity for the invoice item
    await DB.invoice_Item.update({
        where: {id: invoiceItem.id},
        data: {returned_qty: {increment: return_qty}}
    });

    // Find the stock item based on the product_id and get its ID
    const stock = await DB.stock.findFirst({
        where: {
            product_id: product_id
        }
    });

    if (!stock) {
        throw new Error("Stock for the product not found.");
    }

    // Restock the returned item in stock
    await DB.stock.update({
        where: {id: stock.id},  // Use stock ID here
        data: {qty: {increment: return_qty}}
    });

    // Add payment history with negative amount for the refund
    await DB.payment_History.create({
        data: {
            paid_amount: -refundAmount,  // Negative amount for the refund
            payment_type: 'CASH',
            status: 'RETURN',
            invoice: {
                connect: {id: invoice.id}  // Properly connect the invoice using its ID
            }
        }
    });

    // Recalculate total invoice amount after returns
    let totalAmount = 0;
    invoice.invoice_items.forEach(item => {
        const soldQty = item.qty - (item.returned_qty || 0) - (item.id === invoiceItem.id ? return_qty : 0);
        const perUnitDiscount = (item.discount_amount || 0) / (item.qty || 1);
        totalAmount += soldQty * (item.selling_price - perUnitDiscount);
    });

    // Recalculate total paid amount
    const updatedPaymentHistory = await DB.payment_History.findMany({ where: { invoice_id } });
    const totalPaid = updatedPaymentHistory.reduce((sum, ph) => sum + ph.paid_amount, 0);

    // Use Math.round to avoid float mismatches
    const round2 = (num) => Math.round(num * 100) / 100;

    const totalAmountRounded = round2(totalAmount);
    const totalPaidRounded = round2(totalPaid);

    let updatedStatus = "PENDING";
    if (totalPaidRounded <= 0) {
        updatedStatus = "PENDING";
    } else if (totalPaidRounded >= totalAmountRounded) {
        updatedStatus = "PAID";
    } else {
        updatedStatus = "PARTIALLY_PAID";
    }

    // Update the invoice status after the return
    await DB.invoice.update({
        where: {id: invoice_id},
        data: {status: updatedStatus}
    });

    return {
        productReturn,
        refundAmount
    };
};
