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
            category_config: {
                include: {
                    main_category: true,
                    phase: true,
                    speed: true,
                    horse_power: true,
                    motor_type: true,
                    kilo_watt: true,
                    size: true,
                    gear_box_type: true
                }
            }
        }
    });

    if (!products || products.length === 0) {
        const error = new Error('No products');
        error.errors = ['No products found'];
        throw error;
    }

    // Remove null fields recursively
    return removeNullFields(products);
}

export const getProducts = async (id) => {
    if (!id || isNaN(id)) {
        const error = new Error('Invalid ID');
        error.errors = ['Category ID must be a number'];
        throw error;
    }

    const products = await DB.product.findMany({
        where: {
            category_config: {
                main_category_id: Number(id)
            }
        },
        include: {
            status: true,
            brand: true,
            category_config: {
                include: {
                    main_category: true,
                    phase: true,
                    speed: true,
                    horse_power: true,
                    motor_type: true,
                    kilo_watt: true,
                    size: true,
                    gear_box_type: true
                }
            }
        }
    });

    if (!products || products.length === 0) {
        const error = new Error('No products found for this category');
        error.errors = ['No products found for the given main category ID'];
        throw error;
    }

    // Remove null fields recursively
    return removeNullFields(products);

};

export const getFilteredProducts = async (categoryId, filters) => {
    if (!categoryId || isNaN(categoryId)) {
        const error = new Error('Invalid Category ID');
        error.errors = ['Category ID must be a valid number.'];
        throw error;
    }

    // Build filter for category_config
    const categoryConfigFilter = {
        main_category_id: Number(categoryId),
    };

    const allowedFilterKeys = [
        'phase_id',
        'speed_id',
        'horse_power_id',
        'motor_type_id',
        'kilo_watt_id',
        'size_id',
        'gear_box_type_id',
    ];

    for (const key of allowedFilterKeys) {
        if (filters[key]) {
            const value = Number(filters[key]);
            if (!isNaN(value)) {
                categoryConfigFilter[key] = value;
            }
        }
    }

    // Query products with joined category_config filter
    const products = await DB.product.findMany({
        where: {
            category_config: {
                ...categoryConfigFilter
            },
        },
        include: {
            status: true,
            brand: true,
            category_config: {
                include: {
                    main_category: true,
                    phase: true,
                    speed: true,
                    horse_power: true,
                    motor_type: true,
                    kilo_watt: true,
                    size: true,
                    gear_box_type: true,
                },
            },
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
            title: {
                contains: product_title,
                mode: 'insensitive'  // case-insensitive search
            },
        },
        include: {
            brand: true,
            category_config: {
                include: {
                    main_category: true,
                    phase: true,
                    speed: true,
                    horse_power: true,
                    motor_type: true,
                    kilo_watt: true,
                    size: true,
                    gear_box_type: true
                }
            }
        }
    });

    if (!products || products.length === 0) {
        const error = new Error('No products');
        error.errors = ['No matching products found'];
        throw error;
    }

    // Remove null fields recursively
    return removeNullFields(products);
};

