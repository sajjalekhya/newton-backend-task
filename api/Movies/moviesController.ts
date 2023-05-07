import { Request, Response } from "express";
import { ErrorConstants, ServiceError } from "../../utils/errorHandler";
import { serviceConstants } from "../../utils/serviceConstants";
import postgres from "../../utils/Postgres";

export const getMoviesList = async (req: Request, res: Response) => {
    try {
        const selectedDate = req.query.date;
        let result = (await postgres.FetchData(`SELECT public.fnc_get_movies_list($1)`,[selectedDate]))
        let movies = result[0].fnc_get_movies_list
        if (!movies) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `No movies available`);
        res.json({ success: true, movies, count: movies.length })
    } catch (error: any) {
        res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}

export const getShowsListByMovieId = async (req: Request, res: Response) => {
    try {
        const movieId = req.params.movieId;
        let result = (await postgres.FetchData(`SELECT public.fnc_get_shows_list_by_movie_id($1)`,[movieId]))
        let shows = result[0].fnc_get_shows_list_by_movie_id
        if (!shows) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `No shows available`);
        res.json({ success: true, shows, count: shows.length })
    } catch (error: any) {
        res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}

export const getAvailableSeats = async (req: Request, res: Response) => {
    try {
        const showId = req.params.showId;
        const selectedDate = req.query.date;
        let result = (await postgres.FetchData(`SELECT public.fnc_get_available_seats_list_by_show_id($1,$2)`,[showId, selectedDate]))
        let seats = result[0].fnc_get_available_seats_list_by_show_id
        if (!seats) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `No seats available`);
        res.json({ success: true, seats, count: seats.length })
    } catch (error: any) {
        res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}

export const newMovie = async (req: Request, res: Response) => {
    try {
        const reqObj = req.body;
        const userId = req.headers.userId;

        await postgres.InsertOrUpdate(`call sp_create_new_movie($1,$2)`,[reqObj,userId]);

        return res.json({ success:true, info: 'Movie added successfully', code: 201 })
    } catch (error: any) {
        console.log(error)
        return res.status(Number(error.code) || 500).send({ success: false, msg: error.hint || error.message || 'Something went wrong...Please try again after sometime', code: 500 })
    }

}

export const getMoviesListForDeletion = async (req: Request, res: Response) => {
    try {
        let result = (await postgres.FetchData(`SELECT public.fnc_get_movies_list_for_deletion()`,[]))
        let movies = result[0].fnc_get_movies_list_for_deletion
        if (!movies) throw new ServiceError(ErrorConstants.DATA_NOT_FOUND, `No movies available`);
        res.json({ success: true, movies, count: movies.length })
    } catch (error: any) {
        res.status(Number(error.code) || 500).send({ success: false, msg: error.info || error.message })
    }
}

export const deleteMovie = async (req: Request, res: Response) => {
    try {
        const movieId = req.params.movieId;
        const userId = req.headers.userId;

        await postgres.InsertOrUpdate(`call sp_delete_movie_by_id($1,$2)`,[movieId,userId]);

        return res.json({ success:true, info: 'Movie deleted successfully', code: 201 })
    } catch (error: any) {
        console.log(error)
        return res.status(Number(error.code) || 500).send({ success: false, msg: error.hint || error.message || 'Something went wrong...Please try again after sometime', code: 500 })
    }

}