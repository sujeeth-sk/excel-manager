import express, { Request, Response } from "express"
import 'dotenv/config'; 
import cors from "cors";
import app from "./server"
import cookieParser from "cookie-parser";
import mongoose from "mongoose";

mongoose
  .connect(process.env.MONGO_URI || "")
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Error connecting to MongoDB:", err));



app.get('/', () => {
    console.log("GET /")
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`)
} ) 

