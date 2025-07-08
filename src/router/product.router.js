import { Router } from "express";
import {filterProducts, filterProductsByTitle, getProductsByCategoryId} from "../controller/product.controller.js";

const productRouter = Router();

productRouter.get('/category/:id', getProductsByCategoryId);
productRouter.get('/category/:id/filter', filterProducts);
productRouter.get('/category/:id/filter/title', filterProductsByTitle);
// productRouter.post('/create', create);
// productRouter.patch('/update/:id', update);

export default productRouter;