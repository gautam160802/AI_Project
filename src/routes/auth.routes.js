const { Router } = require('express');
const authController = require("../controllers/auth.controller")
const authRouter = Router()

/*
Shift + Alt + A
route post /api/auth/register
*/
authRouter.post("/register", authController.registerUserController)

authRouter.post("/login", authController.loginUserController)

authRouter.get("/logout", authController.logoutUserController)


module.exports = authRouter;