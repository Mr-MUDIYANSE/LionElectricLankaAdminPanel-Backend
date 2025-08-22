import {createSizes, getAllSizes, getSizesById, updateSizes} from "../service/size.service.js";

export const getAllSize = async (req, res) => {
    try {
        const size = await getAllSizes();
        res.status(200).json({
            success: true,
            message: 'All sizes retrieved',
            data: size
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

export const getOneSize = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Size id must be a number.'],
            data: null
        });
    }
    try {
        const size = await getSizesById(id);
        res.status(200).json({
            success: true,
            message: 'Size retrieved.',
            data: size
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

export const createSize = async (req, res) => {
    try {
        const newSize = await createSizes(req.body);
        res.status(201).json({
            success: true,
            message: 'Size created successfully',
            data: newSize
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

export const updateSize = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Size id must be a number.'],
            data: null
        });
    }
    try {
        const updatedSize = await updateSizes(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Size updated successfully',
            data: updatedSize
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