import { Router } from "express";
import {create, login} from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.use('/login', login);
authRouter.use('/create', create);

export default authRouter;