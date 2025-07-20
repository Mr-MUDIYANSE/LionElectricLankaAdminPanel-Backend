import DB from "../db/db.js";

// function to recursively remove null or undefined fields
const removeNullFields = (obj) => {
    // Convert Date to string
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (Array.isArray(obj)) {
        return obj.map(removeNullFields).filter(item => item !== null);
    } else if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            const value = removeNullFields(obj[key]);
            if (value !== null && value !== undefined) {
                cleaned[key] = value;
            }
        }
        return cleaned;
    } else {
        return obj === null ? undefined : obj;
    }
};

export const getAllStocks = async () => {
    const stocks = await DB.stock.findMany({
        where: {
            status_id: 1,
        },
        include: {
            product: {
                include: {
                    status: true,
                    brand: true,
                    category_config: {
                        include: {
                            main_category: true,
                            phase: true,
                            speed: true,
                            horse_power: true,
                            motor_type: true,
                            kilo_watt: true,
                            size: true,
                            gear_box_type: true,
                        },
                    },
                },
            },
        },
    });

    if (!stocks || stocks.length === 0) {
        const error = new Error("No stocks");
        error.errors = ["No stocks found"];
        throw error;
    }

    return removeNullFields(stocks);
};

export const getFilteredStock = async (categoryId) => {
    if (!categoryId || isNaN(categoryId)) {
        const error = new Error('Invalid Category ID');
        error.errors = ['Category ID must be a valid number.'];
        throw error;
    }

    const stocks = await DB.stock.findMany({
        where: {
            status_id: 1,
            product: {
                category_config: {
                    main_category_id: Number(categoryId),
                },
            },
        },
        include: {
            product: {
                include: {
                    status: true,
                    brand: true,
                    category_config: {
                        include: {
                            main_category: true,
                            phase: true,
                            speed: true,
                            horse_power: true,
                            motor_type: true,
                            kilo_watt: true,
                            size: true,
                            gear_box_type: true,
                        },
                    },
                },
            },
        },
    });

    if (!stocks || stocks.length === 0) {
        const error = new Error("No stocks");
        error.errors = ["No stocks found"];
        throw error;
    }

    return removeNullFields(stocks);
};

export const createStocks = async (productId, data) => {
    const errors = [];

    if (!productId || isNaN(productId) || Number(productId) <= 0) {
        errors.push('Product id must be a valid.');
    }

    const { unit_buying_price, unit_selling_price, qty } = data;

    if (!unit_buying_price || isNaN(unit_buying_price) || unit_buying_price <= 0) {
        errors.push('Unit buying price must be a valid price.');
    }

    if (!unit_selling_price || isNaN(unit_selling_price) || unit_selling_price <= 0) {
        errors.push('Unit selling price must be a valid price.');
    }

    if (!qty || isNaN(qty) || qty <= 0) {
        errors.push('Quantity must be a valid.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation Error');
        error.errors = errors;
        throw error;
    }

    // Check if product exists
    const existingProduct = await DB.product.findUnique({
        where: { id: Number(productId) },
    });

    if (!existingProduct) {
        const error = new Error('Product not found.');
        error.errors = ['Provided product id does not exist.'];
        throw error;
    }

    const existingStock = await DB.stock.findFirst({
        where: {
            product_id: Number(productId),
            unit_buying_price: Number(unit_buying_price),
            unit_selling_price: Number(unit_selling_price),
        },
    });

    if (existingStock) {
        const updatedStock = await DB.stock.update({
            where: { id: existingStock.id },
            data: {
                qty: existingStock.qty + Number(qty),
                status_id:1
            },
        });

        return { stock: updatedStock, action: 'updated' };
    } else {
        const newStock = await DB.stock.create({
            data: {
                product_id: Number(productId),
                unit_buying_price: Number(unit_buying_price),
                unit_selling_price: Number(unit_selling_price),
                qty: Number(qty),
                status_id:1
            },
        });

        return { stock: newStock, action: 'created' };
    }
};

export const updateStocks = async (stockId, data) => {
    if (!stockId || isNaN(stockId)) {
        const error = new Error('Invalid stock ID');
        error.errors = ['Stock id must be a number'];
        throw error;
    }

    // Prepare stock update fields
    const stockUpdateData = {};
    if (data.unit_buying_price) stockUpdateData.unit_buying_price = data.unit_buying_price;
    if (data.unit_selling_price) stockUpdateData.unit_selling_price = data.unit_selling_price;

    // If there’s config data to update
    if (Object.keys(stockUpdateData).length > 0) {
        const stock = await DB.stock.findUnique({
            where: {id: Number(stockId)}
        });

        if (!stock) {
            const error = new Error('Stock not found');
            error.errors = ['Invalid stock id'];
            throw error;
        }

        // Update the stock
        const updatedProduct = await DB.stock.update({
            where: {id: Number(stockId)},
            data: stockUpdateData,
            include: {
                product: {
                    include: {
                        status: true,
                        brand: true,
                        category_config: {
                            include: {
                                main_category: true,
                                phase: true,
                                speed: true,
                                horse_power: true,
                                motor_type: true,
                                kilo_watt: true,
                                size: true,
                                gear_box_type: true,
                            },
                        },
                    },
                },
            },
        });
        return removeNullFields(updatedProduct);
    }
};