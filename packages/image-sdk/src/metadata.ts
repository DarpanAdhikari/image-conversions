import { MetadataInfo, MetadataOptions } from './types';

export async function readMetadata(file: File): Promise<MetadataInfo> {
  const metadata: MetadataInfo = {};

  if (file.type === 'image/jpeg') {
    try {
      metadata.exif = await readExifData(file);
    } catch {
      metadata.exif = undefined;
    }
  }

  return metadata;
}

async function readExifData(file: File): Promise<Record<string, unknown>> {
  const buffer = await file.arrayBuffer();
  const view = new DataView(buffer);

  if (view.getUint16(0, false) !== 0xffd8) {
    return {};
  }

  const metadata: Record<string, unknown> = {};
  let offset = 2;

  while (offset < buffer.byteLength) {
    const marker = view.getUint16(offset, false);
    offset += 2;

    if (marker === 0xffe1) {
      const length = view.getUint16(offset, false);
      const exifData = parseExif(view, offset + 2, length - 2);
      Object.assign(metadata, exifData);
      break;
    }

    if ((marker & 0xff00) === 0xff00) {
      const length = view.getUint16(offset, false);
      offset += length;
    } else {
      break;
    }
  }

  return metadata;
}

function parseExif(view: DataView, start: number, _length: number): Record<string, unknown> {
  const metadata: Record<string, unknown> = {};

  const header = String.fromCharCode(
    view.getUint8(start),
    view.getUint8(start + 1),
    view.getUint8(start + 2),
    view.getUint8(start + 3)
  );

  if (header !== 'Exif') {
    return metadata;
  }

  const byteOrder = view.getUint16(start + 4, false);
  const littleEndian = byteOrder === 0x4949;

  metadata.byteOrder = littleEndian ? 'Little-endian' : 'Big-endian';

  return metadata;
}

export function generateCustomMetadata(options: MetadataOptions): Record<string, unknown> {
  const custom: Record<string, unknown> = {};

  if (options.custom) {
    Object.assign(custom, options.custom);
  }

  custom.application = '@our-org/image-sdk';
  custom.exportedAt = new Date().toISOString();

  return custom;
}

export async function exportWithMetadata(
  blob: Blob,
  format: string,
  metadata?: MetadataOptions
): Promise<Blob> {
  if (!metadata) {
    return blob;
  }

  if (format === 'png') {
    return addPngTextChunk(blob, metadata);
  }

  return blob;
}

async function addPngTextChunk(
  blob: Blob,
  metadata: MetadataOptions
): Promise<Blob> {
  const buffer = await blob.arrayBuffer();
  const view = new DataView(buffer);

  if (view.getUint32(0, false) !== 0x89504e47) {
    return blob;
  }

  const chunks: ArrayBuffer[] = [];
  chunks.push(buffer.slice(0, 8));

  let offset = 8;

  while (offset < buffer.byteLength) {
    const chunkLength = view.getUint32(offset, false);
    const chunkType = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7)
    );

    if (chunkType === 'IEND') {
      const textData = createPngTextData(metadata);
      if (textData) {
        const textChunk = createPngChunk('tEXt', textData);
        chunks.push(textChunk);
      }
    }

    chunks.push(buffer.slice(offset, offset + 12 + chunkLength));
    offset += 12 + chunkLength;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.byteLength, 0);
  const result = new Uint8Array(totalLength);
  let resultOffset = 0;

  for (const chunk of chunks) {
    result.set(new Uint8Array(chunk), resultOffset);
    resultOffset += chunk.byteLength;
  }

  return new Blob([result], { type: 'image/png' });
}

function createPngTextData(metadata: MetadataOptions): Uint8Array | null {
  const custom = generateCustomMetadata(metadata);
  const text = JSON.stringify(custom);
  const encoder = new TextEncoder();
  return encoder.encode(`Comment\0${text}`);
}

function createPngChunk(type: string, data: Uint8Array): ArrayBuffer {
  const length = data.byteLength;
  const chunk = new ArrayBuffer(12 + length);
  const view = new DataView(chunk);

  view.setUint32(0, length, false);

  const typeBytes = new TextEncoder().encode(type);
  new Uint8Array(chunk).set(typeBytes, 4);

  new Uint8Array(chunk).set(data, 8);

  let crc = 0xffffffff;
  for (let i = 4; i < 8 + length; i++) {
    crc ^= new Uint8Array(chunk)[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  view.setUint32(8 + length, (crc ^ 0xffffffff) >>> 0, false);

  return chunk;
}

export function removeMetadata(blob: Blob): Blob {
  return blob;
}
