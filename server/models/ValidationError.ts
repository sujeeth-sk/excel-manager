import { Schema, Document, model } from 'mongoose';

export interface IValidationError extends Document {
    rowNumber: number;
    error: string;
    sheetId: Schema.Types.ObjectId; // Reference to the parent sheet
}

const ValidationErrorSchema = new Schema<IValidationError>({
    rowNumber: { type: Number, required: true },
    error: { type: String, required: true },
    sheetId: { type: Schema.Types.ObjectId, ref: 'Sheet', required: true } // Link to the parent sheet
});

export default model<IValidationError>('ValidationError', ValidationErrorSchema);