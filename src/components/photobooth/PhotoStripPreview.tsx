import { forwardRef } from "react";
import type React from "react";
import { PhotoMode, StripLayoutType } from "./ModeSelectionScreen";

interface PhotoStripPreviewProps {
  images: string[];
  mode: PhotoMode;
  frame: string;
  filter?: string;
  hashtag: string;
  customMessage?: string;
  borderColor?: string;
  orientation?: "landscape" | "portrait";
  layoutType?: StripLayoutType;
  /** When true, keep the frame style but hide all label text (no top/bottom text areas) */
  hideLabels?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED LAYOUT CONSTANTS — used by BOTH the DOM preview and the canvas renderer
// ─────────────────────────────────────────────────────────────────────────────

export interface StripLayout {
  // border (frame edge) thickness in px
  BORDER: number;
  // inner padding horizontal / vertical (inside the border, around photo area)
  PAD_H: number;
  PAD_V: number;
  // gap between photos
  GAP: number;
  // top + bottom label area height (0 if no labels for this frame)
  LABEL_H: number;
  // individual photo cell size
  PHOTO_W: number;
  PHOTO_H: number;
  // grid
  cols: number;
  rows: number;
  // full canvas dimensions
  canvasW: number;
  canvasH: number;
  // colors
  bgColor: string;
  borderColor: string;
  // watermark strip width (right side, color-border mode only)
  WATERMARK_W: number;
}

interface FrameDef {
  borderColor: string;
  borderSize: number;
  bgColor: string;
  hasLabels: boolean;
}

const FRAME_DEFS: Record<string, FrameDef> = {
  // ── Classic & Trendy ──────────────────────────────────────────────────────
  none:               { borderColor: "#1a1a2e", borderSize: 6,  bgColor: "#ffffff", hasLabels: false },
  polaroid:           { borderColor: "#f5f0e8", borderSize: 14, bgColor: "#f5f0e8", hasLabels: true  },
  instagram:          { borderColor: "#e1306c", borderSize: 6,  bgColor: "#ffffff", hasLabels: true  },
  tiktok:             { borderColor: "#000000", borderSize: 8,  bgColor: "#000000", hasLabels: true  },
  filmstrip:          { borderColor: "#1a1a1a", borderSize: 14, bgColor: "#1a1a1a", hasLabels: true  },
  "neon-aesthetic":   { borderColor: "#00ffff", borderSize: 6,  bgColor: "#0a0a0a", hasLabels: true  },
  // ── Photo Frames ─────────────────────────────────────────────────────────
  "frame-white":      { borderColor: "#ffffff", borderSize: 20, bgColor: "#ffffff", hasLabels: false },
  "frame-thick-black":{ borderColor: "#111111", borderSize: 24, bgColor: "#ffffff", hasLabels: false },
  "frame-gold-ornate":{ borderColor: "#b8860b", borderSize: 18, bgColor: "#fffef0", hasLabels: true  },
  "frame-rustic-wood":{ borderColor: "#7c4a1e", borderSize: 20, bgColor: "#ffffff", hasLabels: false },
  "frame-silver":     { borderColor: "#9ca3af", borderSize: 16, bgColor: "#f9fafb", hasLabels: false },
  "frame-double":     { borderColor: "#1a1a1a", borderSize: 10, bgColor: "#ffffff", hasLabels: false },
  "frame-rounded":    { borderColor: "#ffffff", borderSize: 18, bgColor: "#ffffff", hasLabels: false },
  "frame-shadow-box": { borderColor: "#e5e7eb", borderSize: 14, bgColor: "#ffffff", hasLabels: false },
  "frame-torn-edge":  { borderColor: "#ffffff", borderSize: 18, bgColor: "#ffffff", hasLabels: false },
  "frame-washi":      { borderColor: "#ffffff", borderSize: 16, bgColor: "#ffffff", hasLabels: false },
  // ── Photography Themes ───────────────────────────────────────────────────
  "film-noir":        { borderColor: "#0d0d0d", borderSize: 14, bgColor: "#0d0d0d", hasLabels: true  },
  "golden-hour":      { borderColor: "#c97b1a", borderSize: 12, bgColor: "#fff8ec", hasLabels: true  },
  "disposable":       { borderColor: "#d4c5a0", borderSize: 10, bgColor: "#faf6ed", hasLabels: true  },
  "darkroom":         { borderColor: "#1a0a00", borderSize: 16, bgColor: "#1a0a00", hasLabels: true  },
  "contact-sheet":    { borderColor: "#2a2a2a", borderSize: 12, bgColor: "#f0ede8", hasLabels: true  },
  "studio-flash":     { borderColor: "#e8e8e8", borderSize: 14, bgColor: "#ffffff", hasLabels: true  },
  "slide-film":       { borderColor: "#1a1a1a", borderSize: 8,  bgColor: "#ffffff", hasLabels: true  },
  "expired-film":     { borderColor: "#8b7355", borderSize: 10, bgColor: "#f5ede0", hasLabels: true  },
  // ── Cute & Aesthetic ─────────────────────────────────────────────────────
  floral:             { borderColor: "#f9a8d4", borderSize: 10, bgColor: "#fff0f5", hasLabels: true  },
  kawaii:             { borderColor: "#f472b6", borderSize: 10, bgColor: "#fff0fb", hasLabels: true  },
  butterfly:          { borderColor: "#a78bfa", borderSize: 10, bgColor: "#f5f0ff", hasLabels: true  },
  scrapbook:          { borderColor: "#f59e0b", borderSize: 10, bgColor: "#fffbeb", hasLabels: true  },
  chalkboard:         { borderColor: "#374151", borderSize: 14, bgColor: "#1e293b", hasLabels: true  },
  // ── Gen Z Vibes ──────────────────────────────────────────────────────────
  npc:                { borderColor: "#94a3b8", borderSize: 8,  bgColor: "#0f172a", hasLabels: true  },
  delulu:             { borderColor: "#f9a8d4", borderSize: 10, bgColor: "#fce7f3", hasLabels: true  },
  ick:                { borderColor: "#fca5a5", borderSize: 10, bgColor: "#fff1f2", hasLabels: true  },
  rizz:               { borderColor: "#fbbf24", borderSize: 10, bgColor: "#fffbeb", hasLabels: true  },
  understood:         { borderColor: "#6366f1", borderSize: 10, bgColor: "#eef2ff", hasLabels: true  },
  lowkey:             { borderColor: "#a3e635", borderSize: 10, bgColor: "#f7fee7", hasLabels: true  },
  slay:               { borderColor: "#e879f9", borderSize: 10, bgColor: "#fdf4ff", hasLabels: true  },
  rentfree:           { borderColor: "#64748b", borderSize: 10, bgColor: "#f8fafc", hasLabels: true  },
  // ── Unique ───────────────────────────────────────────────────────────────
  newspaper:          { borderColor: "#1a1a1a", borderSize: 8,  bgColor: "#f5f0e8", hasLabels: true  },
  comicbook:          { borderColor: "#000000", borderSize: 12, bgColor: "#ffffff", hasLabels: true  },
  idcard:             { borderColor: "#475569", borderSize: 8,  bgColor: "#f8fafc", hasLabels: true  },
  glowdark:           { borderColor: "#86efac", borderSize: 8,  bgColor: "#020617", hasLabels: true  },
  vintage:            { borderColor: "#92400e", borderSize: 12, bgColor: "#fdf6e3", hasLabels: true  },
  // ── Special / Secret ─────────────────────────────────────────────────────
  "joka-day":         { borderColor: "#f9b4cd", borderSize: 22, bgColor: "#fff0f6", hasLabels: false },
  // ── Premium ───────────────────────────────────────────────────────────────
  "gantongan":        { borderColor: "#1a1a1a", borderSize: 40, bgColor: "#1a1a1a", hasLabels: false },

};

const DEFAULT_FRAME: FrameDef = { borderColor: "#1a1a2e", borderSize: 8, bgColor: "#ffffff", hasLabels: false };

/** Returns the exact pixel layout used by BOTH the preview DOM and the canvas export */
export function getStripLayout(
  mode: PhotoMode,
  orientation: "landscape" | "portrait",
  frame: string,
  isColorBorder: boolean,
  hideLabels: boolean = false,
  layoutType: StripLayoutType = "classic-strip",
): StripLayout {
  const isPortrait = orientation === "portrait";

  // ── Layout-type-aware photo dimensions & grid ──────────────────────────────
  let PHOTO_W: number;
  let PHOTO_H: number;
  let cols: number;
  let rows: number;

  switch (layoutType) {
    case "square-strip":
      // Square crop photos stacked vertically
      PHOTO_W = 280;
      PHOTO_H = 280;
      cols = mode === 6 ? 2 : 1;
      rows = mode === 6 ? 3 : mode;
      break;

    case "grid":
      // Force a 2-column grid for all modes
      PHOTO_W = isPortrait ? 240 : 280;
      PHOTO_H = isPortrait ? 280 : 240;
      cols = 2;
      rows = Math.ceil(mode / 2);
      break;

    case "polaroid":
      // Slightly smaller photos with more border (Polaroid feel)
      PHOTO_W = isPortrait ? 220 : 300;
      PHOTO_H = isPortrait ? 300 : 220;
      cols = mode === 6 ? 2 : 1;
      rows = mode === 6 ? 3 : mode;
      break;

    case "classic-strip":
    default:
      // Classic: 4:3 ratio, vertical stack (2-col only for 6)
      PHOTO_W = isPortrait ? 240 : 320;
      PHOTO_H = isPortrait ? 320 : 240;
      cols = mode === 6 ? 2 : 1;
      rows = mode === 6 ? 3 : mode;
      break;
  }

  const GAP = 8;   // gap between photos
  const PAD_H = layoutType === "polaroid" ? 14 : 8;
  const PAD_V = layoutType === "polaroid" ? 14 : 8;

  const frameDef = isColorBorder ? DEFAULT_FRAME : (FRAME_DEFS[frame] ?? DEFAULT_FRAME);
  const BORDER = isColorBorder ? 28 : (layoutType === "polaroid" ? Math.max(frameDef.borderSize, 18) : frameDef.borderSize);
  const LABEL_H = (!isColorBorder && !hideLabels && frameDef.hasLabels) ? 42 : 0;

  // Watermark: carved out of the RIGHT border — does NOT add extra width.
  const WATERMARK_W = isColorBorder ? Math.min(20, BORDER - 4) : 0;

  const photosAreaW = cols * PHOTO_W + (cols - 1) * GAP;
  const photosAreaH = rows * PHOTO_H + (rows - 1) * GAP;

  // Canvas is fully symmetric — watermark sits INSIDE the right BORDER, no extra width
  const canvasW = BORDER + PAD_H + photosAreaW + PAD_H + BORDER;
  const canvasH = BORDER + PAD_V + LABEL_H + photosAreaH + LABEL_H + PAD_V + BORDER;

  return {
    BORDER, PAD_H, PAD_V, GAP, LABEL_H,
    PHOTO_W, PHOTO_H, cols, rows,
    canvasW, canvasH,
    bgColor: isColorBorder ? "#ffffff" : frameDef.bgColor,
    borderColor: frameDef.borderColor,
    WATERMARK_W,
  };
}

// ─── CSS filter map ───────────────────────────────────────────────────────────
export const filterMap: Record<string, string> = {
  none:        "none",
  clarendon:   "contrast(120%) saturate(125%)",
  gingham:     "brightness(105%) hue-rotate(350deg) saturate(110%) contrast(92%)",
  moon:        "grayscale(100%) contrast(110%) brightness(110%)",
  lark:        "contrast(90%) brightness(110%) saturate(130%)",
  reyes:       "sepia(22%) brightness(110%) contrast(85%) saturate(75%)",
  juno:        "saturate(140%) contrast(105%) brightness(105%) sepia(8%)",
  slumber:     "saturate(66%) brightness(105%) sepia(18%) contrast(88%)",
  crema:       "sepia(15%) contrast(90%) brightness(110%) saturate(90%) hue-rotate(5deg)",
  ludwig:      "brightness(105%) contrast(95%) saturate(90%) sepia(10%)",
  aden:        "hue-rotate(20deg) contrast(90%) saturate(85%) brightness(120%)",
  perpetua:    "contrast(90%) brightness(110%) saturate(110%) hue-rotate(340deg)",
  valencia:    "contrast(108%) brightness(108%) sepia(8%) saturate(130%)",
  xpro2:       "sepia(30%) saturate(160%) contrast(110%) brightness(90%)",
  lofi:        "saturate(110%) contrast(150%) brightness(85%)",
  nashville:   "sepia(25%) contrast(115%) brightness(105%) saturate(130%) hue-rotate(350deg)",
  inkwell:     "grayscale(100%) brightness(110%) contrast(110%) sepia(30%)",
  hefe:        "sepia(20%) saturate(150%) contrast(130%) brightness(90%)",
  rise:        "brightness(115%) contrast(90%) saturate(90%) sepia(15%)",
  hudson:      "brightness(120%) contrast(90%) saturate(110%) hue-rotate(10deg)",
};

export function getCssFilter(id: string): string {
  return filterMap[id] ?? "none";
}

// ─── Cross-browser canvas filter support ──────────────────────────────────────
// Safari iOS does NOT support CanvasRenderingContext2D.filter.
// This helper applies filter effects via pixel manipulation as a fallback.

/** Check once whether ctx.filter is actually supported */
let _canvasFilterSupported: boolean | null = null;
function isCanvasFilterSupported(): boolean {
  if (_canvasFilterSupported !== null) return _canvasFilterSupported;
  try {
    const c = document.createElement("canvas");
    c.width = 1;
    c.height = 1;
    const ctx = c.getContext("2d")!;
    ctx.filter = "saturate(120%)";
    _canvasFilterSupported = ctx.filter === "saturate(120%)";
  } catch {
    _canvasFilterSupported = false;
  }
  return _canvasFilterSupported;
}

/** Parse a CSS filter string into individual operations */
function parseFilterOps(css: string): Array<{ fn: string; val: number }> {
  if (!css || css === "none") return [];
  const ops: Array<{ fn: string; val: number }> = [];
  const re = /([\w-]+)\(([^)]+)\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css)) !== null) {
    let val = parseFloat(m[2]);
    if (m[2].includes("%")) val /= 100; // convert 120% → 1.2
    if (m[2].includes("deg")) val = parseFloat(m[2]); // keep degrees as-is
    ops.push({ fn: m[1], val });
  }
  return ops;
}

