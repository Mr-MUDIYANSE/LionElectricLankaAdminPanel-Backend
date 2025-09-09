import {
    createStocks,
    getAllStocks,
    getFilteredStock,
    getFilteredStockVendor,
    updateStocks
} from "../service/stock.service.js";

export const getAllStock = async (req, res) => {
    try {
        const products = await getAllStocks();
        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No stock found.',
                errors: ['No stocks available.'],
                data: null
            });
        }
        return res.status(200).json({
            success: true,
            message: 'All stock retrieved successfully.',
            data: products
        });
    } catch (err) {
        console.error('Error retrieving stocks:', err); // Logging the error for debugging
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const getFilterStock = async (req, res) => {
    const categoryId = req.params.id;

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing category ID parameter.',
            errors: ['Category ID must be a valid number.'],
            data: null
        });
    }

    try {
        const products = await getFilteredStock(categoryId);

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No filtered stock found.',
                errors: ['No stock matching the filter was found.'],
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Filtered stock retrieved successfully.',
            data: products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const getFilterStockByVendor = async (req, res) => {
    const vendorId = req.params.id;

    if (!vendorId || isNaN(vendorId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing category id parameter.',
            errors: ['Vendor id must be a valid number.'],
            data: null
        });
    }

    try {
        const products = await getFilteredStockVendor(vendorId);

        if (!products || products.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No filtered stock found.',
                errors: ['No stock matching the filter was found.'],
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Filtered stock retrieved successfully.',
            data: products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const createStock = async (req, res) => {
    const productId = Number(req.params.productId);
    const vendorId = Number(req.params.vendorId);
    const data = req.body;

    // Validate the productId
    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing product ID parameter.',
            errors: ['Product ID must be a valid number.'],
            data: null
        });
    }

    // Validate the data
    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Stock data required.',
            errors: ['Please provide stock data.'],
            data: null
        });
    }

    try {
        // Call the createStocks function and get the stock and action
        const { stock, action } = await createStocks(productId, vendorId, data);

        if (action === 'created') {
            return res.status(201).json({
                success: true,
                message: 'New stock created successfully.',
                data: stock
            });
        }

        // If action is 'updated'
        return res.status(200).json({
            success: true,
            message: 'Stock quantity updated successfully.',
            data: stock
        });
    } catch (err) {
        // Check for product or vendor not found
        if (err.status === 404) {
            return res.status(404).json({
                success: false,
                message: err.message,
                errors: [err.message],
                data: null
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const updateStock = async (req, res) => {
    const stockId = Number(req.params.id);
    const data = req.body;

    if (!stockId || isNaN(stockId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing stock ID parameter.',
            errors: ['Stock ID must be a valid number.'],
            data: null
        });
    }

    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'At least one data field is required to update stock.',
            errors: ['Stock data is required.'],
            data: null
        });
    }

    try {
        const updatedStock = await updateStocks(stockId, data);

        if (!updatedStock) {
            return res.status(404).json({
                success: false,
                message: 'Stock not found.',
                errors: ['Invalid stock ID or stock does not exist.'],
                data: null
            });
        }

        res.status(200).json({
            success: true,
            message: 'Stock updated successfully.',
            data: updatedStock
        });
    } catch (err) {
        console.log(err)
        if (err.errors) {
            return res.status(400).json({
                success: false,
                message: err.message,
                errors: err.errors || [],
                data: null
            });
        }
        res.status(500).json({
            success: false,
            message: 'Internal Server Error.',
            errors: "Internal Server Error",
            data: null
        });
    }
};