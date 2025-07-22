import {Router} from "express";
import {getPaymentMethods} from "../controller/paymentMethod.controller.js";

const paymentMethodRouter = Router();

paymentMethodRouter.get('/get/all', getPaymentMethods);

export default paymentMethodRouter;