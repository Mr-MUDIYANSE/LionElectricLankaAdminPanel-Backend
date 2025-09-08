import {
    createInvoices,
    getAllInvoices, getAllMetaData,
    getInvoiceById, getPaymentHistoryByInvoiceId, updateChequePayment,
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
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const getMetaData = async (req, res) => {
    try {
        let {date} = req.query;
        let year, month;

        if (Array.isArray(date)) {
            date = date[0];
        }

        if (date) {
            date = String(date).trim();
            const parts = date.split("-");
            year = parseInt(parts[0]);
            if (parts.length === 2) {
                month = parseInt(parts[1]);
            } else if (parts.length > 2) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid date format. Use yyyy or yyyy-mm.",
                    data: null
                });
            }
        } else {
            const now = new Date();
            year = now.getFullYear();
            month = now.getMonth() + 1;
        }

        // Overall data
        const overallData = await getAllMetaData();

        // Monthly / yearly data
        const monthlyData = await getAllMetaData(year, month);

        const response = {
            success: true,
            message: "All meta data retrieved",
            data: {
                overall_data: overallData.data,
                monthly_data: monthlyData.monthly_data
            }
        };

        res.status(200).json(response);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
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
            message: "Internal Server Error",
            errors: "Internal Server Error",
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
        console.log(err.message);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
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
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
}

export const updateCheque = async (req, res) => {
    const paymentHistoryId = Number(req.params.id);
    const data = req.body;

    if (!paymentHistoryId) {
        return res.status(400).json({
            success: false,
            message: 'Invalid or missing id parameter.',
            errors: ['Payment history id must be a valid number.'],
            data: null
        });
    }

    if (!data || !data.status) {
        return res.status(400).json({
            success: false,
            message: 'Please provide status.',
            errors: ['status is required.'],
            data: null
        });
    }

    try {
        const response = await updateChequePayment(paymentHistoryId, data);
        return res.status(200).json({
            success: true,
            message: 'Cheque updated successfully.',
            data: response
        });
    } catch (err) {
        const statusCode = err.errors ? 400 : 500;
        res.status(statusCode).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};

export const getPaymentHistory = async (req, res) => {
    const inId = req.query.invoiceId;

    try {
        const paymentHistory = await getPaymentHistoryByInvoiceId(inId);

        return res.status(200).json({
            success: true,
            message: `Payment history for invoice ID ${inId} fetched successfully.`,
            data: paymentHistory
        });
    } catch (err) {
        return res.status(err.status || 500).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};