import {Router} from "express";
import {
    createMotorType,
    getAllMotorType,
    getOneMotorType,
    updateMotorType
} from "../controller/motorType.controller.js";

const motorTypeRouter = Router();

motorTypeRouter.get('/all', getAllMotorType);
motorTypeRouter.get('/:id', getOneMotorType);
motorTypeRouter.post('/create', createMotorType);
motorTypeRouter.patch('/update/:id', updateMotorType);

export default motorTypeRouter;