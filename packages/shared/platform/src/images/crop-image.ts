export type CropRect = {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
};
/** Percent rectangle; creates a new file without modifying the source. No image leaves the browser here. */
export async function cropImage(file: File, rect: CropRect): Promise<File> {
  if (
    Object.values(rect).some((v) => !Number.isFinite(v) || v < 0 || v > 100) ||
    rect.width <= 0 ||
    rect.height <= 0 ||
    rect.left + rect.width > 100 ||
    rect.top + rect.height > 100
  )
    throw new Error('CROP_INVALID');
  const bitmap = await createImageBitmap(file);
  try {
    const width = Math.max(1, Math.round((bitmap.width * rect.width) / 100));
    const height = Math.max(1, Math.round((bitmap.height * rect.height) / 100));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('CROP_UNAVAILABLE');
    context.drawImage(
      bitmap,
      (bitmap.width * rect.left) / 100,
      (bitmap.height * rect.top) / 100,
      (bitmap.width * rect.width) / 100,
      (bitmap.height * rect.height) / 100,
      0,
      0,
      width,
      height,
    );
    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((result) => (result ? resolve(result) : reject(new Error('CROP_FAILED'))), 'image/png'),
    );
    return new File([blob], file.name.replace(/\.[^.]+$/, '') + '-crop.png', { type: 'image/png' });
  } finally {
    bitmap.close();
  }
}
