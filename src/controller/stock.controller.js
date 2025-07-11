import {
    createProduct, getAllProduct,
    getFilteredProducts,
    getFilteredProductsByTitle,
    getProducts,
    updateProducts
} from "../service/product.service.js";
import {getAllStocks, updateStocks} from "../service/stock.service.js";

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

export const createStock = async (req, res) => {
    const categoryId = Number(req.params.id);
    const data = req.body;

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Category ID must be a number.'],
            data: null
        });
    }

    if (!data){
        return res.status(400).json({
            success: false,
            message: 'Please enter product data.',
            errors: ['product data required.'],
            data: null
        });
    }

    try {
        const newProduct = await createProduct(categoryId, data);
        return res.status(200).json({
            success: true,
            message: 'Product created successfully.',
            data: newProduct
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