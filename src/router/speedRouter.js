import {Router} from "express";
import {createSpeed, getAllSpeed, getOneSpeed, updateSpeed} from "../controller/speed.controller.js";

const speedRouter = Router();

speedRouter.get('/all', getAllSpeed);
speedRouter.get('/:id', getOneSpeed);
speedRouter.post('/create', createSpeed);
speedRouter.patch('/update/:id', updateSpeed);

export default speedRouter;