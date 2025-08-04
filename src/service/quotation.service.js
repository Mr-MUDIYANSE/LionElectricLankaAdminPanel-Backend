import DB from "../db/db.js";
import {startOfMonth, endOfMonth} from 'date-fns';
import cryptoRandomString from "crypto-random-string";

export const getAllQuotations = async (date) => {
    let whereClause = {
        status_id: 1,
    };

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

    const quotation = await DB.quotation.findMany({
        orderBy: {created_at: "desc"},
        where: whereClause,
        include: {
            customer: true,
            quotation_items: {
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

    return quotation;
};

export const getQuotationById = async (quotationId) => {
    if (!quotationId) {
        throw new Error("Quotation ID is required");
    }

    const quotation = await DB.quotation.findUnique({
        where: {
            id: quotationId,
            status_id: 1
        },
        include: {
            customer: true,
            quotation_items: {
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
        },
    });

    if (!quotation) {
        const error = new Error("Quotation not found");
        error.status = 404;
        return null;
    }

    return quotation;
};

export const createQuotations = async (customerId, data) => {
    const {total_amount, items} = data;

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

    if (!Array.isArray(items) || items.length === 0) errors.push("At least one quotation item required.");
    if (total_amount < 0) errors.push("Total amount is required.");

    if (errors.length > 0) {
        const error = new Error("Validation failed");
        error.errors = errors;
        error.status = 400; // Bad Request
        throw error;
    }

    // Validate stock before creating quotation
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

    const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    // Generate a unique quotation ID
    let uniqueId = cryptoRandomString({ length: 15, characters: uppercaseLetters });

    // Check if the generated ID already exists
    let existingQuotation = await DB.quotation.findUnique({
        where: {id: uniqueId}
    });

    // If the ID exists, regenerate until a unique one is found
    while (existingQuotation) {
        uniqueId = cryptoRandomString({ length: 15, characters: uppercaseLetters });
        existingQuotation = await DB.quotation.findUnique({
            where: {id: uniqueId}
        });
    }

    const today = new Date();
    const expiresAt = new Date(today.setDate(today.getDate() + 30)); // Adds 30 days to today

    // Create quotation with Items
    const quotation = await DB.quotation.create({
        data: {
            id: uniqueId,
            total_amount: Number(total_amount),
            expires_at: expiresAt,
            customer_id: Number(customerId),
            status_id: 1,
            quotation_items: {
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
            quotation_items: true
        }
    });

    return quotation;
};

export const updatedQuotations = async (quotationId, data) => {
    const {total_amount} = data;
    console.log(quotationId)
    const errors = [];
    if (!quotationId) errors.push("Quotation id is required.");
    if (!data) errors.push("Data is required to update.");
    if (total_amount == null || isNaN(total_amount)) errors.push("Valid total amount is required.");

    if (errors.length > 0) {
        const error = new Error("Validation failed");
        error.errors = errors;
        throw error;
    }

    // Fetch the existing quotation
    const quotation = await DB.quotation.findUnique({
        where: {id: quotationId},
        include: {
            quotation_items: true,
        },
    });

    if (!quotation) {
        const error = new Error(`Quotation ID ${quotationId} not found`);
        error.status = 404;
        throw error;
    }

    const updatedQuotation = await DB.quotation.update({
        where: {id: quotationId},
        data: {
            total_amount: total_amount,
        },
        include: {
            customer: true,
            quotation_items: {
                include: {
                    stock: {
                        include: {
                            product: true,
                        },
                    },
                },
            },
        },
    });

    return updatedQuotation;
};

export const deleteQuotationById = async (quotationId) => {
    const errors = [];

    if (!quotationId) errors.push("Quotation id is required.");

    if (errors.length > 0) {
        const error = new Error("Validation failed");
        error.errors = errors;
        throw error;
    }

    // Fetch the existing quotation data
    const quotation = await DB.quotation.findUnique({
        where: {id: quotationId}
    });

    if (!quotation) {
        const error = new Error(`Quotation ID ${quotationId} not found`);
        error.status = 404;
        return null;
    }

    const deletedQuotation = await DB.quotation.update({
        where: {id: quotationId},
        data: {
            status_id: 2,
        },
        include: {
            customer: true,
            quotation_items: {
                include: {
                    stock: {
                        include: {
                            product: true,
                        },
                    },
                },
            },
        },
    });

    return deletedQuotation;
};
