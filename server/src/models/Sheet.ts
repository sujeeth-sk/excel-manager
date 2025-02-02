import { Schema, model, Document, Types } from 'mongoose';
import ValidationError, { IValidationError } from './ValidationError';

export interface ISheet extends Document {
    sheetName: string;
    numRows: number;
    numValidRows: number;
    numInvalidRows: number;
    validationErrors: Types.Array<IValidationError>;
    fileId: Types.ObjectId;
}

const SheetSchema = new Schema<ISheet>({
    sheetName: { type: String, required: true },
    numRows: { type: Number, required: true },
    numValidRows: { type: Number, required: true },
    numInvalidRows: { type: Number, required: true },
    validationErrors: { type: [ValidationError.schema], default: [] },
    fileId: { type: Schema.Types.ObjectId, ref: 'File', required: true }
});

export default model<ISheet>('Sheet', SheetSchema);