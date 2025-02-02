import express from 'express';
import MyUserController from './routes/auth';

const app = express();

app.use("/api/auth", MyUserController)
app.use("/api/upload", uploadController)


// app.use('/', method)

export default app;