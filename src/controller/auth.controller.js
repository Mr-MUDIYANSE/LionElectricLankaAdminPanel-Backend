import {createAdmin, loginAdmin} from "../service/auth.service.js";

export const create = async (req, res) => {
    try {
        const admin = await createAdmin(req.query);

        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            data: admin
        });
    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Internal Server Error",
            errors: "Internal Server Error",
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
            message: "Internal Server Error",
            errors: "Internal Server Error",
            data: null
        });
    }
};