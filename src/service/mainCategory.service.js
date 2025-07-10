import DB from "../db/db.js";

export const getAllMainCategories = async () => {
    const allMainCategory = await DB.main_Category.findMany({
        where: {
            status_id: 1
        },
        orderBy: {
            id: 'asc'
        }
    });
    return allMainCategory || [];
};

export const getMainCategoriesById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Main category id must be a number'];
        throw error;
    }

    const mainCategory = await DB.main_Category.findUnique({
        where: {
            id: parseInt(id),
            status_id: 1,
        },
    });

    if (!mainCategory) {
        const error = new Error('Main category not found');
        error.errors = ['Main category with the given id does not exist'];
        throw error;
    }

    return mainCategory;
};

export const createMainCategories = async (data) => {
    const errors = [];
    const {name} = data;

    if (!name || typeof name !== 'string' || name.trim() === '') {
        errors.push('Main category is required.');
    } else {
        if (name.trim().length > 45) {
            errors.push('Main category is too long.');
        }
    }

    //Check exists
    const existMainCategory = await DB.main_Category.findFirst({
        where: {
            name: name,
        }
    });

    if (existMainCategory) {
        errors.push('Main category already exist.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create
    const newMainCategory = await DB.main_Category.create({
        data: {
            name: name.trim(),
            status_id: 1
        }
    });

    return newMainCategory;
};

export const updateMainCategories = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Main category id must be a valid number.');
    }

    // Validate existing
    await getMainCategoriesById(id);


    if (data.name !== undefined) {
        if (typeof data.name !== 'string') {
            errors.push('Main category required.');
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
    const updatedMainCategory = await DB.main_Category.update({
        where: {
            id: parseInt(id)
        },
        data: {name: data.name}
    });

    return updatedMainCategory;
};

export const deleteMainCategories = async (id) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Main category id must be a valid number.');
    }

    // Validate existing
    await getMainCategoriesById(id);

    // Validation errors
    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Perform update with only given fields
    const deletedMainCategory = await DB.main_Category.update({
        where: {
            id: parseInt(id)
        },
        data: {status_id: 2}
    });

    return deletedMainCategory;
};