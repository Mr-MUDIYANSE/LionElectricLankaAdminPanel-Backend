import {Router} from "express";
import {
    createGearBoxType,
    getAllGearBoxType,
    getOneGearBoxType,
    updateGearBoxType
} from "../controller/gearBoxType.controller.js";

const gearBoxTypeRouter = Router();

gearBoxTypeRouter.get('/all', getAllGearBoxType);
gearBoxTypeRouter.get('/:id', getOneGearBoxType);
gearBoxTypeRouter.post('/create', createGearBoxType);
gearBoxTypeRouter.patch('/update/:id', updateGearBoxType);

export default gearBoxTypeRouter;