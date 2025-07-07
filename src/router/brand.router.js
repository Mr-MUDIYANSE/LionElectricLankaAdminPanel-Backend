import { Router } from "express";
import {create, getAll, getOne, update} from "../controller/brand.controller.js";

const brandRouter = Router();

brandRouter.get('/all', getAll);
brandRouter.get('/:id', getOne);
brandRouter.post('/create', create);
brandRouter.patch('/update/:id', update);

export default brandRouter;