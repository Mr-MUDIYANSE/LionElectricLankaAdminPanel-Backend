import DB from "../db/db.js";

export const getAllHorsePowers = async () => {
    const allHorsePowers = await DB.horse_Power.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allHorsePowers || [];
};

export const getHorsePowersById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Horsepower ID must be a number'];
        throw error;
    }

    const horsePower = await DB.horse_Power.findUnique({
        where: {id: parseInt(id)},
    });

    if (!horsePower) {
        const error = new Error('Horse Power not found');
        error.errors = ['HorsePower with the given id does not exist'];
        throw error;
    }

    return horsePower;
};

export const createHorsePowers = async (data) => {
    const errors = [];
    const { power } = data;

    if (!power || typeof power !== 'string') {
        errors.push('Horsepower is required and must be a string.');
    } else {
        if (power.trim().length > 45) {
            errors.push('Horsepower is too long.');
        }
    }

    // Check if horse power already exists
    const existHorsePower = await DB.horse_Power.findFirst({
        where: {
            power: power,
        },
    });

    if (existHorsePower) {
        errors.push('Horsepower already exists.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create hors power
    const newHorsePower = await DB.horse_Power.create({
        data: {
            power: power.trim(),
        },
    });

    return newHorsePower;
};

export const updateHorsePowers = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Horsepower ID must be a valid number.');
    }

    // Validate existing hors power
    await getHorsePowersById(id);


    if (data.power !== undefined) {
        if (typeof data.power !== 'string') {
            errors.push('Horsepower required.');
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
    const updatedHorsePower = await DB.horse_Power.update({
        where: {
            id: parseInt(id)
        },
        data: { power: data.power }
    });

    return updatedHorsePower;
};