import express, { Express, Request, Response } from 'express'
import dotenv from 'dotenv'
import authRouter from './api/Auth/authRouter';
import { isAuthenticated } from './utils/JWT';
import analyticsRouter from './api/Analytics/analyticsRouter';
import moviesRouter from './api/Movies/moviesRouter';
import bookingsRouter from './api/Bookings/bookingsRouter';

dotenv.config()
const app: Express = express();
const port = process.env.PORT;
app.use(express.json())

app.get('/', (req: Request, res: Response) => {
    return res.json({ status: "Welcome to Backend-Interview", createdBy: "Lekhya Sajja" })
})

app.use('/auth', authRouter)
app.use('/analytics', isAuthenticated, analyticsRouter)
app.use('/movies', isAuthenticated, moviesRouter)
app.use('/bookings', isAuthenticated, bookingsRouter)

app.listen(port, () => {
    console.log('Listening to port ', port)
})