const DEFAULT_COLOR = '#C4643A';

export const safeColor = (hex: string | undefined) =>
  hex && /^#[0-9a-f]{6}$/i.test(hex) ? hex : DEFAULT_COLOR;

// Luminance relative, selon la formule des normes d'accessibilité WCAG
function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Choisit le texte (blanc ou quasi noir) par rapport a la lisibilite
export function readableTextOn(hex: string) {
  const l = luminance(hex);
  const contrastWithWhite = 1.05 / (l + 0.05);
  const contrastWithBlack = (l + 0.05) / 0.05;
  return contrastWithWhite >= contrastWithBlack ? '#ffffff' : '#111111';
}

export const RADIUS = { square: '4px', rounded: '10px', pill: '999px' } as const;