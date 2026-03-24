// ── Theme System ──────────────────────────────────────────────────────────────
// Each theme overrides the `ink` (primary) and `ink2` (secondary) color scales
// via CSS variables. Values use "R G B" format (no commas) so Tailwind opacity
// modifiers like `text-ink-500/30` work correctly.

export type ThemeId = 'ember' | 'violet' | 'cyan' | 'crimson' | 'gold' | 'neon' | 'rose';
export type LogoColorMode = 'original' | 'white' | 'black' | 'primary' | 'secondary' | 'invert';

export interface Theme {
  id: ThemeId;
  label: string;
  description: string;
  accent: string;  // hex of ink-500  (primary)
  accent2: string; // hex of ink2-500 (secondary)
  vars: {
    '--ink-50':  string; '--ink-100': string; '--ink-200': string;
    '--ink-300': string; '--ink-400': string; '--ink-500': string;
    '--ink-600': string; '--ink-700': string; '--ink-800': string;
    '--ink-900': string;
  };
}

// ── Shade generation utilities ────────────────────────────────────────────────

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToRgbString(h: number, s: number, l: number): string {
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = l - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(Math.max(0, Math.min(255, c * 255)));
  };
  return `${f(0)} ${f(8)} ${f(4)}`;
}

/** Generate a 10-stop shade scale ("R G B" strings) from a base hex color (= stop 500). */
export function generateShades(hex: string, prefix = '--ink'): Record<string, string> {
  if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) return {};
  const [h, s, lBase] = hexToHsl(hex);
  const result: Record<string, string> = {};
  for (const stop of [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) {
    let l: number;
    if (stop === 500) {
      l = lBase;
    } else if (stop < 500) {
      const t = (stop - 50) / 450; // 0 at stop=50, 1 at stop=500
      l = 97 + (lBase - 97) * t;
    } else {
      const t = (stop - 500) / 400; // 0 at stop=500, 1 at stop=900
      l = lBase + (8 - lBase) * t;
    }
    // Reduce saturation for very light shades
    const sAdj = stop <= 200 ? s * (0.25 + 0.75 * (stop / 200)) : s;
    result[`${prefix}-${stop}`] = hslToRgbString(h, sAdj, l);
  }
  return result;
}

