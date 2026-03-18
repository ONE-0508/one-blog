export type ThemeMode = 'light' | 'dark';

export interface ThemeState {
  themeColor: string;
  themeMode: ThemeMode;
  followSystem: boolean;
}

export interface ThemeTokens {
  accentPrimary: string;
  accentSecondary: string;
  accentSoft: string;
  accentUnderlineFrom: string;
  accentUnderlineTo: string;
  accentContrast: string;
  borderSubtle: string;
  dividerSubtle: string;
  chipBg: string;
  chipBorder: string;
  shadowSoft: string;
  shadowSubtle: string;
}

export const THEME_STORAGE_KEY = 'one-blog-theme-state';
export const DEFAULT_THEME_COLOR = '#3B82F6';

interface Rgb {
  r: number;
  g: number;
  b: number;
}

function clamp(value: number, min = 0, max = 255): number {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string): Rgb {
  const normalized = hex.replace('#', '');
  const value =
    normalized.length === 3
      ? normalized
          .split('')
          .map(char => `${char}${char}`)
          .join('')
      : normalized;

  const intValue = Number.parseInt(value, 16);

  return {
    r: (intValue >> 16) & 255,
    g: (intValue >> 8) & 255,
    b: intValue & 255,
  };
}

function rgbToHex(rgb: Rgb): string {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map(channel => clamp(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixColors(base: Rgb, target: Rgb, ratio: number): Rgb {
  return {
    r: Math.round(base.r + (target.r - base.r) * ratio),
    g: Math.round(base.g + (target.g - base.g) * ratio),
    b: Math.round(base.b + (target.b - base.b) * ratio),
  };
}

function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map(channel => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function shiftTowards(hex: string, targetHex: string, ratio: number): string {
  return rgbToHex(mixColors(hexToRgb(hex), hexToRgb(targetHex), ratio));
}

export function normalizeHexColor(value: string): string {
  const candidate = value.trim();
  const valid = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(candidate);
  if (!valid) {
    return DEFAULT_THEME_COLOR;
  }

  if (candidate.length === 4) {
    const expanded = candidate
      .slice(1)
      .split('')
      .map(char => `${char}${char}`)
      .join('');
    return `#${expanded}`.toUpperCase();
  }

  return candidate.toUpperCase();
}

export function createThemeTokens(themeColor: string, mode: ThemeMode): ThemeTokens {
  const normalized = normalizeHexColor(themeColor);
  const accentPrimary = normalized;
  const accentSecondary = shiftTowards(normalized, mode === 'dark' ? '#A78BFA' : '#0EA5E9', 0.35);
  const accentUnderlineFrom = shiftTowards(normalized, '#FFFFFF', mode === 'dark' ? 0.12 : 0.04);
  const accentUnderlineTo = shiftTowards(
    accentSecondary,
    mode === 'dark' ? '#F472B6' : '#1D4ED8',
    0.32
  );

  const borderSubtle = withAlpha(normalized, mode === 'dark' ? 0.24 : 0.26);
  const dividerSubtle = withAlpha(normalized, mode === 'dark' ? 0.2 : 0.22);
  const chipBg = withAlpha(normalized, mode === 'dark' ? 0.2 : 0.12);
  const chipBorder = withAlpha(normalized, mode === 'dark' ? 0.45 : 0.38);
  const accentSoft = withAlpha(normalized, mode === 'dark' ? 0.22 : 0.14);

  const shadowSoft = `0 18px 45px ${withAlpha(normalized, mode === 'dark' ? 0.28 : 0.2)}`;
  const shadowSubtle = `0 10px 30px ${withAlpha(normalized, mode === 'dark' ? 0.22 : 0.16)}`;

  const accentContrast = getLuminance(normalized) > 0.45 ? '#111827' : '#F8FAFC';

  return {
    accentPrimary,
    accentSecondary,
    accentSoft,
    accentUnderlineFrom,
    accentUnderlineTo,
    accentContrast,
    borderSubtle,
    dividerSubtle,
    chipBg,
    chipBorder,
    shadowSoft,
    shadowSubtle,
  };
}
