import {
    getAllCustomers,
    getCustomerById,
    deleteCustomer,
    createCustomer, updateCustomer
} from "../service/customer.service.js";

export const getAll = async (req, res) => {
    try {
        const customers = await getAllCustomers();
        res.status(200).json({
            success: true,
            message: 'All customers retrieved',
            data: customers
        });
    } catch (err) {
        res.status(500).json({success: false, message: err.message, errors: err.errors || [], data: null});
    }
};

export const getOne = async (req, res) => {
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
        const customer = await getCustomerById(id);
        res.status(200).json({success: true, data: customer});
    } catch (err) {
        res.status(400).json({success: false, message: err.message, errors: err.errors || [], data: null});
    }
};

export const create = async (req, res) => {
    try {
        const customer = await createCustomer(req.body);
        res.status(201).json({
            success: true,
            message: 'Customer created successfully',
            data: customer
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
        const updatedCustomer = await updateCustomer(id, req.body);
        res.status(200).json({
            success: true,
            message: 'Customer updated successfully',
            data: updatedCustomer
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
        const deletedCustomer = await deleteCustomer(id);
        res.status(200).json({
            success: true,
            message: 'Customer deleted successfully',
            data: deletedCustomer
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
