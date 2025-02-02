import { Request, Response } from "express";
import { Workbook, Cell, Row } from "exceljs";
import mongoose, { Types } from "mongoose";
import FileSchema from "../models/File";
import SheetSchema from "../models/Sheet";
// import UserSchema from "../models/User";
import ValidationErrorSchema from "../models/ValidationError";
// import { File } from "multer";

// 1. Declare type extensions for Express Request
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

// 2. Create a custom interface that extends Request
export interface AuthenticatedRequest extends Request {
  user: {
    _id: mongoose.Types.ObjectId;
    username: string;
  };
  file?: Express.Multer.File;
}

export const uploadFile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Load the Excel file using exceljs
    const workbook = await parseExcelFile(req.file.buffer);
    const sheetsData = await processWorkbook(workbook);

    // Save file data to the database
    const savedFile = await saveFileData(req.user._id, req.file, sheetsData);

    return res.status(201).json({
      message: "File processed successfully",
      fileId: savedFile._id,
      totalSheets: savedFile.sheets.length,
    });
  } catch (error) {
    console.error("File processing error:", error);
    return res.status(500).json({ error: "File processing failed" });
  }
};

// Helper Functions
const parseExcelFile = async (buffer: Buffer): Promise<Workbook> => {
  const workbook = new Workbook();
  await workbook.xlsx.load(buffer);
  return workbook;
};

const processWorkbook = async (workbook: Workbook) => {
  const sheetsData: any[] = [];

  workbook.eachSheet((worksheet) => {
    const sheetName = worksheet.name;
    const sheetData = {
      sheetName,
      numRows: worksheet.rowCount,
      numValidRows: 0,
      numInvalidRows: 0,
      validationErrors: [] as any[],
    };

    worksheet.eachRow((row) => {
      const rowData = parseRow(row);
      if (rowData.errors.length > 0) {
        sheetData.validationErrors.push(...rowData.errors);
        sheetData.numInvalidRows++;
      } else {
        sheetData.numValidRows++;
      }
    });

    sheetsData.push(sheetData);
  });

  return sheetsData;
};

const parseRow = (row: any) => {
  const errors: { rowNumber: number; error: string }[] = [];
  const values: Record<string, any> = {};

  row.eachCell((cell: Cell, colNumber: number) => {
    const value = cell.value;
    if (!value) {
      errors.push({
        rowNumber: row.number,
        error: `Column ${colNumber} is required`,
      });
    }
    values[colNumber] = value;
  });

  return { values, errors };
};

interface SheetData {
  sheetName: string;
  numRows: number;
  numValidRows: number;
  numInvalidRows: number;
  validationErrors: Array<{
    rowNumber: number;
    error: string;
  }>;
}

interface SheetData {
  sheetName: string;
  numRows: number;
  numValidRows: number;
  numInvalidRows: number;
  validationErrors: Array<{
    rowNumber: number;
    error: string;
  }>;
}

const saveFileData = async (
  userId: mongoose.Types.ObjectId,
  file: Express.Multer.File,
  sheetsData: SheetData[]
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create File document
    const [newFile] = await FileSchema.create([{
      userId,
      fileName: `${userId.toString()}_${Date.now()}.xlsx`,
      originalFileName: file.originalname,
      fileSize: file.size,
      sheets: []
    }], { session });

    // 2. Process sheets
    for (const sheet of sheetsData) {
      // Create Sheet document
      const [newSheet] = await SheetSchema.create([{
        sheetName: sheet.sheetName,
        numRows: sheet.numRows,
        numValidRows: sheet.numValidRows,
        numInvalidRows: sheet.numInvalidRows,
        fileId: newFile._id
      }], { session });

      // 3. Create Validation Errors if any
      if (sheet.validationErrors.length > 0) {
        await ValidationErrorSchema.create(
          sheet.validationErrors.map((error) => ({
            rowNumber: error.rowNumber,
            error: error.error,
            sheetId: newSheet._id // mongoose.Types.ObjectId
          })),
          { session }
        );
      }

      // 4. Update File with sheet reference
      newFile.sheets.push(newSheet._id);
      await newFile.save({ session });
    }

    await session.commitTransaction();
    return newFile;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
