import express, { Request, Response } from "express"
import 'dotenv/config'; 
import cors from "cors";
import app from "./server"
import cookieParser from "cookie-parser";

app.use(express.json());
app.use(cors())
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
    console.log("GET /")
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
} ) 

