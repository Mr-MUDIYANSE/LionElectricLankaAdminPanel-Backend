import DB from "../db/db.js";

export const getAllSpeeds = async () => {
    const allSpeeds = await DB.speed.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allSpeeds || [];
};

export const getSpeedsById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Speed ID must be a number'];
        throw error;
    }

    const speed = await DB.speed.findUnique({
        where: {id: parseInt(id)},
    });

    if (!speed) {
        const error = new Error('Speed not found');
        error.errors = ['Speed with the given id does not exist'];
        throw error;
    }

    return speed;
};

export const createSpeeds = async (data) => {
    const errors = [];
    const { speed } = data;

    if (!speed || typeof speed !== 'string') {
        errors.push('Speed is required and must be a string.');
    } else {
        if (speed.trim().length > 45) {
            errors.push('Speed is too long.');
        }
    }

    // Check if speed already exists
    const existSpeed = await DB.speed.findFirst({
        where: {
            speed: speed,
        },
    });

    if (existSpeed) {
        errors.push('Speed already exists.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create speed
    const newSpeed = await DB.speed.create({
        data: {
            speed: speed.trim(),
        },
    });

    return newSpeed;
};

export const updateSpeeds = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Speed ID must be a valid number.');
    }

    // Validate existing speed
    await getSpeedsById(id);


    if (data.speed !== undefined) {
        if (typeof data.speed !== 'string') {
            errors.push('Speed required.');
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
    const updatedSpeed = await DB.speed.update({
        where: {
            id: parseInt(id)
        },
        data: { speed: data.speed }
    });

    return updatedSpeed;
};