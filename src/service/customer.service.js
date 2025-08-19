import DB from "../db/db.js";

export const getAllCustomers = async () => {
    const allCustomers = await DB.customer.findMany({
        where: {
            status_id: 1
        },
        include: {
            status: true
        },
        orderBy: {
            id: 'asc'
        }
    });
    return allCustomers || [];
};

export const getCustomerById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Customer ID must be a number'];
        throw error;
    }

    const customer = await DB.customer.findUnique({
        where: { id: parseInt(id) },
        include: {
            status: true,
            invoices: {
                include: {
                    payment_history: {
                        include: {
                            chequeDetail: true,
                        }
                    },
                }
            }
        }
    });

    if (!customer) {
        const error = new Error('Customer not found');
        error.errors = ['Customer with the given id does not exist'];
        throw error;
    }

    if (customer.status_id === 2) {
        const error = new Error('Customer is inactive');
        error.errors = ['Customer with the given id is inactive'];
        throw error;
    }
    return customer;
};

export const createCustomer = async (data) => {
    const errors = [];

    const {name, email, contact_no, address, status_id} = data;

    if (!name || typeof name !== 'string') {
        errors.push('Name is required.');
    } else {
        if (name.trim().length > 45) {
            errors.push('Name is too long.');
        }
    }

    if (email && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
        errors.push('Email must be valid if provided.');
    }

    if (!contact_no || typeof contact_no !== 'string') {
        errors.push('Contact number is required.');
    } else if (contact_no.trim().length < 10) {
        errors.push('Contact number must be at least 10 characters.');
    }

    if (!address || typeof address !== 'string') {
        errors.push('Address is required.');
    }

    if (status_id === undefined || isNaN(status_id)) {
        errors.push('Status ID is required and must be a number.');
    }

    //Check customer exists
    const existCustomer = await DB.customer.findUnique({
        where: {
            contact_no: contact_no,
        }
    });

    if (existCustomer) {
        errors.push('Customer already exist in this contact number.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create Customer
    const newCustomer = await DB.customer.create({
        data: {
            name: name.trim(),
            email: email?.trim() || null,
            contact_no: contact_no.trim(),
            address: address.trim(),
            status_id: Number(status_id)
        }
    });

    return newCustomer;
};

export const updateCustomer = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Customer ID must be a valid number.');
    }

    // Validate existing customer
    await getCustomerById(id);

    // Collect only valid fields for update
    const updateData = {};

    if (data.name !== undefined) {
        if (typeof data.name !== 'string') {
            errors.push('Name must be valid.');
        } else {
            updateData.name = data.name.trim();
        }
    }

    if (data.email !== undefined) {
        if (data.email && (typeof data.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))) {
            errors.push('Email must be valid.');
        } else {
            updateData.email = data.email?.trim() || null;
        }
    }

    if (data.contact_no !== undefined) {
        if (typeof data.contact_no !== 'string' || data.contact_no.trim().length < 10) {
            errors.push('Contact number must be at least 10 characters.');
        } else {
            updateData.contact_no = data.contact_no.trim();
        }
    }

    if (data.address !== undefined) {
        if (typeof data.address !== 'string') {
            errors.push('Address must be a string.');
        } else {
            updateData.address = data.address.trim();
        }
    }

    if (data.status_id !== undefined) {
        if (isNaN(data.status_id)) {
            errors.push('Status ID must be a number.');
        } else {
            updateData.status_id = Number(data.status_id);
        }
    }

    if (Object.keys(updateData).length === 0) {
        errors.push('At least one field must be provided to update.');
    }

    // Validation errors
    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Perform update with only given fields
    const updatedCustomer = await DB.customer.update({
        where: {id: parseInt(id)},
        data: updateData
    });

    return updatedCustomer;
};

export const deleteCustomer = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Customer id must be a number'];
        throw error;
    }

    const customerId = parseInt(id);

    // Ensure customer exists
    await getCustomerById(customerId);

    // Soft delete
    await DB.customer.update({
        where: {id: customerId},
        data: {status_id: 2}
    });

    // Return the full updated customer
    const updatedCustomer = await DB.customer.findUnique({
        where: {id: customerId},
        include: {status: 1}
    });
    return updatedCustomer;
};
