import { ImageFormat } from './types';
import { getExtension } from './convert';

export const DRP_NAME = 'Digital Resolution Pro';
export const DRP_VERSION = '1.0.0';
export const DRP_TAG = 'drp';

export function getDRPVersion(): string {
  return DRP_VERSION;
}

export function getDRPInfo(): { name: string; version: string; tag: string } {
  return { name: DRP_NAME, version: DRP_VERSION, tag: DRP_TAG };
}

export function getDRPFilename(originalName: string, format?: ImageFormat): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const ext = format ? getExtension(format) : '.' + originalName.split('.').pop();
  return `${baseName}-${DRP_TAG}${ext}`;
}

export function isDRPFile(filename: string): boolean {
  const pattern = new RegExp(`-${DRP_TAG}\\.[^.]+$`);
  return pattern.test(filename);
}

export function stripDRPTag(filename: string): string {
  return filename.replace(new RegExp(`-${DRP_TAG}(\\.[^.]+)$`), '$1');
}
