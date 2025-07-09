import {Router} from "express";
import {
    createHorsePower,
    getAllHorsePower,
    getOneHorsePower,
    updateHorsePower
} from "../controller/horsePower.controller.js";

const horsePowerRouter = Router();

horsePowerRouter.get('/all', getAllHorsePower);
horsePowerRouter.get('/:id', getOneHorsePower);
horsePowerRouter.post('/create', createHorsePower);
horsePowerRouter.patch('/update/:id', updateHorsePower);

export default horsePowerRouter;