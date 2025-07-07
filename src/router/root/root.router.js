import { Router } from "express";
import authRouter from "../auth.router.js";

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
// rootRouter.use('/profile', checkAuth, profileRouter);

export default rootRouter;