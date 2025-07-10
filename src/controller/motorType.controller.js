import {createMotorTypes, getAllMotorTypes, getMotorTypeById, updateMotorTypes} from "../service/motorType.service.js";

export const getAllMotorType = async (req, res) => {
    try {
        const motorType = await getAllMotorTypes();
        res.status(200).json({
            success: true,
            message: 'All motor types retrieved',
            data: motorType
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

export const getOneMotorType = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Motor type id must be a number.'],
            data: null
        });
    }
    try {
        const motorType = await getMotorTypeById(id);
        res.status(200).json({
            success: true,
            message: 'Motor type retrieved.',
            data: motorType
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

export const createMotorType = async (req, res) => {
    try {
        const newMotorType = await createMotorTypes(req.body);
        res.status(201).json({
            success: true,
            message: 'Motor type created successfully',
            data: newMotorType
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

export const updateMotorType = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Motor type id must be a number.'],
            data: null
        });
    }
    try {
        const updatedMotoType = await updateMotorTypes(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Motor type updated successfully',
            data: updatedMotoType
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