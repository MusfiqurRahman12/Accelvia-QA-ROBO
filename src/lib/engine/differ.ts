import { DiffResult } from "@/types";
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import sharp from "sharp";

/**
 * Pixel-level image comparison engine using pixelmatch.
 * Normalizes both images to the same dimensions before comparing.
 */
export async function computeDiff(
  refBuffer: Buffer,
  devBuffer: Buffer,
  threshold: number = 0.1
): Promise<DiffResult> {
  // Decode and get dimensions
  const refMeta = await sharp(refBuffer).metadata();
  const devMeta = await sharp(devBuffer).metadata();

  // Use the larger dimensions as the target size
  const targetWidth = Math.max(refMeta.width || 0, devMeta.width || 0);
  const targetHeight = Math.max(refMeta.height || 0, devMeta.height || 0);

  // Resize both to the same dimensions (pad with white if needed)
  const refResized = await sharp(refBuffer)
    .resize(targetWidth, targetHeight, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  const devResized = await sharp(devBuffer)
    .resize(targetWidth, targetHeight, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer();

  // Parse PNGs
  const refPng = PNG.sync.read(refResized);
  const devPng = PNG.sync.read(devResized);

  // Create diff output
  const diffPng = new PNG({ width: targetWidth, height: targetHeight });

  const mismatchPixels = pixelmatch(
    refPng.data,
    devPng.data,
    diffPng.data,
    targetWidth,
    targetHeight,
    {
      threshold,
      includeAA: false,
      alpha: 0.3,
      diffColor: [255, 0, 110], // hot pink for mismatched pixels
      diffColorAlt: [0, 180, 255], // cyan for anti-aliased
    }
  );

  const totalPixels = targetWidth * targetHeight;
  const mismatchPercent = (mismatchPixels / totalPixels) * 100;

  return {
    diffBuffer: PNG.sync.write(diffPng),
    mismatchPercent: Math.round(mismatchPercent * 100) / 100,
    mismatchPixels,
    totalPixels,
  };
}
