import DB from "../db/db.js";

export const getAllPhases = async () => {
    const allPhases = await DB.phase.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allPhases || [];
};

export const getPhasesById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Phase ID must be a number'];
        throw error;
    }

    const phase = await DB.phase.findUnique({
        where: {id: parseInt(id)},
    });

    if (!phase) {
        const error = new Error('Phase not found');
        error.errors = ['Phase with the given id does not exist'];
        throw error;
    }

    return phase;
};

export const createPhases = async (data) => {
    const errors = [];

    const {name} = data;

    if (!name || typeof name !== 'string') {
        errors.push('Name is required and must be a string.');
    } else {
        if (name.trim().length > 45) {
            errors.push('Name is too long.');
        }
    }

    //Check customer exists
    const existPhase = await DB.phase.findFirst({
        where: {
            name: name,
        }
    });

    if (existPhase) {
        errors.push('Phase already exist.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create phase
    const newPhase = await DB.phase.create({
        data: {
            name: name.trim()
        }
    });

    return newPhase;
};

export const updatePhases = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Phase ID must be a valid number.');
    }

    // Validate existing phase
    await getPhasesById(id);


    if (data.name !== undefined) {
        if (typeof data.name !== 'string') {
            errors.push('Name required.');
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
    const updatedPhase = await DB.phase.update({
        where: {
            id: parseInt(id)
        },
        data: { name: data.name }
    });

    return updatedPhase;
};