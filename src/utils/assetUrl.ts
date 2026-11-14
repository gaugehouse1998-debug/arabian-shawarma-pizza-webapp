const BASE_URL = import.meta.env.BASE_URL || '/';

function normalizeBase(base: string): string {
  return base.endsWith('/') ? base : `${base}/`;
}

export const LOGO_URL = `${normalizeBase(BASE_URL)}logo.png`;

export const DEFAULT_FOOD_IMAGE = `${normalizeBase(BASE_URL)}assets/images/family_combo_feast_1794391295864.jpg`;
export const DEFAULT_BURGER_IMAGE = `${normalizeBase(BASE_URL)}assets/images/hero_3d_burger_1794391292664.jpg`;

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
