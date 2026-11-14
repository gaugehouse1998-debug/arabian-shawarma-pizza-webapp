const BASE_URL = import.meta.env.BASE_URL || '/';

function normalizeBase(base: string): string {
  return base.endsWith('/') ? base : `${base}/`;
}

export const LOGO_URL = `${normalizeBase(BASE_URL)}logo.png`;

export const DEFAULT_FOOD_IMAGE = `${normalizeBase(BASE_URL)}assets/images/family_combo_feast_1794391295864.jpg`;
export const DEFAULT_BURGER_IMAGE = `${normalizeBase(BASE_URL)}assets/images/hero_3d_burger_1794391292664.jpg`;

const BROKEN_EXTERNAL_REMAP: Array<{ pattern: RegExp; localPath: string }> = [
  { pattern: /photo-1644787979606-25f0f37beea7/i, localPath: 'assets/images/paratha_roll_bbq_1794391328091.jpg' },
  { pattern: /photo-1648680786518-a6642f6c9135/i, localPath: 'assets/images/arabian_chicken_shawarma_1794391294232.jpg' },
  { pattern: /photo-1576107232684-1279f3908594/i, localPath: 'assets/images/loaded_cheese_fries_1794391295410.jpg' },
  { pattern: /photo-1527477378377-50a89ceb8e21/i, localPath: 'assets/images/family_combo_feast_1794391295864.jpg' },
  { pattern: /photo-1548839140-29a749e1bc4e/i, localPath: 'assets/images/chilled_cold_drinks_1794391330454.jpg' },
  { pattern: /photo-1563599175-e3b7b4ae530f/i, localPath: 'assets/images/gourmet_dip_sauces_1794391329846.jpg' }
];

/**
 * Resolves static public asset URLs and legacy `/src/assets/images/*` paths so
 * every image, banner, and brand logo loads cleanly under both local dev (`/`)
 * and subpath deployments like GitHub Pages (`/arabian-shawarma-pizza-webapp/`).
 */
export function resolveAssetUrl(src?: string | null, fallback = DEFAULT_FOOD_IMAGE): string {
  const base = normalizeBase(BASE_URL);
  if (!src || !src.trim()) {
    return fallback;
  }

  const trimmed = src.trim();

  // Remap known dead/ORB-blocked external URLs to verified bundled assets
  for (const entry of BROKEN_EXTERNAL_REMAP) {
    if (entry.pattern.test(trimmed)) {
      return `${base}${entry.localPath}`;
    }
  }

  // Preserve external HTTP(S), data URLs, and blob previews untouched
  if (/^(https?:)?\/\//i.test(trimmed) || /^(data|blob):/i.test(trimmed)) {
    return trimmed;
  }

  // Remap legacy `/src/assets/images/<file>` or `src/assets/images/<file>` references
  // (including previously persisted items in localStorage/Firestore) into `public/assets/images/`
  const legacySrcMatch = trimmed.match(/^\/?src\/assets\/(.+)$/i);
  if (legacySrcMatch) {
    return `${base}assets/${legacySrcMatch[1].replace(/^\/+/, '')}`;
  }

  // Remap `/logo.png` or `logo.png`
  if (/^\/?logo\.png$/i.test(trimmed)) {
    return LOGO_URL;
  }

  // If already prefixed with the active BASE_URL, return as-is
  if (base !== '/' && trimmed.startsWith(base)) {
    return trimmed;
  }

  // Normalize leading `./` or `/` against BASE_URL
  const cleanRelative = trimmed.replace(/^\.\//, '').replace(/^\/+/, '');
  return `${base}${cleanRelative}`;
}

/**
 * Safely falls back to a bundled local image if an external URL fails to load at runtime.
 */
export function handleImageFallback(
  e: { currentTarget: HTMLImageElement },
  fallback = DEFAULT_FOOD_IMAGE
): void {
  const img = e.currentTarget;
  if (img.dataset.fallbackApplied === '1') return;
  img.dataset.fallbackApplied = '1';
  img.src = fallback;
}

