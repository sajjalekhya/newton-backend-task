import express, { Router } from "express";
import { validateStudent, validateTeacher, validateUserType } from "../../utils/JWT";
import * as analyticsController from "./analyticsController";
import { validate, validateCreateAssignment, validatesubmitAssignment, validateUpdateAssignment } from "./analyticsValidator";

const analyticsRouter : Router = express.Router()

analyticsRouter.get('/visited/:movieId', analyticsController.getVisitedAnalytics)
analyticsRouter.get('/profits/:movieId', analyticsController.getProfitsAnalytics)

export default analyticsRouter
