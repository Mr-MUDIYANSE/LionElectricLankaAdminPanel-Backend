import { Router } from "express";
import authRouter from "../auth.router.js";
import customerRouter from "../customer.route.js";
import {checkAuth} from "../../utils/authMiddleware.js";
import brandRouter from "../brand.router.js";

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/customer', checkAuth, customerRouter);
rootRouter.use('/brand', checkAuth, brandRouter);

export default rootRouter;