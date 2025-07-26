import { Router } from "express";
import {create, login} from "../controller/auth.controller.js";
import {forgotPassword, resetPassword} from "../controller/forgotPassword.controller.js";

const authRouter = Router();

authRouter.post('/login', login);
authRouter.post('/create', create);
authRouter.patch('/forgot-password', forgotPassword);
authRouter.patch('/reset-password', resetPassword);
authRouter.get('/test', (req, res)=>{
    return res.status(200).send({
        message:"Test"
    })
});

export default authRouter;