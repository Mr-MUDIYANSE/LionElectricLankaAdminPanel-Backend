import {
    createPhases,
    getAllPhases,
    getPhasesById,
    updatePhases
} from "../service/phase.service.js";

export const getAllPhase = async (req, res) => {
    try {
        const phases = await getAllPhases();
        res.status(200).json({
            success: true,
            message: 'All phases retrieved',
            data: phases
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

export const getOnePhase = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Phase ID must be a number.'],
            data: null
        });
    }
    try {
        const phases = await getPhasesById(id);
        res.status(200).json({
            success: true,
            message: 'Phase retrieved.',
            data: phases
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

export const createPhase = async (req, res) => {
    try {
        const phases = await createPhases(req.body);
        res.status(201).json({
            success: true,
            message: 'Phase created successfully',
            data: phases
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

export const updatePhase = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Phase ID must be a number.'],
            data: null
        });
    }
    try {
        const updatedPhase = await updatePhases(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Phase updated successfully',
            data: updatedPhase
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