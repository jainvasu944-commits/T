/* ============================================================
   Shared settings module
   Used by both index.html (public page) and admin.html (CMS)
   ============================================================ */

const STORAGE_KEY = 'apologySiteSettings';

const THEME_PRESETS = {
  roseGarden: {
    label: '🌸 Rose Garden',
    bg: '#c2185b',
    bg2: '#fdecf1',
    text: '#3a1220',
    accent: '#d4af6a',
    button: '#b0294f'
  },
  softPink: {
    label: '🌷 Soft Pink',
    bg: '#f3a8c4',
    bg2: '#fff6f9',
    text: '#5a2a3b',
    accent: '#c98fae',
    button: '#d97ca0'
  },
  deepRose: {
    label: '🌹 Deep Rose',
    bg: '#5c0f26',
    bg2: '#fbeef1',
    text: '#fbe9ee',
    accent: '#d4af6a',
    button: '#8c1d3f'
  },
  elegantBlush: {
    label: '✨ Elegant Blush',
    bg: '#f7dbe3',
    bg2: '#ffffff',
    text: '#4a2530',
    accent: '#b98a4f',
    button: '#c77b99'
  }
};

const DEFAULT_SETTINGS = {
  general: {
    friendName: '',
    yourName: '',
    websiteTitle: "Just Something I Wanted To Say",
    tabTitle: "I'm Sorry",
    adminPassword: 'sorry'
  },
  opening: {
    heading: "I'm Sorry",
    subtitle: 'Just wanted to say something...',
    buttonText: 'Open →'
  },
  cards: [
    {
      heading: "I Know I Hurt You",
      message: "I keep replaying it in my head,\nand every time, I land on the same thing:\nI was wrong, and you didn't deserve that."
    },
    {
      heading: "I've Been Thinking",
      message: "About the things I said,\nthe way I said them,\nand how differently I'd handle it now."
    },
    {
      heading: "You Mean So Much To Me",
      message: "This isn't just about fixing a mistake.\nIt's about you — someone I never want to lose\nover something I could've done better."
    },
    {
      heading: "Can We Be Okay?",
      message: "No excuses, no scripts.\nJust me, hoping there's still room\nfor us to laugh about this someday."
    }
  ],
  final: {
    heading: "I'm Truly Sorry",
    message: "Thank you for reading this far.\nIt means more than you know.",
    closing: 'With love, always.',
    replayText: 'Watch Again'
  },
  design: {
    theme: 'roseGarden',
    bg: THEME_PRESETS.roseGarden.bg,
    bg2: THEME_PRESETS.roseGarden.bg2,
    text: THEME_PRESETS.roseGarden.text,
    accent: THEME_PRESETS.roseGarden.accent,
    button: THEME_PRESETS.roseGarden.button
  },
  music: {
    url: '',
    title: '',
    enabled: false
  }
};

// Deep-merge saved settings on top of defaults so new fields introduced
// later never break old saved data.
function mergeSettings(defaults, saved) {
  if (!saved || typeof saved !== 'object') return JSON.parse(JSON.stringify(defaults));
  const out = Array.isArray(defaults) ? [] : {};
  for (const key in defaults) {
    const dVal = defaults[key];
    const sVal = saved[key];
    if (Array.isArray(dVal)) {
      out[key] = Array.isArray(sVal) && sVal.length === dVal.length
        ? dVal.map((d, i) => mergeSettings(d, sVal[i]))
        : JSON.parse(JSON.stringify(dVal));
    } else if (dVal && typeof dVal === 'object') {
      out[key] = mergeSettings(dVal, sVal);
    } else {
      out[key] = (sVal !== undefined && sVal !== null) ? sVal : dVal;
    }
  }
  return out;
}

function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
    const parsed = JSON.parse(raw);
    return mergeSettings(DEFAULT_SETTINGS, parsed);
  } catch (e) {
    console.error('Failed to load settings, using defaults:', e);
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }
}

function saveSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('Failed to save settings:', e);
    return false;
  }
}

function resetSettings() {
  localStorage.removeItem(STORAGE_KEY);
  return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
}

// Replace {{friend}} / {{me}} tokens in editable text with the configured names.
function interpolate(text, settings) {
  if (!text) return '';
  const friend = settings.general.friendName ? settings.general.friendName.trim() : '';
  const me = settings.general.yourName ? settings.general.yourName.trim() : '';
  return text
    .replaceAll('{{friend}}', friend)
    .replaceAll('{{me}}', me);
}

function applyThemeVars(design, rootEl) {
  const root = rootEl || document.documentElement;
  root.style.setProperty('--bg', design.bg);
  root.style.setProperty('--bg2', design.bg2);
  root.style.setProperty('--text', design.text);
  root.style.setProperty('--accent', design.accent);
  root.style.setProperty('--button', design.button);
}
