import { Router } from "express";
import {
    createNewProduct,
    filterProducts,
    filterProductsByTitle, getAllProducts,
    getProductsByCategoryId, updateProduct
} from "../controller/product.controller.js";

const productRouter = Router();

productRouter.get('/all', getAllProducts);
productRouter.get('/category/:id', getProductsByCategoryId);
productRouter.get('/category/:id/filter', filterProducts);
productRouter.get('/category/:id/filter/title', filterProductsByTitle);
productRouter.post('/create/category/:id', createNewProduct);
productRouter.patch('/update/:id', updateProduct);

export default productRouter;