/** Apply parsed filter ops to ImageData in-place (software fallback) */
function applyFilterOpsToImageData(data: ImageData, ops: Array<{ fn: string; val: number }>) {
  const d = data.data;
  for (const op of ops) {
    for (let i = 0; i < d.length; i += 4) {
      let r = d[i], g = d[i + 1], b = d[i + 2];
      switch (op.fn) {
        case "brightness": {
          const f = op.val;
          r = Math.min(255, r * f);
          g = Math.min(255, g * f);
          b = Math.min(255, b * f);
          break;
        }
        case "contrast": {
          const f = op.val;
          r = Math.min(255, Math.max(0, (r - 128) * f + 128));
          g = Math.min(255, Math.max(0, (g - 128) * f + 128));
          b = Math.min(255, Math.max(0, (b - 128) * f + 128));
          break;
        }
        case "saturate": {
          const s = op.val;
          const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          r = Math.min(255, Math.max(0, gray + s * (r - gray)));
          g = Math.min(255, Math.max(0, gray + s * (g - gray)));
          b = Math.min(255, Math.max(0, gray + s * (b - gray)));
          break;
        }
        case "grayscale": {
          const amount = op.val;
          const gr = 0.2126 * r + 0.7152 * g + 0.0722 * b;
          r = Math.min(255, r + amount * (gr - r));
          g = Math.min(255, g + amount * (gr - g));
          b = Math.min(255, b + amount * (gr - b));
          break;
        }
        case "sepia": {
          const amt = op.val;
          const sr = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
          const sg = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
          const sb = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          r = Math.min(255, r + amt * (sr - r));
          g = Math.min(255, g + amt * (sg - g));
          b = Math.min(255, b + amt * (sb - b));
          break;
        }
        case "hue-rotate": {
          const angle = op.val * Math.PI / 180;
          const cos = Math.cos(angle);
          const sin = Math.sin(angle);
          const nr = r * (0.213 + cos * 0.787 - sin * 0.213) + g * (0.715 - cos * 0.715 - sin * 0.715) + b * (0.072 - cos * 0.072 + sin * 0.928);
          const ng = r * (0.213 - cos * 0.213 + sin * 0.143) + g * (0.715 + cos * 0.285 + sin * 0.140) + b * (0.072 - cos * 0.072 - sin * 0.283);
          const nb = r * (0.213 - cos * 0.213 - sin * 0.787) + g * (0.715 - cos * 0.715 + sin * 0.715) + b * (0.072 + cos * 0.928 + sin * 0.072);
          r = Math.min(255, Math.max(0, nr));
          g = Math.min(255, Math.max(0, ng));
          b = Math.min(255, Math.max(0, nb));
          break;
        }
      }
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
    }
  }
}

