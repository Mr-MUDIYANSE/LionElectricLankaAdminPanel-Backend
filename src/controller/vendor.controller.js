import {createVendor, deleteVendor, getAllVendors, getVendorById, updateVendor} from "../service/vendor.service.js";

export const getAll = async (req, res) => {
    try {
        const vendors = await getAllVendors();
        if (!vendors || vendors.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No vendors found.',
                errors: ['No vendors available in the database.'],
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'All vendors retrieved',
            data: vendors
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
            errors: ['Vendor id must be a number.'],
            data: null
        });
    }

    try {
        const vendor = await getVendorById(id);
        res.status(200).json({
            success: true,
            message: 'Vendor retrieved.',
            data: vendor
        });
    } catch (err) {
        if (err.message === 'Vendor not found') {
            return res.status(404).json({
                success: false,
                message: "Internal Server Error",
                errors: "Internal Server Error",
                data: null
            });
        }
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
};

export const create = async (req, res) => {
    try {
        const vendor = await createVendor(req.body);
        res.status(201).json({
            success: true,
            message: 'Vendor created successfully.',
            data: vendor
        });
    } catch (err) {
        if (err.errors && err.errors.includes('Vendor already exist.')) {
            return res.status(409).json({
                success: false,
                message: 'Vendor already exists.',
                errors: err.errors,
                data: null
            });
        }
        res.status(400).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
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
            errors: ['Customer ID must be a number.'],
            data: null
        });
    }

    try {
        const updatedVendor = await updateVendor(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Vendor updated successfully.',
            data: updatedVendor
        });
    } catch (err) {
        if (err.message === 'Vendor not found') {
            return res.status(404).json({
                success: false,
                message: err.message,
                errors: err.errors || [],
                data: null
            });
        }
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const remove = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Customer ID must be a number.'],
            data: null
        });
    }

    try {
        const deletedVendor = await deleteVendor(id);
        if (!deletedVendor) {
            return res.status(404).json({
                success: false,
                message: 'Vendor not found.',
                errors: ['Vendor with the given ID does not exist.'],
                data: null
            });
        }
        res.status(200).json({
            success: true,
            message: 'Vendor deleted successfully.',
            data: deletedVendor
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