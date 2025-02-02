import express from 'express';
import MyUserController from './routes/auth';
import uploadController from './routes/upload';

const app = express();

app.use("/api/auth", MyUserController)
app.use("/api/upload", uploadController)


// app.use('/', method)

export default app;