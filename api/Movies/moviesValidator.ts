import { check, validationResult } from "express-validator"
import { Response, Request, NextFunction } from "express"


export const validateNewMovie = [
    check('movieName').trim().isLength({ min: 1 }).withMessage('Please enter a valid movie title.'),
    check('showTimings').isArray().withMessage('Show timings is mandatory'),
    check('fromDate').isISO8601().toDate().withMessage('From date is mandatory in date format'),
    check('toDate').isISO8601().toDate().withMessage('To date is mandatory in date format'),
    check('ticketPrice').isNumeric().withMessage('Please enter a valid ticket price'),
    check('maxSeats').isNumeric().withMessage('Please enter a valid seat count')
]

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req).array()
    if (!result.length) return next()
    return res.status(400).json({ success: false, message: result })
}