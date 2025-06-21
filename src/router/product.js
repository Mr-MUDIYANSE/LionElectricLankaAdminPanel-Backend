import { Router } from 'express';
import { commonParamValidate, commonValidate } from '../utils/validatorMethod.js';
import DB from '../db/db.js';
import { matchedData, validationResult } from 'express-validator';
import { commonError } from '../utils/error-creator.js';

const productRouter = Router();

// GET all products
productRouter.get('/all', async (_, res) => {
    try {
        const allProducts = await DB.product.findMany({
            include: {
                User: {
                    select: {
                        Id: true,
                        Name: true,
                        Username: true
                    }
                }
            },
        });
        return res.status(200).json({
            message: "All products",
            data: allProducts
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
});

// GET product by ID
productRouter.get('/:id', commonParamValidate("id"), async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const err = commonError(error.array());
        return res.status(400).json({
            message: "Validation error",
            error: err,
            data: null
        });
    }

    const data = matchedData(req);

    try {
        const product = await DB.product.findUnique({
            include: {
                User: {
                    select: {
                        Id: true,
                        Name: true,
                        Username: true
                    }
                }
            },
            where: {
                Id: Number(data.id)
            }
        });

        return res.status(200).json({
            message: "Product data",
            data: product
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
});

//GET products by user id
productRouter.get('/all-by-user/:id', commonParamValidate("id"), async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const err = commonError(error.array());
        return res.status(400).json({
            message: "Validation error",
            error: err,
            data: null
        });
    }

    const data = matchedData(req);

    try {
        const products = await DB.product.findMany({
            where: {
                UserId: Number(data.id)
            },
            include: {
                User: {
                    select: {
                        Id: true,
                        Name: true,
                        Username: true
                    }
                }
            }
        });

        return res.status(200).json({
            message: "Product data",
            data: products
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
});

// POST create a new product
productRouter.post('/create/:userId', commonParamValidate("userId"), commonValidate("name"), async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const err = commonError(error.array());
        return res.status(400).json({
            message: "Validation error",
            error: err,
            data: null
        });
    }

    const data = matchedData(req);
    try {
        const user = await DB.user.findUnique({
            where: { Id: Number(data.userId) }
        });

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                error: "Invalid userId",
                data: null
            });
        }

        const newProduct = await DB.product.create({
            data: {
                UserId: Number(data.userId),
                Name: data.name
            }
        });

        return res.status(201).json({
            message: "Product created",
            data: newProduct
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
});

// PUT update a product by ID
productRouter.put('/update/:id', commonParamValidate('id'), commonValidate("name"), async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const err = commonError(error.array());
        return res.status(400).json({
            message: "Validation error",
            error: err,
            data: null
        });
    }

    const data = matchedData(req);
    try {
        const updatedProduct = await DB.product.update({
            data: {
                Name: data.name
            },
            where: {
                Id: Number(data.id)
            }
        });

        return res.status(200).json({
            message: "Product updated",
            data: updatedProduct
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
}
);

// DELETE profile by ID
productRouter.delete('/delete/:id', commonParamValidate('id'), async (req, res) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        const err = commonError(error.array());
        return res.status(400).json({
            message: "Validation error",
            error: err,
            data: null
        });
    }

    const data = matchedData(req);

    try {
        await DB.product.delete({
            where: {
                Id: Number(data.id)
            }
        });

        return res.status(200).json({
            message: "Product deleted"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
            data: null
        });
    }
});
export default productRouter;