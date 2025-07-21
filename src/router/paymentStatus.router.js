import {Router} from "express";
import {getPaymentStatus} from "../controller/paymentStatus.controller.js";

const paymentStatusRouter = Router();

paymentStatusRouter.get('/get/all', getPaymentStatus);

export default paymentStatusRouter;