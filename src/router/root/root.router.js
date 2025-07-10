import { Router } from "express";
import {checkAuth} from "../../utils/authMiddleware.js";
import authRouter from "../auth.router.js";
import sizeRouter from "../size.router.js";
import speedRouter from "../speedRouter.js";
import phaseRouter from "../phaseRouter.js";
import brandRouter from "../brand.router.js";
import productRouter from "../product.router.js";
import customerRouter from "../customer.route.js";
import kiloWattRouter from "../kiloWatt.router.js";
import motorTypeRouter from "../motorType.route.js";
import horsePowerRouter from "../horsePower.router.js";
import gearBoxTypeRouter from "../gearBoxType.js";

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/customer', checkAuth, customerRouter);
rootRouter.use('/product', checkAuth, productRouter);
rootRouter.use('/brand', checkAuth, brandRouter);
rootRouter.use('/phase', checkAuth, phaseRouter);
rootRouter.use('/speed', checkAuth, speedRouter);
rootRouter.use('/horse-power', checkAuth, horsePowerRouter);
rootRouter.use('/motor-type', checkAuth, motorTypeRouter);
rootRouter.use('/kilo-watt', checkAuth, kiloWattRouter);
rootRouter.use('/size', checkAuth, sizeRouter);
rootRouter.use('/gear-box-type', checkAuth, gearBoxTypeRouter);

export default rootRouter;