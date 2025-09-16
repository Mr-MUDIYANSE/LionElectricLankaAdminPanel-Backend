import {Router} from "express";
import {
    createInvoice,
    getAllInvoice, getMetaData,
    getOneInvoice, getPaymentHistory, returnProduct,
    updateCheque,
    updateInvoice
} from "../controller/invoice.controller.js";

const invoiceRouter = Router();

invoiceRouter.get('/get/all', getAllInvoice);
invoiceRouter.get('/get/one', getOneInvoice);
invoiceRouter.get('/get/payment-history', getPaymentHistory);
invoiceRouter.get('/get/meta-data', getMetaData);
invoiceRouter.post('/create/customer/:id', createInvoice);
invoiceRouter.patch('/update/:id', updateInvoice);
invoiceRouter.patch('/update/cheque/payment-history/:id', updateCheque);
invoiceRouter.post('/returns', returnProduct);

export default invoiceRouter;