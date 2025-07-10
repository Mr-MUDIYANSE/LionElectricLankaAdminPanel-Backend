import DB from "../db/db.js";

export const getAllKiloWatts = async () => {
    const allKiloWatts = await DB.kilo_Watt.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allKiloWatts || [];
};

export const getKiloWattById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Kilo watt id must be a number'];
        throw error;
    }

    const KiloWatt = await DB.kilo_Watt.findUnique({
        where: {id: parseInt(id)},
    });

    if (!KiloWatt) {
        const error = new Error('Kilo watt not found');
        error.errors = ['Kilo watt with the given id does not exist'];
        throw error;
    }

    return KiloWatt;
};

export const createKiloWatts = async (data) => {
    const errors = [];
    const { watt } = data;

    if (!watt || typeof watt !== 'string' || watt.trim() === '') {
        errors.push('Kilo watt is required.');
    } else {
        if (watt.trim().length > 45) {
            errors.push('Kilo watt is too long.');
        }
    }

    // Check if already exists
    const existKiloWatt = await DB.kilo_Watt.findFirst({
        where: {
            watt: watt,
        },
    });

    if (existKiloWatt) {
        errors.push('Kilo watt already exists.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create
    const newKiloWatt = await DB.kilo_Watt.create({
        data: {
            watt: watt.trim(),
        },
    });

    return newKiloWatt;
};

export const updateKiloWatts = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Kilo watt id must be a valid number.');
    }

    // Validate existing
    await getKiloWattById(id);


    if (data.watt !== undefined) {
        if (typeof data.watt !== 'string') {
            errors.push('Kilo watt required.');
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
    const updatedKiloWatt = await DB.kilo_Watt.update({
        where: {
            id: parseInt(id)
        },
        data: {watt: data.watt}
    });

    return updatedKiloWatt;
};