import { Router } from "express";
import {create, getAll, getOne, remove, update} from "../controller/vendor.controller.js";

const vendorRouter = Router();

vendorRouter.get('/all', getAll);
vendorRouter.get('/:id', getOne);
vendorRouter.post('/create', create);
vendorRouter.patch('/update/:id', update);
vendorRouter.delete('/delete/:id', remove);

export default vendorRouter;