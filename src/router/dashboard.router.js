import {Router} from "express";
import {getDashboardData} from "../controller/dashboard.controller.js";

const dashboardRouter = Router();

dashboardRouter.get('/', getDashboardData);

export default dashboardRouter;