/**
 * Draw an image to a canvas region with a CSS filter applied.
 * Uses ctx.filter on supported browsers, falls back to pixel ops on Safari iOS.
 */
export function drawImageWithFilter(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  sx: number, sy: number, sw: number, sh: number,
  dx: number, dy: number, dw: number, dh: number,
  cssFilter: string,
) {
  if (!cssFilter || cssFilter === "none") {
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    return;
  }

  if (isCanvasFilterSupported()) {
    ctx.filter = cssFilter;
    ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
    ctx.filter = "none";
    return;
  }

  // ── Fallback: draw unfiltered, then manipulate pixels ──
  // Use a temp canvas to isolate the filtered region
  const tmp = document.createElement("canvas");
  tmp.width = dw;
  tmp.height = dh;
  const tctx = tmp.getContext("2d")!;
  tctx.drawImage(img, sx, sy, sw, sh, 0, 0, dw, dh);

  const imageData = tctx.getImageData(0, 0, dw, dh);
  const ops = parseFilterOps(cssFilter);
  applyFilterOpsToImageData(imageData, ops);
  tctx.putImageData(imageData, 0, 0);

  ctx.drawImage(tmp, dx, dy);
}

// ─── Frame labels ─────────────────────────────────────────────────────────────
export interface FrameLabels {
  top: string; topBg: string; topColor: string;
  bottom: string; bottomBg: string; bottomColor: string;
  /** CSS font-family for the label text */
  font?: string;
}

