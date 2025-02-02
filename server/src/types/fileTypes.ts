import mongoose from "mongoose";
import { Request } from "express";

export interface SheetData {
  sheetName: string;
  numRows: number;
  numValidRows: number;
  numInvalidRows: number;
  validationErrors: Array<{
    rowNumber: number;
    error: string;
  }>;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    _id: mongoose.Types.ObjectId;
    username: string;
  };
  file?: Express.Multer.File;
}

