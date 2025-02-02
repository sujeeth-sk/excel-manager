import { Request, Response } from "express";
import mongoose, { Types } from "mongoose";
import saveFileData from "../helpers/saveFileData";
import { SheetData, AuthenticatedRequest } from "../types/fileTypes";
import { processExcelFile, parseExcelFile, processWorkbook, parseRow } from "../helpers/excelMethods";

// Declare type extensions for Express Request
declare global {
  namespace Express {
    interface Request {
      user?: {
        _id: mongoose.Types.ObjectId;
        username: string;
      };
      file?: Express.Multer.File;
    }
  }
}



const uploadFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file || !req.user || !req.user._id) {
      res.status(400).json({ error: "No file uploaded" });
      return
    }

    // Load the Excel file using exceljs
    const workbook = await parseExcelFile(req.file.buffer);
    const sheetsData = await processWorkbook(workbook);

    // Save file data to the database
    const savedFile = await saveFileData(req.user._id, req.file, sheetsData);

    res.status(201).json({
      message: "File processed successfully",
      fileId: savedFile._id,
      totalSheets: savedFile.sheets.length,
    });
    return
  } catch (error) {
    console.error("File processing error:", error);
    res.status(500).json({ error: "File processing failed" });
    return
  }
};

export default uploadFile;

