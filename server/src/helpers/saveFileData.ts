import mongoose from "mongoose";
import { SheetData } from "../types/fileTypes";
import FileSchema from "../models/File";
import SheetSchema from "../models/Sheet";
import ValidationErrorSchema from "../models/ValidationError";

const saveFileData = async (
  userId: mongoose.Types.ObjectId,
  file: Express.Multer.File,
  sheetsData: SheetData[]
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Create File document
    const [newFile] = await FileSchema.create([{
      userId,
      fileName: `${userId.toString()}_${Date.now()}.xlsx`,
      originalFileName: file.originalname,
      fileSize: file.size,
      sheets: []
    }], { session });

    //  Process sheets
    for (const sheet of sheetsData) {
      // Create Sheet document
      const [newSheet] = await SheetSchema.create([{
        sheetName: sheet.sheetName,
        numRows: sheet.numRows,
        numValidRows: sheet.numValidRows,
        numInvalidRows: sheet.numInvalidRows,
        fileId: newFile._id
      }], { session });

      // Create Validation Errors if any
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

      // Update File with sheet reference
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

export default saveFileData