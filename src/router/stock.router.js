import {Router} from "express";
import {createStock, getAllStock, getFilterStock, updateStock} from "../controller/stock.controller.js";

const stockRouter = Router();

stockRouter.get('/all', getAllStock);
stockRouter.get('/all/category/:id', getFilterStock);
stockRouter.post('/create/:productId/vendor/:vendorId', createStock);
stockRouter.patch('/update/:id', updateStock);

export default stockRouter;