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

    const products = await DB.stock.findMany({
        where: {
            product: {
                status_id: 1,
                category_config: {
                    main_category_id: Number(id)
                }
            }
        },
        include: {
            product: {
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

    const categoryConfigFilter = {
        main_category_id: Number(categoryId),
    }

    const allowedFilterKeys = [
        'phase_id',
        'speed_id',
        'horse_power_id',
        'motor_type_id',
        'kilo_watt_id',
        'size_id',
        'gear_box_type_id'
    ]

    for (const key of allowedFilterKeys) {
        if (filters[key]) {
            categoryConfigFilter[key] = Number(filters[key]);
        }
    }

    const products = await DB.stock.findMany({
        where: {
            product: {
                status_id: 1,
                category_config: categoryConfigFilter
            }
        },
        include: {
            product: {
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

export const getFilteredProductsByTitle = async (categoryId, product_title) => {
    const products = await DB.stock.findMany({
        where: {
            product: {
                status_id: 1,
                title: {
                    contains: product_title,
                    mode: 'insensitive'  // case-insensitive search
                },
            }
        },
        include: {
            product: {
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
    if (!categoryId || isNaN(categoryId)) {
        const error = new Error('Invalid Main Category ID');
        error.errors = ['Main Category ID must be a number'];
        throw error;
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

    // Build category_config insert data dynamically
    const categoryConfigData = {
        main_category_id: Number(categoryId)
    };

    if (phase_id) categoryConfigData.phase_id = phase_id;
    if (speed_id) categoryConfigData.speed_id = speed_id;
    if (horse_power_id) categoryConfigData.horse_power_id = horse_power_id;
    if (motor_type_id) categoryConfigData.motor_type_id = motor_type_id;
    if (kilo_watt_id) categoryConfigData.kilo_watt_id = kilo_watt_id;
    if (size_id) categoryConfigData.size_id = size_id;
    if (gear_box_type_id) categoryConfigData.gear_box_type_id = gear_box_type_id;

    // Step 1: Create category config
    const categoryConfig = await DB.category_Config.create({
        data: categoryConfigData
    });

    // Step 2: Create product
    const product = await DB.product.create({
        data: {
            title,
            description,
            warranty,
            brand_id,
            status_id: 1,
            category_config_id: categoryConfig.id
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

    // Step 3: Create stock record
    // const stock = await DB.stock.create({
    //     data: {
    //         product_id: product.id,
    //         qty,
    //         unit_buying_price,
    //         unit_selling_price
    //     }
    // });

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
            where: { id: Number(productId) },
            select: { category_config_id: true }
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
        where: { id: Number(productId) },
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