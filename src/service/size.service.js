import DB from "../db/db.js";

export const getAllSizes = async () => {
    const allSizes = await DB.size.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allSizes || [];
};

export const getSizesById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Size id must be a number'];
        throw error;
    }

    const size = await DB.size.findUnique({
        where: {id: parseInt(id)},
    });

    if (!size) {
        const error = new Error('Size not found');
        error.errors = ['Size with the given id does not exist'];
        throw error;
    }

    return size;
};

export const createSizes = async (data) => {
    const errors = [];

    const {size} = data;

    if (!size || typeof size !== 'string'|| size.trim() === '') {
        errors.push('Size is required.');
    } else {
        if (size.trim().length > 45) {
            errors.push('Size is too long.');
        }
    }

    //Check size exists
    const existSize = await DB.size.findFirst({
        where: {
            size: size,
        }
    });

    if (existSize) {
        errors.push('Size already exist.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create size
    const newSize = await DB.size.create({
        data: {
            size: size.trim()
        }
    });

    return newSize;
};

export const updateSizes = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Size id must be a valid number.');
    }

    // Validate existing size
    await getSizesById(id);


    if (data.size !== undefined) {
        if (typeof data.size !== 'string') {
            errors.push('Size required.');
            return ;
        }
    }

    // Validation errors
    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Perform update with only given fields
    const updatedSize = await DB.size.update({
        where: {
            id: parseInt(id)
        },
        data: { size: data.size }
    });

    return updatedSize;
};