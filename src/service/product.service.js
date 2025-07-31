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

export const getAllProduct = async () => {
    const products = await DB.product.findMany({
        where: {
            status_id: 1
        },
        include: {
            status: true,
            brand: true,
        }
    });

    if (!products || products.length === 0) {
        const error = new Error('No products');
        error.errors = ['No products found'];
        throw error;
    }

    return removeNullFields(products);
}

export const getProducts = async (categoryId) => {
    if (!categoryId || isNaN(categoryId)) {
        const error = new Error('Invalid ID');
        error.errors = ['Category ID must be a number'];
        throw error;
    }

    // Check if the category exists in the database
    const category = await DB.main_Category.findUnique({
        where: {id: categoryId},
    });

    if (!category) {
        const error = new Error('Invalid category id');
        error.errors = ['Category with the given id does not exist.'];
        throw error;
    }

    const products = await DB.product.findMany({
        where: {
            main_category_id: categoryId,
        },
        include: {
            main_category: true,
            brand: true,
            phase: true,
            size: true,
            speed: true,
            motor_type: true,
            gear_box_type:true,
            status: true,
        }
    });

    if (!products || products.length === 0) {
        const error = new Error('No products found for this category');
        error.errors = ['No products found for the given main category ID'];
        throw error;
    }

    return removeNullFields(products);
};

export const getFilteredProducts = async (categoryId, filters) => {
    if (!categoryId || isNaN(categoryId)) {
        const error = new Error('Invalid Category ID');
        error.errors = ['Category ID must be a valid number.'];
        throw error;
    }

    // Build filter
    const filter = {
        main_category_id: Number(categoryId),
    };

    const allowedFilterKeys = [
        'phase_id',
        'speed_id',
        'motor_type_id',
        'size_id',
        'gear_box_type_id',
    ];

    let filterApplied = false;
    for (const key of allowedFilterKeys) {
        if (filters[key]) {
            const value = Number(filters[key]);
            if (!isNaN(value)) {
                filter[key] = value;
                filterApplied = true; // At least one valid filter was applied
            } else {
                const error = new Error(`${key} must be a valid number.`);
                error.errors = [`Invalid value for ${key}`];
                throw error;
            }
        }
    }

    if (!filterApplied && Object.keys(filters).length > 0) {
        const error = new Error('Invalid filter parameters.');
        error.errors = ['No valid filters applied. Ensure the filter values are correct.'];
        throw error;
    }

    const products = await DB.product.findMany({
        where: {
            ...filter,
            status_id: 1,
        },
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
    });

    if (!products || products.length === 0) {
        const error = new Error('No products');
        error.errors = ['No matching products found'];
        throw error;
    }

    return removeNullFields(products);
};

export const getFilteredProductsByTitle = async (categoryId, product_title) => {
    const products = await DB.product.findMany({
        where: {
            main_category_id: categoryId,
            status_id:1,
            title: {
                contains: product_title,
                mode: 'insensitive'  // case-insensitive search
            },
        },
        include: {
            brand: true,
            main_category: true,
            phase: true,
            speed: true,
            motor_type: true,
            size: true,
            gear_box_type: true
        }
    });

    if (!products || products.length === 0) {
        const error = new Error('No products');
        error.errors = ['No matching products found for the given title and category.'];
        throw error;
    }

    return removeNullFields(products);
};