/** Convert a hex color to "R G B" string (for the 500 stop). */
export function hexToRgbString(hex: string): string {
  if (!hex || hex.length < 7) return '255 255 255';
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r} ${g} ${b}`;
}

// ── Preset themes ─────────────────────────────────────────────────────────────

export const THEMES: Record<ThemeId, Theme> = {
  // 1. Ember (default — orange/red) ─ secondary: slate-blue
  ember: {
    id: 'ember', label: 'Ember', accent: '#ff4500', accent2: '#3b82f6',
    description: 'Laranja intenso — audacioso e enérgico',
    vars: {
      '--ink-50':  '255 245 240', '--ink-100': '255 227 213',
      '--ink-200': '255 196 168', '--ink-300': '255 155 112',
      '--ink-400': '255 103 51',  '--ink-500': '255 69 0',
      '--ink-600': '224 51 0',    '--ink-700': '184 37 0',
      '--ink-800': '138 28 0',    '--ink-900': '92 17 0',
    },
  },

  // 2. Violet ─ secondary: amber
  violet: {
    id: 'violet', label: 'Violet', accent: '#7c3aed', accent2: '#f59e0b',
    description: 'Roxo profundo — místico e marcante',
    vars: {
      '--ink-50':  '245 243 255', '--ink-100': '237 233 254',
      '--ink-200': '221 214 254', '--ink-300': '196 181 253',
      '--ink-400': '167 139 250', '--ink-500': '124 58 237',
      '--ink-600': '109 40 217',  '--ink-700': '91 33 182',
      '--ink-800': '76 29 149',   '--ink-900': '46 16 101',
    },
  },

  // 3. Chrome (cyan) ─ secondary: rose
  cyan: {
    id: 'cyan', label: 'Chrome', accent: '#06b6d4', accent2: '#f43f5e',
    description: 'Ciano frio — moderno e tecnológico',
    vars: {
      '--ink-50':  '236 254 255', '--ink-100': '207 250 254',
      '--ink-200': '165 243 252', '--ink-300': '103 232 249',
      '--ink-400': '34 211 238',  '--ink-500': '6 182 212',
      '--ink-600': '8 145 178',   '--ink-700': '14 116 144',
      '--ink-800': '21 94 117',   '--ink-900': '22 78 99',
    },
  },

  // 4. Blood (crimson) ─ secondary: amber
  crimson: {
    id: 'crimson', label: 'Blood', accent: '#dc2626', accent2: '#d97706',
    description: 'Vermelho sangue — clássico e visceral',
    vars: {
      '--ink-50':  '254 242 242', '--ink-100': '254 226 226',
      '--ink-200': '254 202 202', '--ink-300': '252 165 165',
      '--ink-400': '248 113 113', '--ink-500': '220 38 38',
      '--ink-600': '185 28 28',   '--ink-700': '153 27 27',
      '--ink-800': '127 29 29',   '--ink-900': '69 10 10',
    },
  },

  // 5. Gold ─ secondary: indigo
  gold: {
    id: 'gold', label: 'Gold', accent: '#f59e0b', accent2: '#6366f1',
    description: 'Dourado âmbar — luxo e exclusividade',
    vars: {
      '--ink-50':  '255 251 235', '--ink-100': '254 243 199',
      '--ink-200': '253 230 138', '--ink-300': '252 211 77',
      '--ink-400': '251 191 36',  '--ink-500': '245 158 11',
      '--ink-600': '217 119 6',   '--ink-700': '180 83 9',
      '--ink-800': '146 64 14',   '--ink-900': '120 53 15',
    },
  },

  // 6. Neon ─ secondary: purple
  neon: {
    id: 'neon', label: 'Neon', accent: '#22c55e', accent2: '#a855f7',
    description: 'Verde neon — underground e punk',
    vars: {
      '--ink-50':  '240 253 244', '--ink-100': '220 252 231',
      '--ink-200': '187 247 208', '--ink-300': '134 239 172',
      '--ink-400': '74 222 128',  '--ink-500': '34 197 94',
      '--ink-600': '22 163 74',   '--ink-700': '21 128 61',
      '--ink-800': '22 101 52',   '--ink-900': '20 83 45',
    },
  },

  // 7. Rose ─ secondary: teal
  rose: {
    id: 'rose', label: 'Rose', accent: '#ec4899', accent2: '#14b8a6',
    description: 'Rosa vibrante — delicado e marcante',
    vars: {
      '--ink-50':  '253 242 248', '--ink-100': '252 231 243',
      '--ink-200': '251 207 232', '--ink-300': '249 168 212',
      '--ink-400': '244 114 182', '--ink-500': '236 72 153',
      '--ink-600': '219 39 119',  '--ink-700': '190 24 93',
      '--ink-800': '157 23 77',   '--ink-900': '131 24 67',
    },
  },
};

// ── Subdomain → theme mapping ─────────────────────────────────────────────────
export const SUBDOMAIN_THEMES: Record<string, ThemeId> = {
  eldude: 'ember',
};

// ── Theme resolution ───────────────────────────────────────────────────────────
export function getThemeForHostname(hostname: string): ThemeId {
  const params = new URLSearchParams(window.location.search);
  const paramTheme = params.get('theme') as ThemeId | null;
  if (paramTheme && THEMES[paramTheme]) return paramTheme;
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const sub = parts[0].toLowerCase();
    if (SUBDOMAIN_THEMES[sub]) return SUBDOMAIN_THEMES[sub];
  }
  return 'ember';
}

// ── Apply preset theme to document root ───────────────────────────────────────
export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId];
  const root = document.documentElement;
  // Primary vars (pre-computed)
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
  // Secondary vars (generated from accent2)
  const ink2 = generateShades(theme.accent2, '--ink2');
  for (const [key, value] of Object.entries(ink2)) {
    root.style.setProperty(key, value);
  }
}

// ── Apply custom hex colors (overrides preset) ─────────────────────────────────
export function applyCustomColors(primary: string | null, secondary: string | null) {
  const root = document.documentElement;
  if (primary && /^#[0-9a-fA-F]{6}$/.test(primary)) {
    const shades = generateShades(primary, '--ink');
    for (const [k, v] of Object.entries(shades)) root.style.setProperty(k, v);
  }
  if (secondary && /^#[0-9a-fA-F]{6}$/.test(secondary)) {
    const shades = generateShades(secondary, '--ink2');
    for (const [k, v] of Object.entries(shades)) root.style.setProperty(k, v);
  }
}
