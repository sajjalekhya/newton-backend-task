import express, { Router } from "express";
import * as authController from "./authController";
import { validate, validateLogIn, validateSignIn } from "./authValidator";


const authRouter: Router = express.Router()

authRouter.post('/signIn', validateSignIn, validate, authController.signIn)
authRouter.post('/logIn', validateLogIn, validate, authController.logIn)
export default authRouter
