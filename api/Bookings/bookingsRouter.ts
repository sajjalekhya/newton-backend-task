import express, { Router } from "express";
import * as bookingsController from "./bookingsController";
import { validate, validateNewBooking, validateUpdateBooking } from "./bookingsValidator";

const bookingsRouter : Router = express.Router()

bookingsRouter.get('/list', bookingsController.getBookingList)
bookingsRouter.post('/new-booking', validateNewBooking, validate, bookingsController.newBooking)
bookingsRouter.put('/cancel-booking/:bookingId', bookingsController.cancelBooking)
bookingsRouter.post('/update-booking/:bookingId', validateUpdateBooking, validate, bookingsController.updateBooking)

export default bookingsRouter
