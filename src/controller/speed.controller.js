import {createSpeeds, getAllSpeeds, getSpeedsById, updateSpeeds} from "../service/speed.service.js";

export const getAllSpeed = async (req, res) => {
    try {
        const speed = await getAllSpeeds();
        res.status(200).json({
            success: true,
            message: 'All speeds retrieved',
            data: speed
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

export const getOneSpeed = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Speed ID must be a number.'],
            data: null
        });
    }
    try {
        const speed = await getSpeedsById(id);
        res.status(200).json({
            success: true,
            message: 'Speed retrieved.',
            data: speed
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

export const createSpeed = async (req, res) => {
    try {
        const newSpeeds = await createSpeeds(req.body);
        res.status(201).json({
            success: true,
            message: 'Speed created successfully',
            data: newSpeeds
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

export const updateSpeed = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Speed ID must be a number.'],
            data: null
        });
    }
    try {
        const updatedSpeed = await updateSpeeds(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Speed updated successfully',
            data: updatedSpeed
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