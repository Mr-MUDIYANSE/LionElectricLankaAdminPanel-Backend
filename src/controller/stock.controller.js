import {
    createProduct, getAllProduct,
    getFilteredProducts,
    getFilteredProductsByTitle,
    getProducts,
    updateProducts
} from "../service/product.service.js";
import {createStocks, getAllStocks, getFilteredStock, updateStocks} from "../service/stock.service.js";

export const getAllStock = async (req, res) => {
    try {
        const products = await getAllStocks();
        res.status(200).json({
            success: true,
            message: 'All stock retrieved',
            data: products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
}

export const getFilterStock = async (req, res) => {
    try {
        const categoryId = req.params.id;

        const products = await getFilteredStock(categoryId);

        res.status(200).json({
            success: true,
            message: 'Filtered stock retrieved',
            data: products
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
};


export const createStock = async (req, res) => {
    const productId = Number(req.params.id);
    const data = req.body;

    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing id parameter.',
            errors: ['Product id must be a number.'],
            data: null
        });
    }

    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Please enter stock data.',
            errors: ['Stock data required.'],
            data: null
        });
    }

    try {
        const { stock, action } = await createStocks(productId, data);

        return res.status(200).json({
            success: true,
            message: action === 'updated' ? 'Quantity updated for existing stock.' : 'New stock created.',
            data: stock
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
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
            message: 'Invalid or missing id parameter.',
            errors: ['Stock id must be a number.'],
            data: null
        });
    }

    if (!data){
        return res.status(400).json({
            success: false,
            message: 'At least one data is required to update.',
            errors: ['stock data required.'],
            data: null
        });
    }

    try {
        const updatedStock = await updateStocks(stockId, data);
        return res.status(200).json({
            success: true,
            message: 'Stock updated successfully.',
            data: updatedStock
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
};