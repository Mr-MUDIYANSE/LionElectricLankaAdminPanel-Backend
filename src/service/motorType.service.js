import DB from "../db/db.js";

export const getAllMotorTypes = async () => {
    const allMotorTypes = await DB.motor_Type.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allMotorTypes || [];
};

export const getMotorTypeById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Motor type id must be a number'];
        throw error;
    }

    const motorType = await DB.motor_Type.findUnique({
        where: {id: parseInt(id)},
    });

    if (!motorType) {
        const error = new Error('Motor type not found');
        error.errors = ['Motor type with the given id does not exist'];
        throw error;
    }

    return motorType;
};

export const createMotorTypes = async (data) => {
    const errors = [];
    const { type } = data;

    if (!type || typeof type !== 'string' || type.trim() === '') {
        errors.push('Motor type is required and must be a not empty.');
    } else {
        if (type.trim().length > 45) {
            errors.push('Motor type is too long.');
        }
    }

    // Check if already exists
    const existMotorType = await DB.motor_Type.findFirst({
        where: {
            type: type,
        },
    });

    if (existMotorType) {
        errors.push('Motor type already exists.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create
    const newMotorType = await DB.motor_Type.create({
        data: {
            type: type.trim(),
        },
    });

    return newMotorType;
};

export const updateMotorTypes = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Motor type id must be a valid number.');
    }

    // Validate existing motor type
    await getMotorTypeById(id);


    if (data.type !== undefined) {
        if (typeof data.type !== 'string') {
            errors.push('Motor type required.');
            return;
        }
    }

    // Validation errors
    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Perform update with only given fields
    const updatedMotorType = await DB.motor_Type.update({
        where: {
            id: parseInt(id)
        },
        data: {type: data.type}
    });

    return updatedMotorType;
};