import DB from "../db/db.js";

export const getAllGearBoxTypes = async () => {
    const allGearBoxTypes = await DB.gear_Box_Type.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allGearBoxTypes || [];
};

export const getGearBoxTypesById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Gear box type id must be a number'];
        throw error;
    }

    const gearBoxType = await DB.gear_Box_Type.findUnique({
        where: {id: parseInt(id)},
    });

    if (!gearBoxType) {
        const error = new Error('Gear box type not found');
        error.errors = ['Gear box type with the given id does not exist'];
        throw error;
    }

    return gearBoxType;
};

export const createGearBoxTypes = async (data) => {
    const errors = [];
    const {type} = data;

    if (!type || typeof type !== 'string'|| type.trim() === '') {
        errors.push('Gear box type is required.');
    } else {
        if (type.trim().length > 45) {
            errors.push('Gear box type is too long.');
        }
    }

    //Check exists
    const existGearBoxType = await DB.gear_Box_Type.findFirst({
        where: {
            type: type,
        }
    });

    if (existGearBoxType) {
        errors.push('Gear box type already exist.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create
    const newGearBoxType = await DB.gear_Box_Type.create({
        data: {
            type: type.trim()
        }
    });

    return newGearBoxType;
};

export const updateGearBoxTypes = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Gear box type id must be a valid number.');
    }

    // Validate existing
    await getGearBoxTypesById(id);


    if (data.type !== undefined) {
        if (typeof data.type !== 'string') {
            errors.push('Gear box type is required.');
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
    const updatedGearBoxType = await DB.gear_Box_Type.update({
        where: {
            id: parseInt(id)
        },
        data: { type: data.type }
    });

    return updatedGearBoxType;
};