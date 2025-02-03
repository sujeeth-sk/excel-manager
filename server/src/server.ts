
import MyUserController from './routes/auth';
import uploadController from './routes/upload';
import express, { Request, Response } from "express"
import 'dotenv/config'; 
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

const app = express();

app.use(express.json());
app.use(cors())
app.use(cookieParser())
app.use(express.urlencoded({ extended: true })); 

app.use("/api/auth", MyUserController)
app.use("/api/upload", uploadController)


// app.use('/', method)

export default app;