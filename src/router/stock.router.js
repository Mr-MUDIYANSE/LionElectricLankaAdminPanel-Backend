import {Router} from "express";
import {createStock, getAllStock, updateStock} from "../controller/stock.controller.js";

const stockRouter = Router();

stockRouter.get('/all', getAllStock);
stockRouter.post('/create', createStock);
stockRouter.patch('/update/:id', updateStock);
// stockRouter.delete('/delete/:id', deleteStock);

export default stockRouter;