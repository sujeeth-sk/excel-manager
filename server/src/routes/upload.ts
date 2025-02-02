import express from "express";
import uploadFile from "../contorllers/UploadController";
import multer from "multer";
import authMiddleware from "../middleware/JWTauth";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", authMiddleware, upload.single("file"), uploadFile);

export default router;