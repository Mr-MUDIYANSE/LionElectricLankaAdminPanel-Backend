import DB from "../db/db.js";
import {startOfMonth, endOfMonth} from 'date-fns';
import cryptoRandomString from "crypto-random-string";

export const getAllInvoices = async (date) => {
    let whereClause = {};

    if (date) {
        // If only year-month provided (e.g., '2025-07')
        if (/^\d{4}-\d{2}$/.test(date)) {
            const start = new Date(`${date}-01T00:00:00`);
            const end = endOfMonth(start);
            whereClause.created_at = {
                gte: start,
                lte: end
            };
        }
        // If full date provided (e.g., '2025-07-21')
        else if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const dayStart = new Date(`${date}T00:00:00`);
            const dayEnd = new Date(`${date}T23:59:59`);
            whereClause.created_at = {
                gte: dayStart,
                lte: dayEnd
            };
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
    const {total_amount, paid_amount, payment_type, items, chequeDetail} = data;

    console.log(data)

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
    if (total_amount <= 0) errors.push("Total amount must be greater than zero.");
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

    // decide invoice status
    let invoiceStatus = "PENDING";

    if (payment_type === "CASH") {
        if (paid_amount === total_amount) {
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
            total_amount: Number(total_amount),
            customer_id: Number(customerId),
            status: invoiceStatus,
            invoice_items: {
                create: items.map((item) => ({
                    qty: item.qty,
                    selling_price: item.selling_price,
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
            where: { id: paymentId },
            include: { invoice: true },
        });

        if (payment) {
            const invoice = payment.invoice;

            // Get all payments for invoice
            const payments = await DB.payment_History.findMany({
                where: { invoice_id: invoice.id },
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
                where: { id: invoice.id },
                data: { status: invoiceStatus },
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