const EMPTY_LABELS: FrameLabels = { top: "", topBg: "transparent", topColor: "#fff", bottom: "", bottomBg: "transparent", bottomColor: "#fff" };

const LABEL_MAP: Record<string, FrameLabels> = {
  // ── Classic & Trendy ──────────────────────────────────────────────────────
  polaroid:         { top: "", topBg: "#f5f0e8", topColor: "#888", bottom: "Snap. Pose. Slay. 📷", bottomBg: "#f5f0e8", bottomColor: "#666", font: "'Dancing Script', cursive" },
  instagram:        { top: "📸 puffsnap_official", topBg: "#fff", topColor: "#111", bottom: "❤️ 2,847 likes", bottomBg: "#fff", bottomColor: "#e1306c", font: "'Oswald', sans-serif" },
  tiktok:           { top: "For You | Following", topBg: "#000", topColor: "#fff", bottom: "@puffsnap  🎵 original sound", bottomBg: "#000", bottomColor: "#fff", font: "'Oswald', sans-serif" },
  filmstrip:        { top: "▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓", topBg: "#1a1a1a", topColor: "#ccc", bottom: "▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓ ▓", bottomBg: "#1a1a1a", bottomColor: "#ccc", font: "monospace" },
  "neon-aesthetic": { top: "", topBg: "transparent", topColor: "#0ff", bottom: "✦ PUFFSNAP ✦", bottomBg: "rgba(0,0,0,0.5)", bottomColor: "#0ff", font: "'Monoton', monospace" },
  // ── Photo Frames ─────────────────────────────────────────────────────────
  "frame-gold-ornate": { top: "❧  ✦  ❧", topBg: "#fffef0", topColor: "#b8860b", bottom: "❧  ✦  ❧", bottomBg: "#fffef0", bottomColor: "#b8860b", font: "'Playfair Display', serif" },
  // ── Photography Themes ───────────────────────────────────────────────────
  "film-noir":      { top: "— PUFFSNAP PICTURES —", topBg: "#0d0d0d", topColor: "#c8c8c8", bottom: "A film by YOU  ·  2026", bottomBg: "#0d0d0d", bottomColor: "#888", font: "'Special Elite', monospace" },
  "golden-hour":    { top: "", topBg: "transparent", topColor: "#c97b1a", bottom: "golden hour ✨", bottomBg: "rgba(255,248,236,0.9)", bottomColor: "#a05c10", font: "'Dancing Script', cursive" },
  "disposable":     { top: "disposable memories", topBg: "#d4c5a0", topColor: "#5a4a2a", bottom: `exp. ${new Date().getFullYear()}  ✦  puffsnap`, bottomBg: "#d4c5a0", bottomColor: "#5a4a2a", font: "'Caveat', cursive" },
  "darkroom":       { top: "⬛ DEVELOPING… ⬛", topBg: "#1a0a00", topColor: "#ff4500", bottom: "do not expose to light", bottomBg: "#1a0a00", bottomColor: "#cc3300", font: "'Special Elite', monospace" },
  "contact-sheet":  { top: "CONTACT SHEET  ·  PUFFSNAP", topBg: "#2a2a2a", topColor: "#e0ddd8", bottom: `FRAME 01–0${Math.floor(Math.random()*8+2)}  ·  35mm`, bottomBg: "#2a2a2a", bottomColor: "#aaa", font: "'Oswald', sans-serif" },
  "studio-flash":   { top: "PUFFSNAP STUDIO", topBg: "#e8e8e8", topColor: "#333", bottom: "professional • editorial • iconic", bottomBg: "#e8e8e8", bottomColor: "#888", font: "'Playfair Display', serif" },
  "slide-film":     { top: "KODACHROME  ·  ASA 64", topBg: "#1a1a1a", topColor: "#e8c84a", bottom: `© PUFFSNAP  ${new Date().getFullYear()}`, bottomBg: "#1a1a1a", bottomColor: "#c8c8c8", font: "'Special Elite', monospace" },
  "expired-film":   { top: "expired 2006 ✗", topBg: "#8b7355", topColor: "#f5ede0", bottom: "some memories age like film 🎞️", bottomBg: "#8b7355", bottomColor: "#e8d8b8", font: "'Caveat', cursive" },
  // ── Cute & Aesthetic ─────────────────────────────────────────────────────
  floral:           { top: "🌸  🌼  🌺  🌸  🌼  🌺", topBg: "#fff0f5", topColor: "#f472b6", bottom: "🌸  🌼  🌺  🌸  🌼  🌺", bottomBg: "#fff0f5", bottomColor: "#f472b6", font: "'Dancing Script', cursive" },
  kawaii:           { top: "💖  ⭐  🍬  💜  🍭  💕", topBg: "#fff0fb", topColor: "#f472b6", bottom: "💖  ⭐  🍬  💜  🍭  💕", bottomBg: "#fff0fb", bottomColor: "#f472b6", font: "'Pacifico', cursive" },
  butterfly:        { top: "🦋  💜  🦋  💜  🦋  💜", topBg: "#f5f0ff", topColor: "#a78bfa", bottom: "🦋  💜  🦋  💜  🦋  💜", bottomBg: "#f5f0ff", bottomColor: "#a78bfa", font: "'Dancing Script', cursive" },
  scrapbook:        { top: "", topBg: "transparent", topColor: "#b45309", bottom: "memories ♡", bottomBg: "#fffbeb", bottomColor: "#b45309", font: "'Caveat', cursive" },
  chalkboard:       { top: "✏️  chalk vibes", topBg: "#374151", topColor: "#e2e8f0", bottom: "~ puffsnap ~", bottomBg: "#374151", bottomColor: "#e2e8f0", font: "'Permanent Marker', cursive" },
  // ── Gen Z Vibes ──────────────────────────────────────────────────────────
  npc:              { top: "[ DIALOGUE ]  NPC_001", topBg: "#0f172a", topColor: "#22d3ee", bottom: '> "I have no further dialogue."', bottomBg: "#0f172a", bottomColor: "#94a3b8", font: "'Press Start 2P', monospace" },
  delulu:           { top: "delulu is the solulu ♡", topBg: "#fce7f3", topColor: "#db2777", bottom: "manifesting my main character era ✨", bottomBg: "#fce7f3", bottomColor: "#be185d", font: "'Dancing Script', cursive" },
  ick:              { top: "⚠️  THE ICK HAS BEEN CAUGHT", topBg: "#fff1f2", topColor: "#dc2626", bottom: "cannot be undone. sorry not sorry.", bottomBg: "#fff1f2", bottomColor: "#ef4444", font: "'Oswald', sans-serif" },
  rizz:             { top: "W RIZZ UNLOCKED 🔓", topBg: "#fffbeb", topColor: "#d97706", bottom: "no cap, you ate & left no crumbs", bottomBg: "#fffbeb", bottomColor: "#92400e", font: "'Abril Fatface', serif" },
  understood:       { top: "UNDERSTOOD THE ASSIGNMENT", topBg: "#6366f1", topColor: "#fff", bottom: "periodt. full marks. no notes.", bottomBg: "#eef2ff", bottomColor: "#4338ca", font: "'Oswald', sans-serif" },
  lowkey:           { top: "lowkey that girl era", topBg: "#f7fee7", topColor: "#4d7c0f", bottom: "quiet confidence. soft life. winning.", bottomBg: "#f7fee7", bottomColor: "#65a30d", font: "'Caveat', cursive" },
  slay:             { top: "S  L  A  Y  ✨", topBg: "#e879f9", topColor: "#fff", bottom: "you ate. you slayed. you conquered.", bottomBg: "#a855f7", bottomColor: "#fff", font: "'Abril Fatface', serif" },
  rentfree:         { top: "RENT: $0.00/mo  •  STATUS: living", topBg: "#f1f5f9", topColor: "#475569", bottom: "living rent free in my head forever", bottomBg: "#f1f5f9", bottomColor: "#334155", font: "'Special Elite', monospace" },
  // ── Unique ───────────────────────────────────────────────────────────────
  newspaper:        { top: "THE PUFFSNAP TIMES  📰", topBg: "#f5f0e8", topColor: "#1a1a1a", bottom: "BREAKING: Party of the Year! 🎉", bottomBg: "#f5f0e8", bottomColor: "#1a1a1a", font: "'Playfair Display', serif" },
  comicbook:        { top: "💥  POW!  •  BAM!  •  ZAP!  💥", topBg: "#ffff00", topColor: "#000", bottom: "PUFFSNAP STRIKES AGAIN! 🦸", bottomBg: "#ff3b3b", bottomColor: "#fff", font: "'Bangers', cursive" },
  idcard:           { top: "🪪  PUFFSNAP EVENT PASS", topBg: "#1d4ed8", topColor: "#fff", bottom: `ID: #${Math.floor(Math.random() * 90000 + 10000)}  ·  ${new Date().toLocaleDateString()}`, bottomBg: "#f8fafc", bottomColor: "#475569", font: "'Oswald', sans-serif" },
  glowdark:         { top: "", topBg: "transparent", topColor: "#86efac", bottom: "✦  GLOW IN THE DARK  ✦", bottomBg: "rgba(0,0,0,0.6)", bottomColor: "#86efac", font: "'Monoton', monospace" },
  vintage:          { top: "", topBg: "transparent", topColor: "#92400e", bottom: "✦  Vintage Memories  ✦", bottomBg: "rgba(253,246,227,0.9)", bottomColor: "#92400e", font: "'Dancing Script', cursive" },
  // ── Premium ───────────────────────────────────────────────────────────────

};

