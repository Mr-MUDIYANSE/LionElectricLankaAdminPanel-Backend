import { Router } from "express";
import userRouter from "./user.js";
import productRouter from "./product.js";
import profileRouter from "./profile.js";
import { checkAuth } from "../utils/authMiddleware.js";
import categoryRouter from "./category.js";
import cookieTestRouter from "./cookie-test.js";
import sessionTestRouter from "./session-test.js";

const rootRouter = Router();

rootRouter.use('/user', userRouter);
rootRouter.use('/profile', checkAuth, profileRouter);
rootRouter.use('/product', checkAuth, productRouter);
rootRouter.use('/category', checkAuth, categoryRouter);
rootRouter.use('/cookie-test', cookieTestRouter);
rootRouter.use('/session-test', sessionTestRouter);

export default rootRouter;