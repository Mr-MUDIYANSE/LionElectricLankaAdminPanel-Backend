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
            payment_method: true,
            payment_status: true,
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
            payment_method: true,
            payment_status: true,
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
    const {paid_amount, total_amount, payment_method_id, items, cheque_date} = data;

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
    if (paid_amount < 0) errors.push("Paid amount is required.");
    if (total_amount < 0) errors.push("Total amount is required.");
    if (!payment_method_id) errors.push("Payment method ID is required.");

    if ((payment_method_id === 4 || payment_method_id === 5) && !cheque_date) {  // Assuming '4,5' is the cheque payment method
        errors.push("Cheque date is required for cheque payments.");
    }

    if (errors.length > 0) {
        const error = new Error("Validation failed");
        error.errors = errors;
        throw error;
    }

    // Validate stock before creating invoice
    for (const item of items) {
        const stock = await DB.stock.findUnique({
            where: {
                id: item.stock_id,
                status_id: 1
            },
            include: {
                product: true
            }
        });

        if (!stock) {
            throw new Error(`Stock ID ${item.stock_id} not found`);
        }

        if (stock.qty < item.qty) {
            throw new Error(
                `Insufficient stock for product "${stock.product.title}". Available: ${stock.qty}, Required: ${item.qty}`
            );
        }
    }

    // Validate paid_amount
    if (Number(paid_amount) > total_amount) {
        const error = new Error("Paid amount cannot exceed total invoice value.");
        error.errors = [`Paid amount (${paid_amount}) exceeds total value (${total_amount}).`];
        throw error;
    }

    // Set payment_status_id based on paid_amount vs total
    let resolved_payment_status_id;
    if (Number(paid_amount) === total_amount) {
        resolved_payment_status_id = 1; // Paid
    } else {
        resolved_payment_status_id = 2; // Pending
    }

    // Generate a unique invoice ID
    let uniqueId = cryptoRandomString({length: 15, type: 'numeric'});

    // Check if the generated ID already exists
    let existingInvoice = await DB.invoice.findUnique({
        where: {id: uniqueId}
    });

    // If the ID exists, regenerate until a unique one is found
    while (existingInvoice) {
        uniqueId = cryptoRandomString({length: 15, type: 'numeric'});
        existingInvoice = await DB.invoice.findUnique({
            where: {id: uniqueId}
        });
    }

    // Create Invoice with Items
    const invoice = await DB.invoice.create({
        data: {
            id: uniqueId,
            paid_amount: Number(paid_amount),
            total_amount: Number(total_amount),
            customer_id: Number(customerId),
            payment_method_id: Number(payment_method_id),
            payment_status_id: Number(resolved_payment_status_id),
            cheque_date: payment_method_id === 4 || 5 ? cheque_date : null, // Only for cheque payment
            invoice_items: {
                create: items.map(item => ({
                    qty: item.qty,
                    selling_price: item.selling_price,
                    stock: {
                        connect: {id: item.stock_id}
                    }
                }))
            }
        },
        include: {
            invoice_items: true
        }
    });

    // Deduct Stock Quantities and update status if qty becomes 0
    for (const item of items) {
        // First, deduct the quantity
        const updatedStock = await DB.stock.update({
            where: {id: item.stock_id},
            data: {
                qty: {
                    decrement: item.qty
                }
            }
        });

        // If quantity is now 0, mark status as INACTIVE
        if (updatedStock.qty === 0) {
            await DB.stock.update({
                where: {id: item.stock_id},
                data: {
                    status_id: 2
                }
            });
        }
    }


    return invoice;
};

export const updatedInvoices = async (invoiceId, data) => {
    const {paid_amount} = data;

    const errors = [];
    if (!invoiceId) errors.push("Invoice ID is required.");
    if (paid_amount == null || isNaN(paid_amount)) errors.push("Valid paid amount is required.");

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
            payment_status: true
        },
    });

    if (!invoice) {
        const error = new Error(`Invoice ID ${invoiceId} not found`);
        error.status = 404;
        throw error;
    }

    // Calculate total amount
    const totalAmount = invoice.invoice_items.reduce((sum, item) => {
        return sum + item.selling_price * item.qty;
    }, 0);

    // Calculate new paid amount
    const updatedPaidAmount = Number(invoice.paid_amount || 0) + Number(paid_amount);

    if (updatedPaidAmount > totalAmount) {
        const error = new Error("Paid amount cannot be greater than total invoice amount.");
        error.status = 400;
        error.errors = [`Total paid amount (${updatedPaidAmount}) exceeds total invoice amount (${totalAmount})`];
        throw error;
    }

    // Set payment status: 1 = Paid, 2 = Advanced
    const payment_status_id = updatedPaidAmount === totalAmount ? 1 : 2;

    // Update the invoice
    const updatedInvoice = await DB.invoice.update({
        where: {id: invoiceId},
        data: {
            paid_amount: updatedPaidAmount,
            payment_status: {
                connect: {id: payment_status_id}
            },
        },
        include: {
            customer: true,
            invoice_items: {
                include: {
                    stock: {
                        include: {
                            product: true
                        }
                    }
                }
            }
        }
    });

    return updatedInvoice;
};