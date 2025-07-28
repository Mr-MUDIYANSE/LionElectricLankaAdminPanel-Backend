import { Router } from "express";
import {checkAuth} from "../../utils/authMiddleware.js";
import authRouter from "../auth.router.js";
import sizeRouter from "../size.router.js";
import speedRouter from "../speedRouter.js";
import phaseRouter from "../phaseRouter.js";
import brandRouter from "../brand.router.js";
import stockRouter from "../stock.router.js";
import invoiceRouter from "../invoice.router.js";
import productRouter from "../product.router.js";
import customerRouter from "../customer.route.js";
import motorTypeRouter from "../motorType.route.js";
import dashboardRouter from "../dashboard.router.js";
import gearBoxTypeRouter from "../gearBoxType.router.js";
import mainCategoryRouter from "../mainCategory.router.js";
import paymentStatusRouter from "../paymentStatus.router.js";
import paymentMethodRouter from "../paymentMethod.router.js";

const rootRouter = Router();

rootRouter.use('/auth', authRouter);
rootRouter.use('/size', checkAuth, sizeRouter);
rootRouter.use('/brand', checkAuth, brandRouter);
rootRouter.use('/phase', checkAuth, phaseRouter);
rootRouter.use('/speed', checkAuth, speedRouter);
rootRouter.use('/stock', checkAuth, stockRouter);
rootRouter.use('/product', checkAuth, productRouter);
rootRouter.use('/invoice', checkAuth, invoiceRouter);
rootRouter.use('/customer', checkAuth, customerRouter);
rootRouter.use('/dashboard', checkAuth, dashboardRouter);
rootRouter.use('/motor-type', checkAuth, motorTypeRouter);
rootRouter.use('/gear-box-type', checkAuth, gearBoxTypeRouter);
rootRouter.use('/main-category', checkAuth, mainCategoryRouter);
rootRouter.use('/payment-method', checkAuth, paymentMethodRouter);
rootRouter.use('/payment-status', checkAuth, paymentStatusRouter);

export default rootRouter;