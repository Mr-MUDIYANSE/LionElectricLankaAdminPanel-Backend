import DB from "../db/db.js";

// function to recursively remove null or undefined fields
const removeNullFields = (obj) => {
    // Convert Date to string
    if (obj instanceof Date) {
        return obj.toISOString();
    }

    if (Array.isArray(obj)) {
        return obj.map(removeNullFields).filter(item => item !== null);
    } else if (obj !== null && typeof obj === 'object') {
        const cleaned = {};
        for (const key in obj) {
            const value = removeNullFields(obj[key]);
            if (value !== null && value !== undefined) {
                cleaned[key] = value;
            }
        }
        return cleaned;
    } else {
        return obj === null ? undefined : obj;
    }
};

export const getAllVendors = async () => {
    try {
        const vendors = await DB.vendor.findMany({
            where: {status_id: 1},
            include: {status: true},
            orderBy: {id: 'asc'}
        });
        return vendors;
    } catch (err) {
        throw new Error('Internal Server Error');
    }
};

export const getVendorById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Vendor id must be a number'];
        throw error;
    }

    const vendor = await DB.vendor.findUnique({
        where: { id: parseInt(id) },
        include: {
            status: true,
            stock: {
                include: {
                    product: {
                        include: {
                            status: true,
                            brand: true,
                            main_category: true,
                            phase: true,
                            speed: true,
                            motor_type: true,
                            size: true,
                            gear_box_type: true,
                        },
                    },
                },
            },
        },
    });

    if (!vendor) {
        const error = new Error('Vendor not found');
        error.errors = ['Vendor with the given id does not exist'];
        throw error;
    }

    if (vendor.status_id === 2) {
        const error = new Error('Vendor is inactive');
        error.errors = ['Vendor with the given id is inactive'];
        throw error;
    }
    return removeNullFields(vendor);
};

export const createVendor = async (data) => {
    const errors = [];

    const {company_name, email, contact_no, address, status_id} = data;

    if (!company_name || typeof company_name !== 'string') {
        errors.push('Company name is required.');
    } else {
        if (company_name.trim().length > 45) {
            errors.push('Company name is too long.');
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

    // Check if vendor with the same company name already exists
    const existVendor = await DB.vendor.findFirst({
        where: {company_name}
    });

    if (existVendor) {
        errors.push('Vendor already exists.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create new vendor
    const newVendor = await DB.vendor.create({
        data: {
            company_name: company_name.trim(),
            email: email?.trim() || null,
            contact_no: contact_no.trim(),
            address: address.trim(),
            status_id: Number(status_id)
        }
    });

    return newVendor;
};

export const updateVendor = async (id, data) => {
    const errors = [];

    const vendor = await getVendorById(id);

    const updateData = {};

    if (data.company_name !== undefined) {
        if (typeof data.company_name !== 'string') {
            errors.push('Company name must be valid.');
        } else {
            updateData.company_name = data.company_name.trim();
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

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    const updatedVendor = await DB.vendor.update({
        where: {id: parseInt(id)},
        data: updateData
    });

    return updatedVendor;
};

export const deleteVendor = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Vendor id must be a number'];
        throw error;
    }

    const vendorId = parseInt(id);

    const vendor = await getVendorById(vendorId);

    await DB.vendor.update({
        where: {id: vendorId},
        data: {status_id: 2}
    });

    const deletedVendor = await DB.vendor.findUnique({
        where: {id: vendorId},
        include: {status: true}
    });

    return deletedVendor;
};