import mongoose, { Schema, Document } from 'mongoose';

export interface IResourceDocument extends Document {
  title: string;
  description?: string;
  category: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  isActive: boolean;
  uploadedBy: mongoose.Types.ObjectId;
}

const resourceSchema = new Schema<IResourceDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    category: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    mimeType: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

resourceSchema.index({ category: 1 });

export const Resource = mongoose.model<IResourceDocument>('Resource', resourceSchema);
