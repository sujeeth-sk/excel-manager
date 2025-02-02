import { Request, Response } from "express";
import { Workbook } from "exceljs";
import mongoose, { Types } from "mongoose";
import FileSchema from "../models/File";
import UserSchema from "../models/User";
import ValidationErrorSchema from "../models/ValidationError";
import { File } from "multer";

interface MulterRequest extends Request {
  file?: Express.Multer.File; // Use Express.Multer.File type
  user: {
    // Now matches global declaration
    _id: Types.ObjectId;
    username: string;
  };
}

export const uploadFile = async (req: MulterRequest, res: Response) => {
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

  row.eachCell((cell, colNumber) => {
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

const saveFileData = async (
  userId: mongoose.Types.ObjectId,
  file: File,
  sheetsData: any[]
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newFile = await FileSchema.create(
      [
        {
          userId,
          fileName: `${userId}_${Date.now()}.xlsx`,
          originalFileName: file.originalname,
          fileSize: file.size,
          sheets: [],
        },
      ],
      { session }
    );

    for (const sheet of sheetsData) {
      const newSheet = await ValidationErrorSchema.create(
        {
          sheetName: sheet.sheetName,
          numRows: sheet.numRows,
          numValidRows: sheet.numValidRows,
          numInvalidRows: sheet.numInvalidRows,
          validationErrors: sheet.validationErrors,
          fileId: newFile[0]._id,
        },
        { session }
      );

      if (sheet.validationErrors.length > 0) {
        await ValidationErrorSchema.create(
          sheet.validationErrors.map((error) => ({
            ...error,
            sheetId: newSheet._id,
          })),
          { session }
        );
      }
    }

    await session.commitTransaction();
    return newFile[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