export const createProduct = async (categoryId, data) => {
    const errors = [];

    if (!categoryId || isNaN(categoryId) || Number(categoryId) <= 0) {
        errors.push('Main Category ID must be a valid number.');
    }

    const category = await DB.main_Category.findUnique({
        where: {id: categoryId},
    });

    if (!category) {
        errors.push('Invalid category ID.');
    }

    const {
        title,
        description,
        warranty,
        brand_id,
        phase_id,
        speed_id,
        motor_type_id,
        size_id,
        gear_box_type_id,
    } = data;

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
        errors.push('Title is required and must be a non-empty string.');
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
        errors.push('Description is required and must be a non-empty string.');
    }

    if (typeof warranty !== 'string' || warranty.trim() === '') {
        errors.push('Warranty must be a valid non-empty string.');
    }

    if (!brand_id || typeof brand_id !== 'number' || brand_id <= 0) {
        errors.push('Brand ID must be a valid number.');
    }

    // Validate category-specific fields
    if (categoryId === 1) {  // Motor category
        if (!size_id || size_id <= 0) errors.push('Motor category requires size_id.');
        if (!speed_id || speed_id <= 0) errors.push('Motor category requires speed_id.');
        if (!phase_id || phase_id <= 0) errors.push('Motor category requires phase_id.');
        if (!motor_type_id || motor_type_id <= 0) errors.push('Motor category requires motor_type_id.');
    } else if (categoryId === 2) {  // VFD category
        if (!size_id || size_id <= 0) errors.push('VFD category requires size_id.');
    } else if (categoryId === 3) {  // Gear Reducer category
        if (!size_id || size_id <= 0) errors.push('Gear Reducer category requires size_id.');
        if (!speed_id || speed_id <= 0) errors.push('Gear Reducer category requires speed_id.');
        if (!gear_box_type_id || gear_box_type_id <= 0) errors.push('Gear Reducer category requires gear_box_type_id.');
    } else if (categoryId === 4) {  // Stater Switch category
        if (!size_id || size_id <= 0) errors.push('Stater Switch category requires size_id.');
        if (!phase_id || phase_id <= 0) errors.push('Stater Switch category requires phase_id.');
    }

    // Validate foreign key IDs
    const numberFields = [
        {key: 'phase_id', value: phase_id},
        {key: 'speed_id', value: speed_id},
        {key: 'motor_type_id', value: motor_type_id},
        {key: 'size_id', value: size_id},
        {key: 'gear_box_type_id', value: gear_box_type_id},
    ];

    numberFields.forEach(({key, value}) => {
        if (value && (typeof value !== 'number' || isNaN(value) || value <= 0)) {
            errors.push(`${key} must be a valid number.`);
        }
    });

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Check product already exists
    const existingProduct = await DB.product.findFirst({
        where: {
            title: title.trim(),
            brand_id: brand_id,
            main_category_id: categoryId,
            phase_id: phase_id || null,
            speed_id: speed_id || null,
            motor_type_id: motor_type_id || null,
            size_id: size_id || null,
            gear_box_type_id: gear_box_type_id || null,
        }
    });

    if (existingProduct) {
        const error = new Error('Product with the same details already exists.');
        error.errors = ['Product with the same details already exists.'];
        throw error;
    }

    // Create the product
    const product = await DB.product.create({
        data: {
            title: title.trim(),
            description: description.trim(),
            warranty: warranty.trim(),
            brand_id: brand_id,
            status_id: 1,
            main_category_id: categoryId,
            phase_id: phase_id || null,
            speed_id: speed_id || null,
            motor_type_id: motor_type_id || null,
            size_id: size_id || null,
            gear_box_type_id: gear_box_type_id || null,
        }
    });

    return removeNullFields(product);
};

export const updateProducts = async (categoryId, productId, data) => {
    categoryId = Number(categoryId);

    if (isNaN(categoryId)) {
        const error = new Error('Invalid Category ID');
        error.errors = ['Category ID must be a number'];
        throw error;
    }

    if (!productId || isNaN(productId)) {
        const error = new Error('Invalid Product ID');
        error.errors = ['Product ID must be a number'];
        throw error;
    }

    const productUpdateData = {};

    if (data.title) productUpdateData.title = data.title;
    if (data.description) productUpdateData.description = data.description;
    if (data.warranty) productUpdateData.warranty = data.warranty;
    if (data.brand_id) productUpdateData.brand_id = data.brand_id;

    if (categoryId === 1) {  // Motor category
        if (data.size_id) productUpdateData.size_id = data.size_id;
        if (data.speed_id) productUpdateData.speed_id = data.speed_id;
        if (data.phase_id) productUpdateData.phase_id = data.phase_id;
        if (data.motor_type_id) productUpdateData.motor_type_id = data.motor_type_id;
    } else if (categoryId === 2) {  // VFD category
        if (data.size_id) productUpdateData.size_id = data.size_id;
    } else if (categoryId === 3) {  // Gear Reducer category
        if (data.size_id) productUpdateData.size_id = data.size_id;
        if (data.speed_id) productUpdateData.speed_id = data.speed_id;
        if (data.gear_box_type_id) productUpdateData.gear_box_type_id = data.gear_box_type_id;
    } else if (categoryId === 4) {  // Stater Switch category
        if (data.size_id) productUpdateData.size_id = data.size_id;
        if (data.phase_id) productUpdateData.phase_id = data.phase_id;
    }

    const existingProduct = await DB.product.findUnique({
        where: {id: Number(productId)},
    });

    if (!existingProduct) {
        const error = new Error('Product not found');
        error.errors = ['Product with the given ID does not exist.'];
        throw error;
    }

    const updatedProduct = await DB.product.update({
        where: {id: Number(productId)},
        data: productUpdateData,
        include: {
            brand: true,
            main_category: true,
            phase: true,
            speed: true,
            motor_type: true,
            size: true,
            gear_box_type: true
        }
    });

    return removeNullFields(updatedProduct);
};

export const productDelete = async (productId) => {
    if (!productId || isNaN(productId)) {
        const error = new Error('Invalid Product ID');
        error.errors = ['Product ID must be a number'];
        throw error;
    }

    const product = await DB.product.findUnique({
        where: {id: Number(productId)},
    });

    if (!product) {
        const error = new Error('Product not found');
        error.errors = ['Product with the given ID does not exist.'];
        throw error;
    }

    const updatedProduct = await DB.product.update({
        where: {id: Number(productId)},
        data: {
            status_id: 2,
        },
    });

    return removeNullFields(updatedProduct);
};