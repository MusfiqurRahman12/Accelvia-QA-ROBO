import fs from "fs/promises";
import path from "path";

/**
 * File storage service.
 * Uses local filesystem storage in development.
 * Can be extended to use Cloudflare R2 / AWS S3 in production.
 */

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

export async function uploadImage(
  buffer: Buffer,
  key: string
): Promise<string> {
  // In production, this would upload to R2/S3
  // For now, save to local filesystem
  await ensureUploadDir();

  const filePath = path.join(UPLOAD_DIR, key);
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, buffer);

  return `/uploads/${key}`;
}

export async function getImageUrl(key: string): Promise<string> {
  return `/uploads/${key}`;
}

export async function deleteImage(key: string): Promise<void> {
  try {
    await fs.unlink(path.join(UPLOAD_DIR, key));
  } catch {
    // File may not exist
  }
}
