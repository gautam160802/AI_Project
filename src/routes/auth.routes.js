const { Router } = require('express');
const authController = require("../controllers/auth.controller")
const authRouter = Router()
const authMiddleware = require("../middlewares/auth.middleware")


/*
Shift + Alt + A
route post /api/auth/register
*/
authRouter.post("/register", authController.registerUserController)

authRouter.post("/login", authController.loginUserController)

authRouter.get("/logout", authController.logoutUserController)

authRouter.get("/get-me", authMiddleware.authUser, authController.getMeController)

module.exports = authRouter;