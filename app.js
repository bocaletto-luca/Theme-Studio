/* =========================================================
   Theme Studio - app.js
   Unico file JS con tutta la logica
   ========================================================= */

/* === Stato globale === */
const ThemeTool = {
  currentTheme: null,       // Oggetto tema attivo
  themes: {},               // Collezione temi caricati
  defaultTheme: null        // Tema di base
};

/* === Utility colori === */
function hexToRgb(hex) {
  const clean = hex.replace('#', '');
  const bigint = parseInt(clean, 16);
  return {
    r: (bigint >> 16) & 255,
    g: (bigint >> 8) & 255,
    b: bigint & 255
  };
}
function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map(x => {
    const h = x.toString(16);
    return h.length === 1 ? "0" + h : h;
  }).join('');
}
function rgbToHsl({ r, g, b }) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) { h = s = 0; }
  else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: h = ((b - r) / d + 2); break;
      case b: h = ((r - g) / d + 4); break;
    }
    h /= 6;
  }
  return { h, s, l };
}
function hslToRgb({ h, s, l }) {
  let r, g, b;
  if (s === 0) { r = g = b = l; }
  else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}

/* === Generatore palette HSL === */
function generatePaletteHSL(baseHex) {
  const baseHsl = rgbToHsl(hexToRgb(baseHex));
  const L_STOPS = [0.97,0.93,0.85,0.75,0.6,0.5,0.4,0.3,0.2,0.12];
  const steps = [50,100,200,300,400,500,600,700,800,900];
  const scale = {};
  steps.forEach((k, idx) => {
    let l = L_STOPS[idx];
    let s = baseHsl.s * (1 - Math.abs(0.5 - l) * 0.6);
    let h = baseHsl.h;
    if ((h>=0.95 || h<0.05) || (h>=0.25 && h<=0.42)) s *= 0.9;
    const rgb = hslToRgb({ h, s, l });
    scale[k] = rgbToHex(rgb);
  });
  return scale;
}

/* === Gestione storage === */
function saveTheme(name, themeObj) {
  ThemeTool.themes[name] = themeObj;
  localStorage.setItem('themes', JSON.stringify(ThemeTool.themes));
}
function loadThemes() {
  const stored = localStorage.getItem('themes');
  if (stored) ThemeTool.themes = JSON.parse(stored);
}
function exportThemeJSON(themeObj) {
  const blob = new Blob([JSON.stringify(themeObj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${themeObj.meta.name}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
function importThemeJSON(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const obj = JSON.parse(e.target.result);
      if (obj.meta && obj.tokens) {
        saveTheme(obj.meta.name, obj);
        applyTheme(obj);
      }
    } catch (err) {
      alert('File JSON non valido');
    }
  };
  reader.readAsText(file);
}

/* === Generazione CSS da JSON === */
function generateCSSfromTheme(themeObj) {
  let css = `:root {\n`;
  for (const group in themeObj.tokens) {
    for (const key in themeObj.tokens[group]) {
      css += `  --${group}-${key}: ${themeObj.tokens[group][key]};\n`;
    }
  }
  css += `}\n`;
  return css;
}

/* === Applicazione tema live === */
function applyTheme(themeObj) {
  ThemeTool.currentTheme = themeObj;
  const cssVars = generateCSSfromTheme(themeObj);
  let styleTag = document.getElementById('theme-style');
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'theme-style';
    document.head.appendChild(styleTag);
  }
  styleTag.textContent = cssVars;
}

/* === Event listeners UI === */
document.addEventListener('DOMContentLoaded', () => {
  loadThemes();
  // Carica tema default
  fetch('data/default-theme.json')
    .then(r => r.json())
    .then(json => {
      ThemeTool.defaultTheme = json;
      applyTheme(json);
    });

  document.getElementById('btn-generate-css').addEventListener('click', () => {
    const css = generateCSSfromTheme(ThemeTool.currentTheme);
    document.getElementById('generated-css').value = css;
    document.getElementById('cssDialog').showModal();
  });

  document.getElementById('btn-download-css-modal').addEventListener('click', e => {
    const css = generateCSSfromTheme(ThemeTool.currentTheme);
    const blob = new Blob([css], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    e.target.href = url;
  });

  document.getElementById('btn-export-json').addEventListener('click', () => {
    exportThemeJSON(ThemeTool.currentTheme);
  });

  document.getElementById('btn-import-json').addEventListener('click', () => {
    document.getElementById('input-import-json').click();
  });
  document.getElementById('input-import-json').addEventListener('change', e => {
    if (e.target.files.length) {
      importThemeJSON(e.target.files[0]);
    }
  });
});
