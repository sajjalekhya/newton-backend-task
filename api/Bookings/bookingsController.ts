import { Request, Response } from "express";
import { ErrorConstants, ServiceError } from "../../utils/errorHandler";
import { serviceConstants } from "../../utils/serviceConstants";
import postgres from "../../utils/Postgres";

export const getBookingList = async (req: Request, res: Response) => {
    try {
        const userId = req.headers.userId;
        let result = (await postgres.FetchData(`SELECT public.fnc_get_all_bookings_by_user_id($1)`,[userId]))
        let bookings = result[0].fnc_get_all_bookings_by_user_id
        if (!bookings) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `No bookings`);
        res.json({ success: true, bookings, count: bookings.length })
    } catch (error: any) {
        res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}

export const newBooking = async (req: Request, res: Response) => {
    try {
        const reqObj = req.body;
        const userId = req.headers.userId;
        await postgres.InsertOrUpdate(`call sp_create_new_booking($1,$2)`,[reqObj,userId]);
        return res.json({ success:true, info: 'Tickets booked successfully', code: 201 })
        
    } catch (error: any) {
        console.log(error)
        return res.status(Number(error.code) || 500).send({ success: false, msg: error.hint || error.message || 'Something went wrong...Please try again after sometime', code: 500 })
    }

}

export const cancelBooking = async (req: Request, res: Response) => {
    try {
        const bookingId = req.params.bookingId;
        await postgres.InsertOrUpdate(`call sp_cancel_booking_by_id($1)`,[bookingId]);
        return res.json({ success:true, info: 'Tickets cancelled successfully', code: 201 })
        
    } catch (error: any) {
        console.log(error)
        return res.status(Number(error.code) || 500).send({ success: false, msg: error.hint || error.message || 'Something went wrong...Please try again after sometime', code: 500 })
    }

}

export const updateBooking = async (req: Request, res: Response) => {
    try {
        const reqObj = req.body;
        const bookingId = req.params.bookingId;
        await postgres.InsertOrUpdate(`call sp_additional_seats_to_booking_by_id($1,$2)`,[reqObj,bookingId]);
        return res.json({ success:true, info: 'Tickets updated successfully', code: 201 })
        
    } catch (error: any) {
        console.log(error)
        return res.status(Number(error.code) || 500).send({ success: false, msg: error.hint || error.message || 'Something went wrong...Please try again after sometime', code: 500 })
    }

}