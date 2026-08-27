export interface ExportPreset {
  name: string;
  label: string;
  width: number;
  height: number;
  category: string;
}

export const EXPORT_PRESETS: ExportPreset[] = [
  { name: 'instagram-post', label: 'Instagram Post', width: 1080, height: 1080, category: 'Instagram' },
  { name: 'instagram-story', label: 'Instagram Story', width: 1080, height: 1920, category: 'Instagram' },
  { name: 'instagram-reel', label: 'Instagram Reel', width: 1080, height: 1920, category: 'Instagram' },
  { name: 'twitter-post', label: 'Twitter/X Post', width: 1200, height: 675, category: 'Twitter' },
  { name: 'twitter-header', label: 'Twitter/X Header', width: 1500, height: 500, category: 'Twitter' },
  { name: 'facebook-post', label: 'Facebook Post', width: 1200, height: 630, category: 'Facebook' },
  { name: 'facebook-cover', label: 'Facebook Cover', width: 820, height: 312, category: 'Facebook' },
  { name: 'youtube-thumbnail', label: 'YouTube Thumbnail', width: 1280, height: 720, category: 'YouTube' },
  { name: 'youtube-banner', label: 'YouTube Banner', width: 2560, height: 1440, category: 'YouTube' },
  { name: 'linkedin-post', label: 'LinkedIn Post', width: 1200, height: 627, category: 'LinkedIn' },
  { name: 'linkedin-cover', label: 'LinkedIn Cover', width: 1584, height: 396, category: 'LinkedIn' },
  { name: 'pinterest-pin', label: 'Pinterest Pin', width: 1000, height: 1500, category: 'Pinterest' },
  { name: 'tiktok', label: 'TikTok', width: 1080, height: 1920, category: 'TikTok' },
];

export function getExportPreset(name: string): ExportPreset | undefined {
  return EXPORT_PRESETS.find((p) => p.name === name);
}

export function getPresetsByCategory(): Record<string, ExportPreset[]> {
  return EXPORT_PRESETS.reduce((acc, preset) => {
    if (!acc[preset.category]) {
      acc[preset.category] = [];
    }
    acc[preset.category].push(preset);
    return acc;
  }, {} as Record<string, ExportPreset[]>);
}
