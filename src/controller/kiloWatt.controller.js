import {createKiloWatts, getAllKiloWatts, getKiloWattById, updateKiloWatts} from "../service/kiloWatt.service.js";

export const getAllKiloWatt = async (req, res) => {
    try {
        const kiloWatts = await getAllKiloWatts();
        res.status(200).json({
            success: true,
            message: 'All kilo watts retrieved',
            data: kiloWatts
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

export const getOneKiloWatt = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing id parameter.',
            errors: ['Kilo watt id must be a number.'],
            data: null
        });
    }
    try {
        const kiloWatt = await getKiloWattById(id);
        res.status(200).json({
            success: true,
            message: 'Kilo watt retrieved.',
            data: kiloWatt
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

export const createKiloWatt = async (req, res) => {
    try {
        const newKiloWatt = await createKiloWatts(req.body);
        res.status(201).json({
            success: true,
            message: 'Kilo watt created successfully',
            data: newKiloWatt
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

export const updateKiloWatt = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing id parameter.',
            errors: ['Kilo watt type id must be a number.'],
            data: null
        });
    }
    try {
        const updatedKiloWatt = await updateKiloWatts(id, req.body);
        res.status(200).json({
            success: true,
            message: 'kilo watt updated successfully',
            data: updatedKiloWatt
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