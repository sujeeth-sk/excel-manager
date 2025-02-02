import { Schema, model, Document, Types } from 'mongoose';
import Sheet, { ISheet } from './Sheet';

export interface IFile extends Document {
    userId: Types.ObjectId;
    fileName: string;
    originalFileName: string;
    fileSize?: number;
    uploadDate: Date;
    sheets: Types.Array<ISheet>;
}

const FileSchema = new Schema<IFile>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    fileSize: { type: Number },
    uploadDate: { type: Date, default: Date.now },
    sheets: { type: [Sheet.schema], default: [] }
});

export default model<IFile>('File', FileSchema);