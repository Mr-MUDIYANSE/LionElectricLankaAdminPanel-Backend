import {createAdmin, loginAdmin} from "../service/auth.service.js";

export const create = async (req, res) => {
    try {
        const admin = await createAdmin(req.body);

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: admin
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
};

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const { token, admin } = await loginAdmin(username, password);
        res.status(200).json({
            success: true,
            access_token: token,
            data: admin
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: err.message,
            errors: err.errors || [],
            data: null
        });
    }
};