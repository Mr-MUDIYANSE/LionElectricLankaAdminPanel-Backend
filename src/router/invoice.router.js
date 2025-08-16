import {Router} from "express";
import {
    createInvoice,
    getAllInvoice,
    getOneInvoice,
    updateCheque,
    updateInvoice
} from "../controller/invoice.controller.js";

const invoiceRouter = Router();

invoiceRouter.get('/get/all', getAllInvoice);
invoiceRouter.get('/get/one', getOneInvoice);
invoiceRouter.post('/create/customer/:id', createInvoice);
invoiceRouter.patch('/update/:id', updateInvoice);
invoiceRouter.patch('/update/cheque/payment-history/:id', updateCheque);

export default invoiceRouter;