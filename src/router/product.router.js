import { Router } from "express";
import {
    createNewProduct, deleteProduct,
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
productRouter.patch('/:productId/category/:categoryId/update', updateProduct);
productRouter.delete('/:productId/delete', deleteProduct);

export default productRouter;