import {
    createInvoices,
    getAllInvoices,
    getInvoiceById,
    updatedInvoices
} from "../service/invoice.service.js";

export const getAllInvoice = async (req, res) => {
    const date = req.query.date;
    try {
        const invoice = await getAllInvoices(date);
        res.status(200).json({
            success: true,
            message: 'All invoices retrieved',
            data: invoice
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

export const getOneInvoice = async (req, res) => {
    const invoiceId = req.query.invoiceId;
    try {
        const invoice = await getInvoiceById(invoiceId);
        res.status(200).json({
            success: true,
            message: 'Invoices retrieved',
            data: invoice
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

export const createInvoice = async (req, res) => {
    const customerId = Number(req.params.id);
    const data = req.body;

    if (!customerId || isNaN(customerId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing id parameter.',
            errors: ['Customer id must be a number.'],
            data: null
        });
    }

    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Please enter invoice data.',
            errors: ['Invoice data required.'],
            data: null
        });
    }

    try {
        const response = await createInvoices(customerId, data);
        return res.status(201).json({
            success: true,
            message: 'New invoice created successfully.',
            data: response
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

export const updateInvoice = async (req, res) => {
    const invoiceId = req.params.id;
    const data = req.body;

    if (!invoiceId) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing id parameter.',
            errors: ['Invoice id must be a number.'],
            data: null
        });
    }

    if (!data) {
        return res.status(400).json({
            success: false,
            message: 'Please enter invoice data.',
            errors: ['Invoice data required.'],
            data: null
        });
    }

    try {
        const response = await updatedInvoices(invoiceId, data);
        return res.status(200).json({
            success: true,
            message: 'Invoice updated successfully.',
            data: response
        });
    }catch (err) {
        res.status(500).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
}