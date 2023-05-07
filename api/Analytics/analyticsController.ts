import { Request, Response } from "express";
import { ErrorConstants, ServiceError } from "../../utils/errorHandler";
import { serviceConstants } from "../../utils/serviceConstants";
import postgres from "../../utils/Postgres";


export const getVisitedAnalytics = async (req: Request, res: Response) => {
    try {
        const movieId = req.params.movieId;
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        let result = (await postgres.FetchData(`SELECT fnc_get_analytics_based_on_visits($1,$2,$3)`,[fromDate,toDate,movieId]))
        let analyticsData = result[0].fnc_get_analytics_based_on_visits;
        if (!analyticsData) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `Invalid AssignmentId`);
        res.json({ success: true, analyticsData, count: analyticsData.length })
    } catch (error: any) {
        res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}

export const getProfitsAnalytics = async (req: Request, res: Response) => {
    try {
        const movieId = req.params.movieId;
        const fromDate = req.query.fromDate;
        const toDate = req.query.toDate;
        let result = (await postgres.FetchData(`SELECT fnc_get_analytics_based_on_profits($1,$2,$3)`,[fromDate,toDate,movieId]))
        let analyticsData = result[0].fnc_get_analytics_based_on_profits
        if (!analyticsData) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `Invalid AssignmentId`);
        res.json({ success: true, analyticsData, count: analyticsData.length })
    } catch (error: any) {
        res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}