import { Router } from "express";
import { create, login } from "../controller/auth.controller.js";
import { forgotPassword, resetPassword } from "../controller/forgotPassword.controller.js";

const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/create', create);
authRouter.patch('/forgot-password', forgotPassword);
authRouter.patch('/reset-password', resetPassword);
authRouter.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Auth API working fine 🚀'
    });
});

export default authRouter;