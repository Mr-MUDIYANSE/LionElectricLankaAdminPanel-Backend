import { Router } from "express";
import {create, getAll, getOne, remove, update} from "../../controller/customer.controller.js";

const customerRouter = Router();

customerRouter.get('/get-all', getAll);
customerRouter.get('/:id', getOne);
customerRouter.post('/create', create);
customerRouter.patch('/update/:id', update);
customerRouter.delete('/delete/:id', remove);

export default customerRouter;