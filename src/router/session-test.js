import { Router } from "express";

const sessionTestRouter = Router();

sessionTestRouter.get('/get-session', (req, res) => {
    req.session['test-session'] = {
        name: 'This is test session',
        age: 10
    }
    res.sendStatus(200);
});

sessionTestRouter.get('/read-session', (req, res) => {
    console.log(req.session);

    res.sendStatus(200);
});

export default sessionTestRouter;
