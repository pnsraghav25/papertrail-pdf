// Papertrail color themes: exact shadcn/ui-style HSL tokens.
// To add a theme, copy one entry, change the key/label/tokens, then rebuild.
// The build script turns these tokens into CSS variables (see themeCss below).

const neutralLight = {
  background: '0 0% 100%', foreground: '240 10% 3.9%',
  card: '0 0% 100%', cardForeground: '240 10% 3.9%',
  popover: '0 0% 100%', popoverForeground: '240 10% 3.9%',
  primaryForeground: '0 0% 98%',
  secondary: '240 4.8% 95.9%', secondaryForeground: '240 5.9% 10%',
  muted: '240 4.8% 95.9%', mutedForeground: '240 3.8% 46.1%',
  accent: '240 4.8% 95.9%', accentForeground: '240 5.9% 10%',
  destructive: '0 84.2% 60.2%', destructiveForeground: '0 0% 98%',
  border: '240 5.9% 90%', input: '240 5.9% 90%',
  radius: '0.5rem',
};

const warmDark = {
  background: '20 14.3% 4.1%', foreground: '0 0% 95%',
  card: '24 9.8% 10%', cardForeground: '0 0% 95%',
  popover: '0 0% 9%', popoverForeground: '0 0% 95%',
  secondary: '240 3.7% 15.9%', secondaryForeground: '0 0% 98%',
  muted: '0 0% 15%', mutedForeground: '240 5% 64.9%',
  accent: '12 6.5% 15.1%', accentForeground: '0 0% 98%',
  destructive: '0 62.8% 30.6%', destructiveForeground: '0 85.7% 97.3%',
  border: '240 3.7% 15.9%', input: '240 3.7% 15.9%',
};

export const DEFAULT_THEME = 'blue';

export const themes = {
  orange: {
    label: 'Orange',
    light: {
      background: '0 0% 100%', foreground: '20 14.3% 4.1%',
      card: '0 0% 100%', cardForeground: '20 14.3% 4.1%',
      popover: '0 0% 100%', popoverForeground: '20 14.3% 4.1%',
      primary: '24.6 95% 53.1%', primaryForeground: '60 9.1% 97.8%',
      secondary: '60 4.8% 95.9%', secondaryForeground: '24 9.8% 10%',
      muted: '60 4.8% 95.9%', mutedForeground: '25 5.3% 44.7%',
      accent: '60 4.8% 95.9%', accentForeground: '24 9.8% 10%',
      destructive: '0 84.2% 60.2%', destructiveForeground: '60 9.1% 97.8%',
      border: '20 5.9% 90%', input: '20 5.9% 90%',
      ring: '24.6 95% 53.1%', radius: '0.5rem',
    },
    dark: {
      background: '20 14.3% 4.1%', foreground: '60 9.1% 97.8%',
      card: '20 14.3% 4.1%', cardForeground: '60 9.1% 97.8%',
      popover: '20 14.3% 4.1%', popoverForeground: '60 9.1% 97.8%',
      primary: '20.5 90.2% 48.2%', primaryForeground: '60 9.1% 97.8%',
      secondary: '12 6.5% 15.1%', secondaryForeground: '60 9.1% 97.8%',
      muted: '12 6.5% 15.1%', mutedForeground: '24 5.4% 63.9%',
      accent: '12 6.5% 15.1%', accentForeground: '60 9.1% 97.8%',
      destructive: '0 72.2% 50.6%', destructiveForeground: '60 9.1% 97.8%',
      border: '12 6.5% 15.1%', input: '12 6.5% 15.1%',
      ring: '20.5 90.2% 48.2%',
    },
  },
  blue: {
    label: 'Blue',
    light: {
      background: '0 0% 100%', foreground: '222.2 84% 4.9%',
      card: '0 0% 100%', cardForeground: '222.2 84% 4.9%',
      popover: '0 0% 100%', popoverForeground: '222.2 84% 4.9%',
      primary: '221.2 83.2% 53.3%', primaryForeground: '210 40% 98%',
      secondary: '210 40% 96.1%', secondaryForeground: '222.2 47.4% 11.2%',
      muted: '210 40% 96.1%', mutedForeground: '215.4 16.3% 46.9%',
      accent: '210 40% 96.1%', accentForeground: '222.2 47.4% 11.2%',
      destructive: '0 84.2% 60.2%', destructiveForeground: '210 40% 98%',
      border: '214.3 31.8% 91.4%', input: '214.3 31.8% 91.4%',
      ring: '221.2 83.2% 53.3%', radius: '0.5rem',
    },
    dark: {
      background: '222.2 84% 4.9%', foreground: '210 40% 98%',
      card: '222.2 84% 4.9%', cardForeground: '210 40% 98%',
      popover: '222.2 84% 4.9%', popoverForeground: '210 40% 98%',
      primary: '217.2 91.2% 59.8%', primaryForeground: '222.2 47.4% 11.2%',
      secondary: '217.2 32.6% 17.5%', secondaryForeground: '210 40% 98%',
      muted: '217.2 32.6% 17.5%', mutedForeground: '215 20.2% 65.1%',
      accent: '217.2 32.6% 17.5%', accentForeground: '210 40% 98%',
      destructive: '0 62.8% 30.6%', destructiveForeground: '210 40% 98%',
      border: '217.2 32.6% 17.5%', input: '217.2 32.6% 17.5%',
      ring: '224.3 76.3% 48%',
    },
  },
  green: {
    label: 'Green',
    light: { ...neutralLight, primary: '142.1 76.2% 36.3%', primaryForeground: '355.7 100% 97.3%', ring: '142.1 76.2% 36.3%' },
    dark: { ...warmDark, primary: '142.1 70.6% 45.3%', primaryForeground: '144.9 80.4% 10%', ring: '142.4 71.8% 29.2%' },
  },
  rose: {
    label: 'Rose',
    light: { ...neutralLight, primary: '346.8 77.2% 49.8%', primaryForeground: '355.7 100% 97.3%', ring: '346.8 77.2% 49.8%' },
    dark: { ...warmDark, primary: '346.8 77.2% 49.8%', primaryForeground: '355.7 100% 97.3%', ring: '346.8 77.2% 49.8%' },
  },
  zinc: {
    label: 'Zinc',
    light: { ...neutralLight, primary: '240 5.9% 10%', ring: '240 5.9% 10%' },
    dark: {
      background: '240 10% 3.9%', foreground: '0 0% 98%',
      card: '240 10% 3.9%', cardForeground: '0 0% 98%',
      popover: '240 10% 3.9%', popoverForeground: '0 0% 98%',
      primary: '0 0% 98%', primaryForeground: '240 5.9% 10%',
      secondary: '240 3.7% 15.9%', secondaryForeground: '0 0% 98%',
      muted: '240 3.7% 15.9%', mutedForeground: '240 5% 64.9%',
      accent: '240 3.7% 15.9%', accentForeground: '0 0% 98%',
      destructive: '0 62.8% 30.6%', destructiveForeground: '0 0% 98%',
      border: '240 3.7% 15.9%', input: '240 3.7% 15.9%',
      ring: '240 4.9% 83.9%',
    },
  },
};

