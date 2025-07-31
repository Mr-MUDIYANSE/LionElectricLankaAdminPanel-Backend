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
    try {
        const stocks = await DB.stock.findMany({
            where: {
                status_id: 1,
            },
            include: {
                vendor: true,
                product: {
                    include: {
                        status: true,
                        brand: true,
                        main_category: true,
                        phase: true,
                        speed: true,
                        motor_type: true,
                        size: true,
                        gear_box_type: true,
                    },
                },
            },
        });

        return stocks;
    } catch (err) {
        throw new Error('An error occurred while retrieving the stocks');
    }
};

export const getFilteredStock = async (categoryId) => {

    if (!categoryId || isNaN(categoryId)) {
        throw new Error('Invalid Category ID');
    }

    try {
        const stocks = await DB.stock.findMany({
            where: {
                status_id: 1,
                product: {
                    main_category_id: Number(categoryId),
                },
            },
            include: {
                vendor: true,
                product: {
                    include: {
                        status: true,
                        brand: true,
                        main_category: true,
                        phase: true,
                        speed: true,
                        motor_type: true,
                        size: true,
                        gear_box_type: true,
                    },
                },
            },
        });

        return stocks;

    } catch (err) {
        throw new Error('An error occurred while retrieving stocks');
    }
};

export const getFilteredStockVendor = async (vendorId) => {

    if (!vendorId || isNaN(vendorId)) {
        throw new Error('Invalid Category ID');
    }

    try {
        const stocks = await DB.stock.findMany({
            where: {
                status_id: 1,
                vendor_id:Number(vendorId)
            },
            include: {
                vendor: true,
                product: {
                    include: {
                        status: true,
                        brand: true,
                        main_category: true,
                        phase: true,
                        speed: true,
                        motor_type: true,
                        size: true,
                        gear_box_type: true,
                    },
                },
            },
        });

        return stocks;

    } catch (err) {
        throw new Error('An error occurred while retrieving stocks');
    }
};

export const createStocks = async (productId, vendorId, data) => {
    const errors = [];

    if (!productId || isNaN(productId) || Number(productId) <= 0) {
        errors.push('Product id must be valid.');
    }

    if (!vendorId || isNaN(vendorId) || Number(vendorId) <= 0) {
        errors.push('Vendor id must be valid.');
    }

    const {unit_buying_price, unit_selling_price, qty} = data;

    if (!unit_buying_price || isNaN(unit_buying_price) || unit_buying_price <= 0) {
        errors.push('Unit buying price must be a valid price.');
    }

    if (!unit_selling_price || isNaN(unit_selling_price) || unit_selling_price <= 0) {
        errors.push('Unit selling price must be a valid price.');
    }

    if (!qty || isNaN(qty) || qty <= 0) {
        errors.push('Quantity must be valid.');
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Validation Error',
            errors,
            data: null
        });
    }

    const existingProduct = await DB.product.findUnique({
        where: {id: Number(productId)},
    });

    if (!existingProduct) {
        return res.status(404).json({
            success: false,
            message: 'Product not found.',
            errors: ['Product id does not exist.'],
            data: null
        });
    }

    const existingStock = await DB.stock.findFirst({
        where: {
            product_id: Number(productId),
            vendor_id: Number(vendorId),
            unit_buying_price: Number(unit_buying_price),
            unit_selling_price: Number(unit_selling_price),
        },
    });

    if (existingStock) {
        const updatedStock = await DB.stock.update({
            where: {id: existingStock.id},
            data: {
                qty: existingStock.qty + Number(qty),
                status_id: 1
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Stock quantity updated.',
            data: updatedStock
        });
    } else {
        const newStock = await DB.stock.create({
            data: {
                product_id: Number(productId),
                vendor_id: Number(vendorId),
                unit_buying_price: Number(unit_buying_price),
                unit_selling_price: Number(unit_selling_price),
                qty: Number(qty),
                status_id: 1
            },
        });

        return res.status(201).json({
            success: true,
            message: 'New stock created.',
            data: newStock
        });
    }

};

export const updateStocks = async (stockId, data) => {
    if (!stockId || isNaN(stockId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid stock ID.',
            errors: ['Stock id must be a valid number.'],
            data: null
        });
    }

    const stockUpdateData = {};
    if (data.unit_buying_price) stockUpdateData.unit_buying_price = data.unit_buying_price;
    if (data.unit_selling_price) stockUpdateData.unit_selling_price = data.unit_selling_price;
    if (data.qty) stockUpdateData.qty = data.qty;

    if (Object.keys(stockUpdateData).length > 0) {
        const stock = await DB.stock.findUnique({
            where: {id: Number(stockId)}
        });

        if (!stock) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found.',
                errors: ['Invalid stock id'],
                data: null
            });
        }

        const updatedStock = await DB.stock.update({
            where: {id: Number(stockId)},
            data: stockUpdateData,
            include: {
                product: {
                    include: {
                        status: true,
                        brand: true,
                        main_category: true,
                        phase: true,
                        speed: true,
                        motor_type: true,
                        size: true,
                        gear_box_type: true,
                    },
                },
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Stock updated successfully.',
            data: removeNullFields(updatedStock)
        });
    }
};