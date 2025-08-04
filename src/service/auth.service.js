import DB from "../db/db.js";
import {hashPassword, comparePassword} from '../utils/bcrypt.js';
import {tokenGenerate} from '../utils/jwt.js';

export const createAdmin = async (data) => {
    const errors = [];

    const { first_name, last_name, username, email, password } = data;

    if (!first_name || typeof first_name !== 'string' || first_name.trim().length < 2) {
        errors.push('First name is required and must be at least 2 characters.');
    }

    if (!last_name || typeof last_name !== 'string' || last_name.trim().length < 2) {
        errors.push('Last name is required and must be at least 2 characters.');
    }

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
        errors.push('Username is required and must be at least 3 characters.');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || typeof email !== 'string' || !emailRegex.test(email)) {
        errors.push('Valid email is required.');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password is required and must be at least 6 characters.');
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid password format.',
            errors: [
                'Password must be at least 8 characters long.',
                'Include at least one uppercase letter, one lowercase letter, one number, and one special character.'
            ],
            data: null
        });
    }

    if (errors.length > 0) {
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    // Check for existing username
    const existingUsername = await DB.admin.findUnique({
        where: {
            username
        }
    });

    if (existingUsername) {
        const error = new Error('Admin creation failed');
        error.errors = ['Username already exists'];
        throw error;
    }

    // Check for existing email
    const existingEmail = await DB.admin.findUnique({
        where: {
            email
        }
    });

    if (existingEmail) {
        const error = new Error('Admin creation failed');
        error.errors = ['Email already exists'];
        throw error;
    }

    const hashedPassword = await hashPassword(password);

    const newAdmin = await DB.admin.create({
        data: {
            first_name,
            last_name,
            username,
            email,
            password: hashedPassword,
            status_id:1
        }
    });

    const { password: _, ...adminWithoutPassword } = newAdmin;
    return adminWithoutPassword;
};

export const loginAdmin = async (username, password) => {
    const errors = [];

    if (!username || typeof username !== 'string' || username.trim().length < 3) {
        errors.push('Username is required and must be at least 3 characters.');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
        errors.push('Password is required and must be at least 6 characters.');
    }

    if (errors.length > 0) {
        // Throw a custom error with a recognizable structure
        const error = new Error('Validation error');
        error.errors = errors;
        throw error;
    }

    const admin = await DB.admin.findUnique({
        where: { username }
    });

    if (!admin) {
        const error = new Error('Invalid username or password');
        error.errors = ['Invalid username or password'];
        throw error;
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
        const error = new Error('Invalid username or password');
        error.errors = ['Invalid username or password'];
        throw error;
    }

    const token = tokenGenerate({
        id: admin.id,
        username: admin.username,
    });

    const { password: _, ...adminWithoutPassword } = admin;

    return { token, admin: adminWithoutPassword };
};