export const createProduct = async (categoryId, data) => {
    const errors = [];

    if (!categoryId || isNaN(categoryId) || Number(categoryId) <= 0) {
        errors.push('Main Category ID must be a valid number.');
    }

    const {
        title,
        description,
        warranty,
        brand_id,
        phase_id,
        speed_id,
        horse_power_id,
        motor_type_id,
        kilo_watt_id,
        size_id,
        gear_box_type_id,
    } = data;

    if (!title || typeof title !== 'string' || title.trim() === '') {
        errors.push('Title is required and must be a non empty.');
    } else if (title.trim().length > 100) {
        errors.push('Title is too long (max 100 characters).');
    }

    if (!description || typeof description !== 'string' || description.trim() === '') {
        errors.push('Description is required and must be a non empty.');
    }

    if (typeof warranty !== 'string' || isNaN(warranty) || warranty < 0) {
        errors.push('Warranty must be a valid.');
    }

    if (!brand_id || typeof brand_id !== 'number' || brand_id <= 0) {
        errors.push('Brand ID must be a valid number.');
    }

    // Validate other FK IDs
    const numberFields = [
        {key: 'phase_id', value: phase_id},
        {key: 'speed_id', value: speed_id},
        {key: 'horse_power_id', value: horse_power_id},
        {key: 'motor_type_id', value: motor_type_id},
        {key: 'kilo_watt_id', value: kilo_watt_id},
        {key: 'size_id', value: size_id},
        {key: 'gear_box_type_id', value: gear_box_type_id},
    ];

    numberFields.forEach(({key, value}) => {
        if (value && (typeof value !== 'number' || isNaN(value) || value <= 0)) {
            errors.push(`${key} must be a valid number.`);
        }
    });

    // If there are validation errors, throw them
    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Build category_config insert data
    const categoryConfigData = {
        main_category_id: Number(categoryId),
    };

    if (phase_id) categoryConfigData.phase_id = phase_id;
    if (speed_id) categoryConfigData.speed_id = speed_id;
    if (horse_power_id) categoryConfigData.horse_power_id = horse_power_id;
    if (motor_type_id) categoryConfigData.motor_type_id = motor_type_id;
    if (kilo_watt_id) categoryConfigData.kilo_watt_id = kilo_watt_id;
    if (size_id) categoryConfigData.size_id = size_id;
    if (gear_box_type_id) categoryConfigData.gear_box_type_id = gear_box_type_id;

    // Create category config
    const categoryConfig = await DB.category_Config.create({
        data: categoryConfigData,
    });

    // Create product
    const product = await DB.product.create({
        data: {
            title: title.trim(),
            description: description.trim(),
            warranty,
            brand_id,
            status_id: 1,
            category_config_id: categoryConfig.id,
        },
        include: {
            brand: true,
            category_config: {
                include: {
                    main_category: true,
                    phase: true,
                    speed: true,
                    horse_power: true,
                    motor_type: true,
                    kilo_watt: true,
                    size: true,
                    gear_box_type: true,
                },
            },
        },
    });

    return removeNullFields(product);
};

export const updateProducts = async (productId, data) => {
    if (!productId || isNaN(productId)) {
        const error = new Error('Invalid product ID');
        error.errors = ['Product ID must be a number'];
        throw error;
    }

    // Step 1: Prepare product update fields
    const productUpdateData = {};
    if (data.title) productUpdateData.title = data.title;
    if (data.description) productUpdateData.description = data.description;
    if (data.warranty) productUpdateData.warranty = data.warranty;
    if (data.brand_id) productUpdateData.brand_id = data.brand_id;

    // Step 2: Prepare category config if provided
    const categoryConfigData = {};
    if (data.phase_id) categoryConfigData.phase_id = data.phase_id;
    if (data.speed_id) categoryConfigData.speed_id = data.speed_id;
    if (data.horse_power_id) categoryConfigData.horse_power_id = data.horse_power_id;
    if (data.motor_type_id) categoryConfigData.motor_type_id = data.motor_type_id;
    if (data.kilo_watt_id) categoryConfigData.kilo_watt_id = data.kilo_watt_id;
    if (data.size_id) categoryConfigData.size_id = data.size_id;
    if (data.gear_box_type_id) categoryConfigData.gear_box_type_id = data.gear_box_type_id;

    // If there’s config data to update
    if (Object.keys(categoryConfigData).length > 0) {
        const product = await DB.product.findUnique({
            where: {id: Number(productId)},
            select: {category_config_id: true}
        });

        if (!product) {
            const error = new Error('Product not found');
            error.errors = ['Invalid product ID'];
            throw error;
        }

        // Update existing config or create new one
        const newConfig = await DB.category_Config.create({
            data: {
                main_category_id: data.main_category_id || 1, // fallback if missing
                ...categoryConfigData
            }
        });

        productUpdateData.category_config_id = newConfig.id;
    }

    // Step 3: Update the product
    const updatedProduct = await DB.product.update({
        where: {id: Number(productId)},
        data: productUpdateData,
        include: {
            brand: true,
            category_config: {
                include: {
                    main_category: true,
                    phase: true,
                    speed: true,
                    horse_power: true,
                    motor_type: true,
                    kilo_watt: true,
                    size: true,
                    gear_box_type: true
                }
            }
        }
    });
    return removeNullFields(updatedProduct);
};