import { Router } from "express";

const cookieTestRouter = Router();

cookieTestRouter.get('/get-cookie', (req, res) => {
    res.cookie('plain-cookie', 'This is unsigned cookie value', {
        maxAge: 1000 * 60,
        httpOnly: true,
    });

    res.cookie('signed-cookie', 'This is signed cookie value', {
        maxAge: 1000 * 60,
        httpOnly: true,
        signed: true,
    });
    res.send('cookies set.');
});

cookieTestRouter.get('/read-cookie', (req, res) => {
    console.log('Unsigned:', req.cookies);
    console.log('Signed:', req.signedCookies);

    res.send('Check your console for cookies');
});

export default cookieTestRouter;
