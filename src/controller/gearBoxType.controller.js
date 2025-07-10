import {
    createGearBoxTypes,
    getAllGearBoxTypes,
    getGearBoxTypesById,
    updateGearBoxTypes
} from "../service/gearBoxType.service.js";

export const getAllGearBoxType = async (req, res) => {
    try {
        const gearBoxType = await getAllGearBoxTypes();
        res.status(200).json({
            success: true,
            message: 'All gear box type retrieved',
            data: gearBoxType
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

export const getOneGearBoxType = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Gear box type id must be a number.'],
            data: null
        });
    }
    try {
        const gearBoxType = await getGearBoxTypesById(id);
        res.status(200).json({
            success: true,
            message: 'Gear box type retrieved.',
            data: gearBoxType
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

export const createGearBoxType = async (req, res) => {
    try {
        const newGearBoxType = await createGearBoxTypes(req.body);
        res.status(201).json({
            success: true,
            message: 'Gear box type created successfully',
            data: newGearBoxType
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

export const updateGearBoxType = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Gear box type id must be a number.'],
            data: null
        });
    }
    try {
        const updatedGearBoxType = await updateGearBoxTypes(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Gear box type updated successfully',
            data: updatedGearBoxType
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