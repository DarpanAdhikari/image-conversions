import { getDRPFilename } from 'drp-imagesdk';

const MIME_TYPES: Record<string, { mime: string; ext: string; description: string }> = {
  png:  { mime: 'image/png',  ext: '.png',  description: 'PNG Image' },
  jpeg: { mime: 'image/jpeg', ext: '.jpg',  description: 'JPEG Image' },
  webp: { mime: 'image/webp', ext: '.webp', description: 'WebP Image' },
  gif:  { mime: 'image/gif',  ext: '.gif',  description: 'GIF Image' },
  bmp:  { mime: 'image/bmp',  ext: '.bmp',  description: 'BMP Image' },
};

const ALL_FORMATS = Object.keys(MIME_TYPES);

export function getExtensionForFormat(format: string): string {
  return MIME_TYPES[format]?.ext || `.${format}`;
}

export function getBaseName(filename: string): string {
  return filename.replace(/\.[^/.]+$/, '');
}

function buildSuggestedName(originalName: string, format?: string): string {
  return getDRPFilename(originalName, format as any);
}

function buildTypes(format?: string): { description: string; accept: Record<string, string[]> }[] {
  const formats = format ? [format, ...ALL_FORMATS.filter((f) => f !== format)] : ALL_FORMATS;

  const types: { description: string; accept: Record<string, string[]> }[] = formats.map((f) => ({
    description: MIME_TYPES[f].description,
    accept: { [MIME_TYPES[f].mime]: [MIME_TYPES[f].ext] },
  }));

  types.push({
    description: 'All Images',
    accept: { 'image/*': [] },
  });

  return types;
}

export async function downloadFile(
  blob: Blob,
  originalName: string,
  format?: string
): Promise<void> {
  const suggestedName = buildSuggestedName(originalName, format);

  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName,
        types: buildTypes(format),
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
    }
  }

  const ext = format ? getExtensionForFormat(format) : '';
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${suggestedName}${ext}`;
  a.click();
  URL.revokeObjectURL(a.href);
}
