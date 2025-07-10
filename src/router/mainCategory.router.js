import {Router} from "express";
import {
    createMainCategory, deleteMainCategory,
    getAllMainCategory,
    getOneMainCategory,
    updateMainCategory
} from "../controller/mainCategory.controller.js";

const mainCategoryRouter = Router();

mainCategoryRouter.get('/all', getAllMainCategory);
mainCategoryRouter.get('/:id', getOneMainCategory);
mainCategoryRouter.post('/create', createMainCategory);
mainCategoryRouter.patch('/update/:id', updateMainCategory);
mainCategoryRouter.delete('/delete/:id', deleteMainCategory);

export default mainCategoryRouter;