import {
    createMainCategories, deleteMainCategories,
    getAllMainCategories,
    getMainCategoriesById,
    updateMainCategories
} from "../service/mainCategory.service.js";

export const getAllMainCategory = async (req, res) => {
    try {
        const mainCategory = await getAllMainCategories();
        res.status(200).json({
            success: true,
            message: 'All main categories retrieved',
            data: mainCategory
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

export const getOneMainCategory = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Main category id must be a number.'],
            data: null
        });
    }
    try {
        const mainCategory = await getMainCategoriesById(id);
        res.status(200).json({
            success: true,
            message: 'Main category retrieved.',
            data: mainCategory
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

export const createMainCategory = async (req, res) => {
    try {
        const mainCategory = await createMainCategories(req.body);
        res.status(201).json({
            success: true,
            message: 'Main catgory created successfully',
            data: mainCategory
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

export const updateMainCategory = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Main category id must be a number.'],
            data: null
        });
    }
    try {
        const updatedMainCategory = await updateMainCategories(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Main category updated successfully',
            data: updatedMainCategory
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

export const deleteMainCategory = async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing ID parameter.',
            errors: ['Main category id must be a number.'],
            data: null
        });
    }
    try {
        const deletedMainCategory = await deleteMainCategories(id);
        res.status(200).json({
            success: true,
            message: 'Main category deleted successfully',
            data: deletedMainCategory
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