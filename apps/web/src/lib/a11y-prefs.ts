/**
 * Accessibility-menu preferences, saved per browser. Applied as data attributes on <html>
 * (styles in globals.css); an inline script in the layout applies them before first paint.
 */
export interface A11yPrefs {
  /** 0 = default, 1..3 = larger text steps */
  text: number;
  contrast: boolean;
  links: boolean;
  font: boolean;
  motion: boolean;
}

export const A11Y_KEY = 'wp.a11y';
export const TEXT_STEPS = [100, 115, 130, 150] as const;
export const DEFAULT_A11Y: A11yPrefs = { text: 0, contrast: false, links: false, font: false, motion: false };

export function readA11y(): A11yPrefs {
  try {
    const saved = JSON.parse(localStorage.getItem(A11Y_KEY) ?? '{}') as Partial<A11yPrefs>;
    const text = Math.min(Math.max(Math.round(Number(saved.text) || 0), 0), TEXT_STEPS.length - 1);
    return { text, contrast: !!saved.contrast, links: !!saved.links, font: !!saved.font, motion: !!saved.motion };
  } catch {
    return DEFAULT_A11Y;
  }
}

export function applyA11y(prefs: A11yPrefs) {
  const el = document.documentElement;
  const set = (name: string, on: boolean, value = '') => (on ? el.setAttribute(name, value) : el.removeAttribute(name));
  set('data-a11y-text', prefs.text > 0, String(prefs.text));
  set('data-a11y-contrast', prefs.contrast);
  set('data-a11y-links', prefs.links);
  set('data-a11y-font', prefs.font);
  set('data-a11y-motion', prefs.motion);
}

export function saveA11y(prefs: A11yPrefs) {
  applyA11y(prefs);
  try {
    localStorage.setItem(A11Y_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode / blocked storage: the settings still apply for this visit.
  }
}

/** Runs before React loads, so a saved text size or contrast never flashes. Keep in sync with applyA11y. */
export const A11Y_BOOT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem('${A11Y_KEY}')||'{}'),e=document.documentElement;if([1,2,3].indexOf(p.text)>-1)e.setAttribute('data-a11y-text',String(p.text));['contrast','links','font','motion'].forEach(function(k){if(p[k])e.setAttribute('data-a11y-'+k,'')})}catch(_){}`;

/** True when the visitor asked for less motion, in the menu or in their system settings. */
export function prefersLessMotion() {
  return document.documentElement.hasAttribute('data-a11y-motion') || window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
