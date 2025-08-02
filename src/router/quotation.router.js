import {Router} from "express";
import {
    createQuotation, deleteQuotation,
    getAllQuotation,
    getOneQuotation,
    updateQuotation
} from "../controller/quotation.controller.js";

const quotationRouter = Router();

quotationRouter.get('/get/all', getAllQuotation);
quotationRouter.get('/get/one', getOneQuotation);
quotationRouter.post('/create/customer/:id', createQuotation);
quotationRouter.patch('/update', updateQuotation);
quotationRouter.delete('/delete/:id', deleteQuotation);

export default quotationRouter;