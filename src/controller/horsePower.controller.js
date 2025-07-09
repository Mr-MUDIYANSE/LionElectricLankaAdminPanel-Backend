import {
    createHorsePowers,
    getAllHorsePowers, getHorsePowersById,
    updateHorsePowers
} from "../service/horsePower.service.js";

export const getAllHorsePower = async (req, res) => {
    try {
        const horsePower = await getAllHorsePowers();
        res.status(200).json({
            success: true,
            message: 'All horse power retrieved',
            data: horsePower
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

export const getOneHorsePower = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Horse Power ID must be a number.'],
            data: null
        });
    }
    try {
        const horsePower = await getHorsePowersById(id);
        res.status(200).json({
            success: true,
            message: 'Horse Power retrieved.',
            data: horsePower
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
};

export const createHorsePower = async (req, res) => {
    try {
        const newHorsePowers = await createHorsePowers(req.body);
        res.status(201).json({
            success: true,
            message: 'Horse Power created successfully',
            data: newHorsePowers
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
};

export const updateHorsePower = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Horse Power ID must be a number.'],
            data: null
        });
    }
    try {
        const updatedHorsePower = await updateHorsePowers(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Horse Power updated successfully',
            data: updatedHorsePower
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
};