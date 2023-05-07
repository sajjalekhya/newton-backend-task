import express, { Router } from "express";
import { validateStudent, validateTeacher, validateUserType } from "../../utils/JWT";
import * as moviesController from "./moviesController";
import { validate, validateNewMovie } from "./moviesValidator";

const moviesRouter : Router = express.Router()

moviesRouter.get('/list', moviesController.getMoviesList)
moviesRouter.get('/shows-list/:movieId', moviesController.getShowsListByMovieId)
moviesRouter.get('/seats/:showId', moviesController.getAvailableSeats)
moviesRouter.post('/new-movie', validateNewMovie, validate, moviesController.newMovie)
moviesRouter.get('/list-for-deletion', moviesController.getMoviesListForDeletion)
moviesRouter.put('/delete-movie/:movieId', moviesController.deleteMovie)



export default moviesRouter