/* ------------------------------------------------------------------ */
/* Glow settings                                                       */
/* ------------------------------------------------------------------ */

// Glow radius slider range, in percent of the default glow size.
export const GLOW_RADIUS = { min: 50, max: 200, step: 10, default: 100 };

/** Clamp a stored/entered radius to the slider range; anything invalid becomes the default. */
export function clampGlowRadius(value) {
  if (value === null || value === undefined || value === '') return GLOW_RADIUS.default;
  const n = Math.round(Number(value) / GLOW_RADIUS.step) * GLOW_RADIUS.step;
  if (!Number.isFinite(n)) return GLOW_RADIUS.default;
  return Math.min(GLOW_RADIUS.max, Math.max(GLOW_RADIUS.min, n));
}

// Glow strength per mode: softer in light mode so colors don't look washed out.
const glow = {
  light: { '--aurora-opacity': '0.55', '--glow-soft': '18%', '--glow-mid': '32%', '--glow-strong': '45%' },
  dark: { '--aurora-opacity': '1', '--glow-soft': '35%', '--glow-mid': '60%', '--glow-strong': '80%' },
};

const toVar = key => '--' + key.replace(/[A-Z]/g, c => '-' + c.toLowerCase());

/** CSS variables for one theme + mode, as an object. */
export function themeVars(name, mode) {
  const theme = themes[name] || themes[DEFAULT_THEME];
  const tokens = theme[mode === 'dark' ? 'dark' : 'light'];
  const vars = {};
  for (const [key, value] of Object.entries(tokens)) {
    vars[toVar(key)] = key === 'radius' ? value : `hsl(${value})`;
  }
  vars['--radius'] = tokens.radius || theme.light.radius;
  Object.assign(vars, glow[mode === 'dark' ? 'dark' : 'light']);
  return vars;
}

const block = (selector, vars, scheme) =>
  `${selector}{color-scheme:${scheme};${Object.entries(vars).map(([k, v]) => `${k}:${v}`).join(';')}}`;

/** Full stylesheet: one rule per theme and mode, keyed by data attributes on <html>. */
export function themeCss() {
  let css = block(':root', themeVars(DEFAULT_THEME, 'light'), 'light') + '\n';
  for (const name of Object.keys(themes)) {
    for (const mode of ['light', 'dark']) {
      css += block(`:root[data-theme="${name}"][data-mode="${mode}"]`, themeVars(name, mode), mode) + '\n';
    }
  }
  return css;
}
