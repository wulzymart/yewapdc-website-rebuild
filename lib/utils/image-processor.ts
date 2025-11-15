import sharp from "sharp";

export interface ImageSize {
  width: number;
  height: number;
}

export interface ImageVariant {
  width: number;
  buffer: Buffer;
}

export async function getImageSize(buffer: Buffer): Promise<ImageSize> {
  const image = sharp(buffer);
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("Unable to determine image dimensions");
  }

  return {
    width: metadata.width,
    height: metadata.height,
  };
}

export async function createThumbnail(buffer: Buffer, width = 400): Promise<Buffer> {
  return sharp(buffer).resize({ width }).toBuffer();
}

export async function createResponsiveVariants(
  buffer: Buffer,
  widths: number[],
): Promise<ImageVariant[]> {
  const uniqueWidths = Array.from(new Set(widths)).sort((a, b) => a - b);

  const variants: ImageVariant[] = [];
  for (const width of uniqueWidths) {
    const resized = await sharp(buffer).resize({ width }).toBuffer();
    variants.push({ width, buffer: resized });
  }

  return variants;
}
