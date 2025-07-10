import {Router} from "express";
import {createSize, getAllSize, getOneSize, updateSize} from "../controller/size.controller.js";

const sizeRouter = Router();

sizeRouter.get('/all', getAllSize);
sizeRouter.get('/:id', getOneSize);
sizeRouter.post('/create', createSize);
sizeRouter.patch('/update/:id', updateSize);

export default sizeRouter;