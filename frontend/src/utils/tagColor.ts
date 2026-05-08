import type { CSSProperties } from 'react';

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function normalizeHexColor(color: string): string | null {
  const value = color.trim();
  if (!HEX_COLOR_PATTERN.test(value)) {
    return null;
  }

  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
  }

  return value.toLowerCase();
}

function hexToRgb(color: string): { r: number; g: number; b: number } | null {
  const normalized = normalizeHexColor(color);
  if (!normalized) {
    return null;
  }

  return {
    r: parseInt(normalized.slice(1, 3), 16),
    g: parseInt(normalized.slice(3, 5), 16),
    b: parseInt(normalized.slice(5, 7), 16),
  };
}

function rgba(color: string, alpha: number): string | null {
  const rgb = hexToRgb(color);
  if (!rgb) {
    return null;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function getSoftTagStyle(color?: string): CSSProperties | undefined {
  if (!color) {
    return undefined;
  }

  const normalized = normalizeHexColor(color);
  const backgroundColor = rgba(color, 0.14);
  const borderColor = rgba(color, 0.38);
  if (!normalized || !backgroundColor || !borderColor) {
    return undefined;
  }

  return {
    backgroundColor,
    borderColor,
    color: normalized,
  };
}
