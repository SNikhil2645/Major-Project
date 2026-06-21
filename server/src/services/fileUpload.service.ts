import path from 'path';
import fs from 'fs/promises';
import { env } from '../config/env';

export async function saveFile(file: Express.Multer.File): Promise<string> {
  const relativePath = `/uploads/${file.filename}`;
  return relativePath;
}

export async function deleteFile(filePath: string): Promise<void> {
  const absolutePath = path.resolve(env.UPLOAD_DIR, path.basename(filePath));
  try {
    await fs.unlink(absolutePath);
  } catch {
    // File may not exist, ignore
  }
}
