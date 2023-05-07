import { check, validationResult } from "express-validator"
import { Response, Request, NextFunction } from "express"


// {
//     "movieId": "1",
//     "showId": 2,
//     "selectedSeats": [1,2,10]
// }
export const validateNewBooking = [
    check('movieId').isInt().withMessage('Please send movie id'),
    check('showId').isInt().withMessage('Please send show id'),
    check('selectedSeats').isArray({min: 1, max: 6}).withMessage('Select a max of 6 seats'),
    check('showDate').isISO8601().toDate().withMessage('Show date is mandatory in date format'),
]

export const validateUpdateBooking = [
    check('selectedSeats').isArray({min: 1}).withMessage('Select min 1 seat'),
]

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const result = validationResult(req).array()
    if (!result.length) return next()
    return res.status(400).json({ success: false, message: result })
}