import {
    createProduct, getAllProduct,
    getFilteredProducts,
    getFilteredProductsByTitle,
    getProducts, productDelete,
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
            message: "Internal Server Error",
            errors: "Internal Server Error",
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
            message: 'All products retrieved successfully.',
            data: products
        });
    } catch (err) {
        if (err.message === 'Invalid category ID') {
            return res.status(404).json({
                success: false,
                message: 'Category not found.',
                errors: "Internal Server Error",
                data: null
            });
        } else if (err.message === 'No products found for this category') {
            return res.status(404).json({
                success: false,
                message: 'No products found for the given category.',
                errors: "Internal Server Error",
                data: null
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Internal server error.',
                errors: "Internal Server Error",
                data: null
            });
        }
    }
};

export const filterProducts = async (req, res) => {
    const categoryId = Number(req.params.id);
    const filters = req.query;

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Category ID must be a valid number.'],
            data: null
        });
    }

    try {
        const filteredProducts = await getFilteredProducts(categoryId, filters);

        return res.status(200).json({
            success: true,
            message: 'Filtered products retrieved successfully.',
            data: filteredProducts
        });
    } catch (err) {
        if (err.message === 'No products') {
            return res.status(404).json({
                success: false,
                message: 'No products found for the given filters.',
                errors: "Internal Server Error",
                data: null
            });
        } else if (err.message === 'Invalid Category ID') {
            return res.status(400).json({
                success: false,
                message: 'Category ID must be a valid number.',
                errors: "Internal Server Error",
                data: null
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Internal server error.',
                errors: "Internal Server Error",
                data: null
            });
        }
    }
};

export const filterProductsByTitle = async (req, res) => {
    const categoryId = Number(req.params.id);
    const { product_title } = req.query;

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Category ID must be a number.'],
            data: null
        });
    }

    if (!product_title || product_title.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Please enter a product title.',
            errors: ['Product title is required.'],
            data: null
        });
    }

    try {
        const filteredProducts = await getFilteredProductsByTitle(categoryId, product_title);
        return res.status(200).json({
            success: true,
            message: 'Filtered products retrieved successfully.',
            data: filteredProducts
        });
    } catch (err) {
        if (err.message === 'No products') {
            return res.status(404).json({
                success: false,
                message: 'No products found matching the title.',
                errors: "Internal Server Error",
                data: null
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Internal server error.',
                errors: "Internal Server Error",
                data: null
            });
        }
    }
};

export const createNewProduct = async (req, res) => {
    const categoryId = Number(req.params.id);
    const data = req.body;

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Category ID must be a valid number.'],
            data: null
        });
    }

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Please enter product data.',
            errors: ['Product data is required.'],
            data: null
        });
    }

    try {
        const newProduct = await createProduct(categoryId, data);
        return res.status(201).json({
            success: true,
            message: 'Product created successfully.',
            data: newProduct
        });
    } catch (err) {
        if (err.message === 'Product with the same details already exists.') {
            return res.status(409).json({
                success: false,
                message: 'Product already exists.',
                errors: "Internal Server Error",
                data: null
            });
        } else if (err.message === 'Invalid category ID.') {
            return res.status(404).json({
                success: false,
                message: 'Category not found.',
                errors: "Internal Server Error",
                data: null
            });
        } else if (err.message === 'Validation error') {
            return res.status(400).json({
                success: false,
                message: 'Validation error.',
                errors: err.errors || [],
                data: null
            });
        } else {
            return res.status(500).json({
                success: false,
                message: 'Internal server error.',
                errors: err.errors || [],
                data: null
            });
        }
    }
};

export const updateProduct = async (req, res) => {
    const { categoryId, productId } = req.params;
    const data = req.body;

    if (!categoryId || isNaN(categoryId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing category ID.',
            errors: ['Category ID must be a number.'],
            data: null
        });
    }

    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing product ID.',
            errors: ['Product ID must be a number.'],
            data: null
        });
    }

    if (!data || Object.keys(data).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'No data provided to update the product.',
            errors: ['At least one field is required for the update.'],
            data: null
        });
    }

    try {
        const updatedProduct = await updateProducts(categoryId, productId, data);

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully.',
            data: updatedProduct
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const deleteProduct = async (req, res) => {
    const { productId } = req.params;

    if (!productId || isNaN(productId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Product ID must be a number.'],
            data: null
        });
    }

    try {
        const deletedProduct = await productDelete(productId);
        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully.',
            data: deletedProduct
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};