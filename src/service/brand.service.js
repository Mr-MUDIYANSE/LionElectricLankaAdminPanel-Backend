import DB from "../db/db.js";

export const getAllBrands = async () => {
    const allBrands = await DB.brand.findMany({
        orderBy: {
            id: 'asc'
        }
    });
    return allBrands || [];
};

export const getBrandById = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Brand ID must be a number'];
        throw error;
    }

    const brand = await DB.brand.findUnique({
        where: {id: parseInt(id)},
    });

    if (!brand) {
        const error = new Error('Brand not found');
        error.errors = ['Brand with the given id does not exist'];
        throw error;
    }

    return brand;
};

export const createBrand = async (data) => {
    const errors = [];

    const {name} = data;

    if (!name || typeof name !== 'string') {
        errors.push('Name is required.');
    }

    //Check customer exists
    const existBrand = await DB.brand.findFirst({
        where: {
            name: name,
        }
    });

    if (existBrand) {
        errors.push('Brand already exist.');
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Create Brand
    const newBrand = await DB.brand.create({
        data: {
            name: name.trim()
        }
    });

    return newBrand;
};

export const updateBrand = async (id, data) => {
    const errors = [];

    if (!id || isNaN(id)) {
        errors.push('Brand ID must be a valid number.');
    }

    // Validate existing brand
    await getBrandById(id);


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
    const updatedBrand = await DB.brand.update({
        where: {
            id: parseInt(id)
        },
        data: { name: data.name }
    });

    return updatedBrand;
};
