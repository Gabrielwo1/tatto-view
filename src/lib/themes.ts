// ── Theme System ──────────────────────────────────────────────────────────────
// Each theme overrides the `ink` color scale via CSS variables.
// CSS variable values use "R G B" format (no commas) so Tailwind opacity
// modifiers like `text-ink-500/30` work correctly.

export type ThemeId = 'ember' | 'violet' | 'cyan' | 'crimson' | 'gold' | 'neon' | 'rose';

export interface Theme {
  id: ThemeId;
  /** Display name shown in UI */
  label: string;
  /** Short description of the vibe */
  description: string;
  /** Hex value of the main accent (ink-500) — for color swatches */
  accent: string;
  vars: {
    '--ink-50':  string;
    '--ink-100': string;
    '--ink-200': string;
    '--ink-300': string;
    '--ink-400': string;
    '--ink-500': string;
    '--ink-600': string;
    '--ink-700': string;
    '--ink-800': string;
    '--ink-900': string;
  };
}

export const THEMES: Record<ThemeId, Theme> = {
  // ── 1. Ember (default — original orange/red) ──────────────────────────────
  ember: {
    id: 'ember',
    label: 'Ember',
    description: 'Laranja intenso — audacioso e enérgico',
    accent: '#ff4500',
    vars: {
      '--ink-50':  '255 245 240',
      '--ink-100': '255 227 213',
      '--ink-200': '255 196 168',
      '--ink-300': '255 155 112',
      '--ink-400': '255 103 51',
      '--ink-500': '255 69 0',
      '--ink-600': '224 51 0',
      '--ink-700': '184 37 0',
      '--ink-800': '138 28 0',
      '--ink-900': '92 17 0',
    },
  },

  // ── 2. Violet — roxo profundo ─────────────────────────────────────────────
  violet: {
    id: 'violet',
    label: 'Violet',
    description: 'Roxo profundo — místico e marcante',
    accent: '#7c3aed',
    vars: {
      '--ink-50':  '245 243 255',
      '--ink-100': '237 233 254',
      '--ink-200': '221 214 254',
      '--ink-300': '196 181 253',
      '--ink-400': '167 139 250',
      '--ink-500': '124 58 237',
      '--ink-600': '109 40 217',
      '--ink-700': '91 33 182',
      '--ink-800': '76 29 149',
      '--ink-900': '46 16 101',
    },
  },

  // ── 3. Chrome — ciano frio ────────────────────────────────────────────────
  cyan: {
    id: 'cyan',
    label: 'Chrome',
    description: 'Ciano frio — moderno e tecnológico',
    accent: '#06b6d4',
    vars: {
      '--ink-50':  '236 254 255',
      '--ink-100': '207 250 254',
      '--ink-200': '165 243 252',
      '--ink-300': '103 232 249',
      '--ink-400': '34 211 238',
      '--ink-500': '6 182 212',
      '--ink-600': '8 145 178',
      '--ink-700': '14 116 144',
      '--ink-800': '21 94 117',
      '--ink-900': '22 78 99',
    },
  },

  // ── 4. Blood — vermelho clássico ──────────────────────────────────────────
  crimson: {
    id: 'crimson',
    label: 'Blood',
    description: 'Vermelho sangue — clássico e visceral',
    accent: '#dc2626',
    vars: {
      '--ink-50':  '254 242 242',
      '--ink-100': '254 226 226',
      '--ink-200': '254 202 202',
      '--ink-300': '252 165 165',
      '--ink-400': '248 113 113',
      '--ink-500': '220 38 38',
      '--ink-600': '185 28 28',
      '--ink-700': '153 27 27',
      '--ink-800': '127 29 29',
      '--ink-900': '69 10 10',
    },
  },

  // ── 5. Gold — dourado âmbar ───────────────────────────────────────────────
  gold: {
    id: 'gold',
    label: 'Gold',
    description: 'Dourado âmbar — luxo e exclusividade',
    accent: '#f59e0b',
    vars: {
      '--ink-50':  '255 251 235',
      '--ink-100': '254 243 199',
      '--ink-200': '253 230 138',
      '--ink-300': '252 211 77',
      '--ink-400': '251 191 36',
      '--ink-500': '245 158 11',
      '--ink-600': '217 119 6',
      '--ink-700': '180 83 9',
      '--ink-800': '146 64 14',
      '--ink-900': '120 53 15',
    },
  },

  // ── 6. Neon — verde underground ───────────────────────────────────────────
  neon: {
    id: 'neon',
    label: 'Neon',
    description: 'Verde neon — underground e punk',
    accent: '#22c55e',
    vars: {
      '--ink-50':  '240 253 244',
      '--ink-100': '220 252 231',
      '--ink-200': '187 247 208',
      '--ink-300': '134 239 172',
      '--ink-400': '74 222 128',
      '--ink-500': '34 197 94',
      '--ink-600': '22 163 74',
      '--ink-700': '21 128 61',
      '--ink-800': '22 101 52',
      '--ink-900': '20 83 45',
    },
  },

  // ── 7. Rose — rosa vibrante ───────────────────────────────────────────────
  rose: {
    id: 'rose',
    label: 'Rose',
    description: 'Rosa vibrante — delicado e marcante',
    accent: '#ec4899',
    vars: {
      '--ink-50':  '253 242 248',
      '--ink-100': '252 231 243',
      '--ink-200': '251 207 232',
      '--ink-300': '249 168 212',
      '--ink-400': '244 114 182',
      '--ink-500': '236 72 153',
      '--ink-600': '219 39 119',
      '--ink-700': '190 24 93',
      '--ink-800': '157 23 77',
      '--ink-900': '131 24 67',
    },
  },
};

// ── Subdomain → theme mapping ─────────────────────────────────────────────
// Domain structure: <studio>.vitrink.app
// Each studio/client registered on vitrink.app can have its own accent theme.
// Add an entry here when onboarding a new studio.
//
// Examples:
//   eldude.vitrink.app     → ember  (default orange)
//   inklab.vitrink.app     → violet
//   chromestudio.vitrink.app → cyan
export const SUBDOMAIN_THEMES: Record<string, ThemeId> = {
  eldude:       'ember',
  // Add new studios below:
  // inklab:    'violet',
  // bloodink:  'crimson',
  // goldtattoo: 'gold',
};

// ── Theme resolution ──────────────────────────────────────────────────────
export function getThemeForHostname(hostname: string): ThemeId {
  // ?theme=violet previews any theme without deploying
  const params = new URLSearchParams(window.location.search);
  const paramTheme = params.get('theme') as ThemeId | null;
  if (paramTheme && THEMES[paramTheme]) return paramTheme;

  // Extract subdomain: eldude.vitrink.app → "eldude"
  const parts = hostname.split('.');
  if (parts.length >= 3) {
    const sub = parts[0].toLowerCase();
    if (SUBDOMAIN_THEMES[sub]) return SUBDOMAIN_THEMES[sub];
  }

  return 'ember'; // default
}

// ── Apply theme to document root ──────────────────────────────────────────
export function applyTheme(themeId: ThemeId) {
  const theme = THEMES[themeId];
  const root = document.documentElement;
  for (const [key, value] of Object.entries(theme.vars)) {
    root.style.setProperty(key, value);
  }
}
