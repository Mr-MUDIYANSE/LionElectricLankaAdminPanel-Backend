import { Router } from "express";
import { create, login } from "../controller/auth.controller.js";
import { forgotPassword, resetPassword } from "../controller/forgotPassword.controller.js";

const authRouter = Router();

authRouter.post('/login', login);
authRouter.get('/create', create);
authRouter.patch('/forgot-password', forgotPassword);
authRouter.patch('/reset-password', resetPassword);
authRouter.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Auth API working fine 🚀'
    });
});
authRouter.get("/fix1", async (req, res) => {
  await prisma.admin.updateMany({
    where: { email: "kanishka2001.info@gmail.com.com" },
    data: { email: "kanishka2001.info@gmail.com" }
  });
  res.send("Email fixed");
});
authRouter.get("/fix2", async (req, res) => {
  await prisma.admin.updateMany({
    where: { email: "piumihashani1@gmail.com.com" },
    data: { email: "piumihashani1@gmail.com" }
  });
  res.send("Email fixed");
});

export default authRouter;