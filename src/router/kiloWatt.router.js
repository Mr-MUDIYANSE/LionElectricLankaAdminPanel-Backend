import {Router} from "express";
import {createKiloWatt, getAllKiloWatt, getOneKiloWatt, updateKiloWatt} from "../controller/kiloWatt.controller.js";

const kiloWattRouter = Router();

kiloWattRouter.get('/all', getAllKiloWatt);
kiloWattRouter.get('/:id', getOneKiloWatt);
kiloWattRouter.post('/create', createKiloWatt);
kiloWattRouter.patch('/update/:id', updateKiloWatt);

export default kiloWattRouter;