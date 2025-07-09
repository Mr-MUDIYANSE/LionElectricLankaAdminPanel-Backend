import { Router } from "express";
import {checkAuth} from "../../utils/authMiddleware.js";
import authRouter from "../auth.router.js";
import speedRouter from "../speedRouter.js";
import phaseRouter from "../phaseRouter.js";
import brandRouter from "../brand.router.js";
import productRouter from "../product.router.js";
import customerRouter from "../customer.route.js";

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/customer', checkAuth, customerRouter);
rootRouter.use('/product', checkAuth, productRouter);
rootRouter.use('/brand', checkAuth, brandRouter);
rootRouter.use('/phase', checkAuth, phaseRouter);
rootRouter.use('/speed', checkAuth, speedRouter);

export default rootRouter;