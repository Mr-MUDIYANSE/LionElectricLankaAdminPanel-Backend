import { Router } from 'express';
import { commonParamValidate, commonValidate } from '../utils/validatorMethod.js';
import DB from '../db/db.js';
import { matchedData, validationResult } from 'express-validator';
import { commonError } from '../utils/error-creator.js';

const categoryRouter = Router();

// GET all category
categoryRouter.get('/all', async (_, res) => {
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

// GET category by ID
categoryRouter.get('/:id', commonParamValidate("id"), async (req, res) => {
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
        const category = await DB.category.findUnique({
            where: {
                Id: Number(data.id)
            }
        });

        return res.status(200).json({
            message: "Category data",
            data: category
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

// POST create a new category
categoryRouter.post('/create', commonValidate("name", "productIds"), async (req, res) => {
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

        const newCategory = await DB.category.create({
            data: {
                Name: data.name,
                Products: {
                    connect: `${data.productIds}`.split(',').map(d => ({ Id: Number(d) }))
                }
            }
        });

        return res.status(201).json({
            message: "Category created",
            data: newCategory
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

// PUT update a category by ID
categoryRouter.put('/update/:id', commonParamValidate('id'), commonValidate("name", "productIds"), async (req, res) => {
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
    const productIdsArray = `${data.productIds}`.split(",").map(id => Number(id));

    try {
        const existingProducts = await DB.product.findMany({
            where: { Id: { in: productIdsArray } }
        });

        if (existingProducts.length !== productIdsArray.length) {
            return res.status(400).json({
                message: "Invalid productIds",
                error: "Some product IDs do not exist",
                data: null
            });
        }

        const category = await DB.category.findUnique({ where: { Id: Number(data.id) } });
        if (!category) {
            return res.status(404).json({
                message: "Category not found",
                data: null
            });
        }

        const updatedCategory = await DB.category.update({
            where: { Id: Number(data.id) },
            data: {
                Name: data.name,
                Products: {
                    connect: productIdsArray.map(id => ({ Id: id }))
                }
            }
        });

        return res.status(200).json({
            message: "Category updated",
            data: updatedCategory
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


// DELETE category by ID
categoryRouter.delete('/delete/:id', commonParamValidate('id'), async (req, res) => {
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
        await DB.category.delete({
            where: {
                Id: Number(data.id)
            }
        });

        return res.status(200).json({
            message: "Category deleted"
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
export default categoryRouter;