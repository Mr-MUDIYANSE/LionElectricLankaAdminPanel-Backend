import {
    createProduct, getAllProduct,
    getFilteredProducts,
    getFilteredProductsByTitle,
    getProducts,
    updateProducts
} from "../service/product.service.js";

export const getAllProducts = async (req, res) => {
    try {
        const products = await getAllProduct();
        res.status(200).json({
            success: true,
            message: 'All products retrieved',
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

export const getProductsByCategoryId = async (req, res) => {
    const categoryId = Number(req.params.id);

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Category ID must be a number.'],
            data: null
        });
    }
    try {
        const products = await getProducts(categoryId);
        res.status(200).json({
            success: true,
            message: 'All products retrieved',
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

export const filterProducts = async (req, res) => {
    const categoryId = Number(req.params.id);
    const filters = req.query;

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Category ID must be a number.'],
            data: null
        });
    }

    try {

        const filteredProducts = await getFilteredProducts(categoryId, filters);

        return res.status(200).json({
            success: true,
            message: 'Filtered products retrieved',
            data: filteredProducts
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

export const filterProductsByTitle = async (req, res) => {
    const categoryId = Number(req.params.id);
    const {product_title} = req.query;

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Category ID must be a number.'],
            data: null
        });
    }

    if (product_title ===''){
        return res.status(400).json({
            success: false,
            message: 'Please enter product title.',
            errors: ['product title required.'],
            data: null
        });
    }

    try {
        const filteredProducts = await getFilteredProductsByTitle(categoryId, product_title);
        return res.status(200).json({
            success: true,
            message: 'Filtered products retrieved',
            data: filteredProducts
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

export const createNewProduct = async (req, res) => {
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

export const updateProduct = async (req, res) => {
    const productId = Number(req.params.id);
    const data = req.body;

    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Product ID must be a number.'],
            data: null
        });
    }

    if (!data){
        return res.status(400).json({
            success: false,
            message: 'At least one data is required to update.',
            errors: ['product data required.'],
            data: null
        });
    }

    try {
        const updatedProduct = await updateProducts(productId, data);
        return res.status(200).json({
            success: true,
            message: 'Product updated successfully.',
            data: updatedProduct
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