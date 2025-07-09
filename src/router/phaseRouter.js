import {Router} from "express";
import {createPhase, getAllPhase, getOnePhase, updatePhase} from "../controller/phase.controller.js";

const phaseRouter = Router();

phaseRouter.get('/all', getAllPhase);
phaseRouter.get('/:id', getOnePhase);
phaseRouter.post('/create', createPhase);
phaseRouter.patch('/update/:id', updatePhase);

export default phaseRouter;