export function getFrameLabels(frame: string): FrameLabels {
  return LABEL_MAP[frame] ?? EMPTY_LABELS;
}

/** Returns true if this frame has label text by default */
export function frameHasLabels(frame: string): boolean {
  const def = FRAME_DEFS[frame];
  return !!def?.hasLabels && !!(LABEL_MAP[frame]?.top || LABEL_MAP[frame]?.bottom);
}

// ─── isLight helper ───────────────────────────────────────────────────────────
function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 155;
}

// ─── Gantongan (Film Strip) overlay ──────────────────────────────────────────
function GantonganOverlay({ layout }: { layout: StripLayout }) {
  const { BORDER, canvasW, canvasH, PHOTO_H, rows, GAP, PAD_V, LABEL_H } = layout;
  // sprocket hole size and spacing
  const holeW = Math.round(BORDER * 0.35);
  const holeH = Math.round(holeW * 1.3);
  const holeCount = rows * 3 + 2;
  const stripH = canvasH - BORDER * 2;
  const holeSpacing = stripH / holeCount;

  const holes = Array.from({ length: holeCount }, (_, i) => {
    const y = BORDER + holeSpacing * (i + 0.5) - holeH / 2;
    return y;
  });

  return (
    <>
      {/* Left sprocket holes */}
      {holes.map((y, i) => (
        <div
          key={"L" + i}
          style={{
            position: "absolute",
            left: Math.round((BORDER - holeW) / 2),
            top: Math.round(y),
            width: holeW,
            height: holeH,
            background: "#fff",
            borderRadius: 3,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        />
      ))}
      {/* Right sprocket holes */}
      {holes.map((y, i) => (
        <div
          key={"R" + i}
          style={{
            position: "absolute",
            right: Math.round((BORDER - holeW) / 2),
            top: Math.round(y),
            width: holeW,
            height: holeH,
            background: "#fff",
            borderRadius: 3,
            boxShadow: "inset 0 1px 2px rgba(0,0,0,0.4)",
            pointerEvents: "none",
          }}
        />
      ))}
      {/* Film strip edge lines */}
      <div style={{ position: "absolute", left: BORDER - 2, top: 0, width: 2, height: canvasH, background: "rgba(255,255,255,0.15)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", right: BORDER - 2, top: 0, width: 2, height: canvasH, background: "rgba(255,255,255,0.15)", pointerEvents: "none" }} />
    </>
  );
}

// ─── Frame overlay JSX decorations ───────────────────────────────────────────
function FrameOverlay({ frame, customMessage, layout }: { frame: string; customMessage?: string; layout: StripLayout }) {
  const { LABEL_H, PAD_V, BORDER, PAD_H, PHOTO_W, cols, GAP } = layout;
  const photosW = cols * PHOTO_W + (cols - 1) * GAP;
  const labels = getFrameLabels(frame);
  const labelFont = labels.font ?? "sans-serif";

  const topY    = BORDER + PAD_V;
  const bottomY = BORDER + PAD_V + LABEL_H + (layout.rows * layout.PHOTO_H + (layout.rows - 1) * GAP);

  const labelStyle = (fontSize: number, color: string): React.CSSProperties => ({
    color,
    fontSize,
    fontWeight: 700,
    fontFamily: labelFont,
    whiteSpace: "nowrap",
    lineHeight: 1,
    letterSpacing: "0.02em",
  });

  return (
    <>
      {LABEL_H > 0 && labels.top && (
        <div
          style={{
            position: "absolute",
            left: BORDER + PAD_H,
            top: topY,
            width: photosW,
            height: LABEL_H,
            background: labels.topBg === "transparent" ? undefined : labels.topBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <span style={labelStyle(Math.round(LABEL_H * 0.40), labels.topColor)}>
            {labels.top}
          </span>
        </div>
      )}
      {LABEL_H > 0 && labels.bottom && (
        <div
          style={{
            position: "absolute",
            left: BORDER + PAD_H,
            top: bottomY,
            width: photosW,
            height: LABEL_H,
            background: labels.bottomBg === "transparent" ? undefined : labels.bottomBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <span style={labelStyle(Math.round(LABEL_H * 0.38), labels.bottomColor)}>
            {customMessage && frame === "polaroid" ? customMessage : labels.bottom}
          </span>
        </div>
      )}
    </>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const PhotoStripPreview = forwardRef<HTMLDivElement, PhotoStripPreviewProps>(
  ({ images, mode, frame, filter = "none", hashtag, customMessage, borderColor, orientation = "landscape", layoutType = "classic-strip", hideLabels = false }, ref) => {

    const isColorBorder = !!borderColor;
    const layout = getStripLayout(mode, orientation, frame, isColorBorder, hideLabels, layoutType);
    const { BORDER, PAD_H, PAD_V, GAP, LABEL_H, PHOTO_W, PHOTO_H, cols, rows, canvasW, canvasH, bgColor, WATERMARK_W } = layout;

    const cssFilter = getCssFilter(filter);

    // Build wrapper border style from frame def
    const frameDef = FRAME_DEFS[frame] ?? DEFAULT_FRAME;
    const wrapperBg = isColorBorder ? "#ffffff" : frameDef.bgColor;
    const wrapperBorderColor = isColorBorder ? borderColor : frameDef.borderColor;

    const photosAreaOffsetX = BORDER + PAD_H;
    const photosAreaOffsetY = BORDER + PAD_V + LABEL_H;

    /* ── PuffSnap watermark sidebar (color border mode) ── */
    const renderWatermark = () => {
      if (!isColorBorder || WATERMARK_W === 0) return null;
      const textColor = isLight(borderColor!) ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)";
      return (
        <div
          style={{
            position: "absolute",
            // Centered inside the right BORDER zone
            right: (BORDER - WATERMARK_W) / 2,
            top: BORDER,
            bottom: BORDER,
            width: WATERMARK_W,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              color: textColor,
              fontSize: 7,
              fontWeight: 900,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "sans-serif",
              whiteSpace: "nowrap",
              transform: "rotate(90deg)",
              userSelect: "none",
            }}
          >
            ✦ PUFFSNAP ✦ PUFFSNAP ✦ PUFFSNAP ✦
          </span>
        </div>
      );
    };

    return (
      <div
        ref={ref}
        style={{
          position: "relative",
          width: canvasW,
          height: canvasH,
          background: wrapperBorderColor,
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        {/* Inner background — full symmetric area inside the border */}
        <div
          style={{
            position: "absolute",
            left: BORDER,
            top: BORDER,
            width: canvasW - BORDER * 2,
            height: canvasH - BORDER * 2,
            background: wrapperBg,
          }}
        />

        {/* Photos grid */}
        {images.map((img, idx) => {
          const col = cols === 2 ? idx % 2 : 0;
          const row = cols === 2 ? Math.floor(idx / 2) : idx;
          const x = photosAreaOffsetX + col * (PHOTO_W + GAP);
          const y = photosAreaOffsetY + row * (PHOTO_H + GAP);
          return (
            <div
              key={idx}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: PHOTO_W,
                height: PHOTO_H,
                overflow: "hidden",
              }}
            >
              <img
                src={img}
                alt={`Photo ${idx + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  filter: cssFilter,
                }}
              />
            </div>
          );
        })}

        {/* Frame overlays / labels — only for named frames, never color-border */}
        {!isColorBorder && frame === "gantongan" && (
          <GantonganOverlay layout={layout} />
        )}
        {!isColorBorder && frame !== "gantongan" && (
          <FrameOverlay frame={frame} customMessage={customMessage} layout={layout} />
        )}

        {/* Watermark — rendered on top of the right border strip */}
        {renderWatermark()}

        {/* Hashtag / custom message footer — only for named frames, not color-border */}
        {!isColorBorder && (hashtag || customMessage) && (
          <div
            style={{
              position: "absolute",
              bottom: BORDER + PAD_V / 2,
              left: BORDER + PAD_H,
              width: cols * PHOTO_W + (cols - 1) * GAP,
              background: "rgba(255,255,255,0.85)",
              padding: "3px 6px",
              borderRadius: 4,
              textAlign: "center",
            }}
          >
            {customMessage && <p style={{ fontSize: 11, fontWeight: 700, margin: 0, color: "hsl(280 85% 55%)" }}>{customMessage}</p>}
            {hashtag && <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: "hsl(280 85% 55%)" }}>{hashtag}</p>}
          </div>
        )}
      </div>
    );
  }
);

PhotoStripPreview.displayName = "PhotoStripPreview";
export default PhotoStripPreview;
