import {getAllBrands, getBrandById, createBrand, updateBrand} from "../service/brand.service.js";

export const getAll = async (req, res) => {
    try {
        const brands = await getAllBrands();
        res.status(200).json({
            success: true,
            message: 'All brands retrieved',
            data: brands
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

export const getOne = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Brand ID must be a number.'],
            data: null
        });
    }
    try {
        const brand = await getBrandById(id);
        res.status(200).json({
            success: true,
            message: 'Brand retrieved.',
            data: brand
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const create = async (req, res) => {
    try {
        const brand = await createBrand(req.body);
        res.status(201).json({
            success: true,
            message: 'Brand created successfully',
            data: brand
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const update = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Brand ID must be a number.'],
            data: null
        });
    }
    try {
        const updatedBrand = await updateBrand(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Brand updated successfully',
            data: updatedBrand
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};
