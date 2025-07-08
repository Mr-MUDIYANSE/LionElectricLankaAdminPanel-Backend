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