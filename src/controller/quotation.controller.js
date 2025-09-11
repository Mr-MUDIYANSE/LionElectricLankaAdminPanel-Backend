import {
    createQuotations,
    deleteQuotationById,
    getAllQuotations,
    getQuotationById,
    updatedQuotations
} from "../service/quotation.service.js";

export const getAllQuotation = async (req, res) => {
    const date = req.query.date;
    try {
        const quotations = await getAllQuotations(date);
        res.status(200).json({
            success: true,
            message: 'All quotations retrieved',
            data: quotations
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

export const getOneQuotation = async (req, res) => {
    const quotationId = req.query.quotationId;

    if (!quotationId || isNaN(Number(quotationId))) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing quotationId parameter.',
            errors: ['Quotation ID must be a valid number.'],
            data: null
        });
    }

    try {
        const quotation = await getQuotationById(quotationId);

        if (!quotation) {
            return res.status(404).json({
                success: false,
                message: 'Quotation not found.',
                errors: ['No quotation found with the given ID.'],
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Quotation retrieved successfully.',
            data: quotation
        });

    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const createQuotation = async (req, res) => {
    const customerId = Number(req.params.id);
    const data = req.body;

    // Validate customerId
    if (!customerId || isNaN(customerId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing id parameter.',
            errors: ['Quotation id must be a number.'],
            data: null
        });
    }

    // Validate quotation data
    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Please enter quotation data.',
            errors: ['Quotation data required.'],
            data: null
        });
    }

    try {
        const response = await createQuotations(customerId, data);
        return res.status(201).json({
            success: true,
            message: 'New quotation created successfully.',
            data: response
        });
    } catch (err) {
        if (err.status) {
            return res.status(err.status).json({
                success: false,
                message: err.message || 'Request failed.',
                errors: err.errors || [err.message],
                data: null
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Internal Server Error',
            errors: [err.message || "Unknown error occurred"],
            data: null
        });
    }

};

export const updateQuotation = async (req, res) => {
    const quotationId = req.query.quotationId;
    const data = req.body;

    if (!quotationId) {
        return res.status(400).json({
            success: false,
            message: 'Quotation id is missing.',
            errors: ['Quotation id must be a number.'],
            data: null
        });
    }

    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Please enter quotation data.',
            errors: ['Quotation data required.'],
            data: null
        });
    }

    try {
        const response = await updatedQuotations(quotationId, data);

        return res.status(200).json({
            success: true,
            message: 'Quotation updated successfully.',
            data: response
        });

    } catch (err) {
        console.error(err);

        // Handle "not found" case from updatedQuotations
        if (err.status === 404) {
            return res.status(404).json({
                success: false,
                message: err.message,
                errors: [err.message],
                data: null
            });
        }

        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: [err.message || "Internal Server Error"],
            data: null
        });
    }
};

export const deleteQuotation = async (req, res) => {
    const quotationId = req.params.id;

    if (!quotationId) {
        return res.status(400).json({
            success: false,
            message: 'Quotation id is missing.',
            errors: ['Quotation id must be a valid number.'],
            data: null
        });
    }

    try {
        const deletedQuotation = await deleteQuotationById(quotationId);

        return res.status(200).json({
            success: true,
            message: 'Quotation deleted successfully.',
            data: deletedQuotation
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};