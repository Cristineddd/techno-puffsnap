import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Check, Printer, ChevronDown, Search, Zap, RefreshCw, Type, Lock, Heart } from "lucide-react";
import { PhotoMode } from "./ModeSelectionScreen";
import type { StripLayoutType } from "./ModeSelectionScreen";
import PhotoStripPreview, { getStripLayout, getCssFilter, getFrameLabels, frameHasLabels, drawImageWithFilter } from "./PhotoStripPreview";

interface StripCustomizationScreenProps {
  images: string[];
  mode: PhotoMode;
  orientation: "landscape" | "portrait";
  layoutType: StripLayoutType;
  onComplete: (stripData: StripData) => void;
  onRetake: () => void;
}

export interface StripData {
  images: string[];
  mode: PhotoMode;
  frame: string;
  filter: string;
  hashtag: string;
  customMessage: string;
  borderColor: string;
  stripImage: string;
}

// ── Preset colors ────────────────────────────────────────────────────────────
const PRESET_COLORS = [
  { label: "Black",      value: "#111111" },
  { label: "White",      value: "#ffffff" },
  { label: "Blush Pink", value: "#f9a8d4" },
  { label: "Lavender",   value: "#c4b5fd" },
  { label: "Sky Blue",   value: "#7dd3fc" },
  { label: "Mint",       value: "#6ee7b7" },
  { label: "Butter",     value: "#fde68a" },
  { label: "Peach",      value: "#fdba74" },
  { label: "Coral",      value: "#fb7185" },
  { label: "Sage",       value: "#86efac" },
  { label: "Lilac",      value: "#e879f9" },
  { label: "Nude",       value: "#e7cdb5" },
];

// ── Frame categories ─────────────────────────────────────────────────────────
const frameCategories = [
  {
    category: "CLASSIC & TRENDY",
    emoji: "📸",
    frames: [
      { id: "none",           name: "Classic" },
      { id: "polaroid",       name: "Polaroid" },
      { id: "instagram",      name: "Instagram" },
      { id: "tiktok",         name: "TikTok" },
      { id: "filmstrip",      name: "Film Strip" },
      { id: "neon-aesthetic", name: "Neon" },
    ],
  },
  {
    category: "PHOTOGRAPHY",
    emoji: "🎞️",
    frames: [
      { id: "film-noir",     name: "Film Noir" },
      { id: "golden-hour",   name: "Golden Hour" },
      { id: "disposable",    name: "Disposable" },
      { id: "darkroom",      name: "Darkroom" },
      { id: "contact-sheet", name: "Contact Sheet" },
      { id: "studio-flash",  name: "Studio Flash" },
      { id: "slide-film",    name: "Slide Film" },
      { id: "expired-film",  name: "Expired Film" },
    ],
  },
  {
    category: "PHOTO FRAMES",
    emoji: "🖼️",
    frames: [
      { id: "frame-white",       name: "White Border" },
      { id: "frame-thick-black", name: "Thick Black" },
      { id: "frame-gold-ornate", name: "Gold Ornate" },
      { id: "frame-rustic-wood", name: "Rustic Wood" },
      { id: "frame-silver",      name: "Silver Chrome" },
      { id: "frame-double",      name: "Double Border" },
      { id: "frame-rounded",     name: "Rounded White" },
      { id: "frame-shadow-box",  name: "Shadow Box" },
      { id: "frame-torn-edge",   name: "Torn Edge" },
      { id: "frame-washi",       name: "Washi Tape" },
    ],
  },
  {
    category: "CUTE & AESTHETIC",
    emoji: "🌸",
    frames: [
      { id: "floral",      name: "Floral" },
      { id: "kawaii",      name: "Kawaii" },
      { id: "butterfly",   name: "Butterfly" },
      { id: "scrapbook",   name: "Scrapbook" },
      { id: "chalkboard",  name: "Chalkboard" },
    ],
  },
  {
    category: "GEN Z VIBES",
    emoji: "✨",
    frames: [
      { id: "npc",        name: "NPC Mode" },
      { id: "delulu",     name: "Delulu Era" },
      { id: "ick",        name: "The Ick" },
      { id: "rizz",       name: "Rizz Unlocked" },
      { id: "understood", name: "Understood" },
      { id: "lowkey",     name: "Lowkey That Girl" },
      { id: "slay",       name: "Slay" },
      { id: "rentfree",   name: "Rent Free" },
    ],
  },
  {
    category: "UNIQUE",
    emoji: "💥",
    frames: [
      { id: "newspaper",  name: "Newspaper" },
      { id: "comicbook",  name: "Comic Book" },
      { id: "idcard",     name: "ID Card" },
      { id: "glowdark",   name: "Glow Dark" },
      { id: "vintage",    name: "Vintage" },
    ],
  },
  {
    category: "SPECIAL",
    emoji: "💝",
    frames: [
      { id: "joka-day",    name: "For Joka 💗" },
      { id: "gantongan",   name: "Gantongan 🎞️" },
    ],
  },
];

const allFrames = frameCategories.flatMap(c => c.frames);

// ── Password-protected frames ────────────────────────────────────────────────
const PASSWORD_FRAMES: Record<string, string> = {
  "joka-day": "March252003",
};

// ── Filters ──────────────────────────────────────────────────────────────────
const filters = [
  { id: "none",       name: "Normal",    css: "none" },
  { id: "clarendon",  name: "Clarendon", css: "contrast(120%) saturate(125%)" },
  { id: "gingham",    name: "Gingham",   css: "brightness(105%) hue-rotate(350deg) saturate(110%) contrast(92%)" },
  { id: "moon",       name: "Moon",      css: "grayscale(100%) contrast(110%) brightness(110%)" },
  { id: "lark",       name: "Lark",      css: "contrast(90%) brightness(110%) saturate(130%)" },
  { id: "reyes",      name: "Reyes",     css: "sepia(22%) brightness(110%) contrast(85%) saturate(75%)" },
  { id: "juno",       name: "Juno",      css: "saturate(140%) contrast(105%) brightness(105%) sepia(8%)" },
  { id: "slumber",    name: "Slumber",   css: "saturate(66%) brightness(105%) sepia(18%) contrast(88%)" },
  { id: "crema",      name: "Crema",     css: "sepia(15%) contrast(90%) brightness(110%) saturate(90%) hue-rotate(5deg)" },
  { id: "ludwig",     name: "Ludwig",    css: "brightness(105%) contrast(95%) saturate(90%) sepia(10%)" },
  { id: "aden",       name: "Aden",      css: "hue-rotate(20deg) contrast(90%) saturate(85%) brightness(120%)" },
  { id: "perpetua",   name: "Perpetua",  css: "contrast(90%) brightness(110%) saturate(110%) hue-rotate(340deg)" },
  { id: "valencia",   name: "Valencia",  css: "contrast(108%) brightness(108%) sepia(8%) saturate(130%)" },
  { id: "xpro2",      name: "X-Pro II",  css: "sepia(30%) saturate(160%) contrast(110%) brightness(90%)" },
  { id: "lofi",       name: "Lo-Fi",     css: "saturate(110%) contrast(150%) brightness(85%)" },
  { id: "nashville",  name: "Nashville", css: "sepia(25%) contrast(115%) brightness(105%) saturate(130%) hue-rotate(350deg)" },
  { id: "inkwell",    name: "Inkwell",   css: "grayscale(100%) brightness(110%) contrast(110%) sepia(30%)" },
  { id: "hefe",       name: "Hefe",      css: "sepia(20%) saturate(150%) contrast(130%) brightness(90%)" },
  { id: "rise",       name: "Rise",      css: "brightness(115%) contrast(90%) saturate(90%) sepia(15%)" },
  { id: "hudson",     name: "Hudson",    css: "brightness(120%) contrast(90%) saturate(110%) hue-rotate(10deg)" },
];

// ── Auto-scaling preview wrapper ─────────────────────────────────────────────
function ScaledPreview({
  images, mode, frame, filter, borderColor, orientation, layoutType, hideLabels,
}: {
  images: string[];
  mode: PhotoMode;
  frame: string;
  filter: string;
  borderColor?: string;
  orientation: "landscape" | "portrait";
  layoutType: StripLayoutType;
  hideLabels?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const isColorBorder = !!borderColor;
  const layout = getStripLayout(mode, orientation, frame, isColorBorder, hideLabels, layoutType);

  const updateScale = useCallback(() => {
    if (!containerRef.current) return;
    const availW = containerRef.current.clientWidth;
    const availH = containerRef.current.clientHeight;
    const scaleW = availW / layout.canvasW;
    const scaleH = availH / layout.canvasH;
    setScale(Math.min(scaleW, scaleH, 1)); // never upscale
  }, [layout.canvasW, layout.canvasH]);

  useEffect(() => {
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [updateScale]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center overflow-hidden"
      style={{ minHeight: 120 }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center center",
          transition: "transform 0.2s ease",
          flexShrink: 0,
        }}
      >
        <PhotoStripPreview
          images={images}
          mode={mode}
          frame={frame}
          filter={filter}
          hashtag=""
          borderColor={borderColor}
          orientation={orientation}
          layoutType={layoutType}
          hideLabels={hideLabels}
        />
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const StripCustomizationScreen = ({ images, mode, orientation, layoutType, onComplete, onRetake }: StripCustomizationScreenProps) => {
  const [selectedFrame, setSelectedFrame] = useState("none");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [borderColor, setBorderColor] = useState("#111111");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<"frames" | "filters" | "color">("frames");
  const [frameSearch, setFrameSearch] = useState("");
  const [openCategory, setOpenCategory] = useState<string | null>("CLASSIC & TRENDY");
  const [hideLabels, setHideLabels] = useState(false);

  // Password-protected frame states
  const [unlockedFrames, setUnlockedFrames] = useState<Set<string>>(new Set());
  const [passwordModal, setPasswordModal] = useState<{ frameId: string; frameName: string } | null>(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);

  const activeBorderColor = activeTab === "color" ? borderColor : undefined;

  /** Try to select a frame — if password-protected and not yet unlocked, show modal */
  const handleFrameSelect = (frameId: string, frameName: string) => {
    const requiredPw = PASSWORD_FRAMES[frameId];
    if (requiredPw && !unlockedFrames.has(frameId)) {
      setPasswordModal({ frameId, frameName });
      setPasswordInput("");
      setPasswordError(false);
      return;
    }
    setSelectedFrame(frameId);
  };

  const handlePasswordSubmit = () => {
    if (!passwordModal) return;
    const correctPw = PASSWORD_FRAMES[passwordModal.frameId];
    if (passwordInput === correctPw) {
      setUnlockedFrames(prev => new Set(prev).add(passwordModal.frameId));
      setSelectedFrame(passwordModal.frameId);
      setPasswordModal(null);
      setPasswordInput("");
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  // Whether the current frame supports label text
  const currentFrameHasLabels = frameHasLabels(selectedFrame);

  // Auto-reset hideLabels when switching to a frame without labels
  useEffect(() => {
    if (!currentFrameHasLabels) setHideLabels(false);
  }, [currentFrameHasLabels]);

  // ── Export strip ────────────────────────────────────────────────────────────
  const handleComplete = async () => {
    setIsGenerating(true);
    try {
      const layout = getStripLayout(mode, orientation, selectedFrame, !!activeBorderColor, hideLabels, layoutType);
      const {
        BORDER, PAD_H, PAD_V, GAP, LABEL_H,
        PHOTO_W, PHOTO_H, cols, rows,
        canvasW, canvasH,
        bgColor, borderColor: frameBorderColor,
        WATERMARK_W,
      } = layout;

      const loadedImgs = await Promise.all(images.map(src =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        })
      ));

      const canvas = document.createElement("canvas");
      canvas.width  = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d")!;

      // 1. Full canvas = border/frame color
      ctx.fillStyle = activeBorderColor ?? frameBorderColor;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // 2. Inner content area — symmetric on all sides (watermark is INSIDE the border zone)
      ctx.fillStyle = bgColor;
      ctx.fillRect(BORDER, BORDER, canvasW - BORDER * 2, canvasH - BORDER * 2);

      const cssFilter = getCssFilter(selectedFilter);

      for (let i = 0; i < loadedImgs.length; i++) {
        const col = cols === 2 ? i % 2 : 0;
        const row = cols === 2 ? Math.floor(i / 2) : i;
        const x = BORDER + PAD_H + col * (PHOTO_W + GAP);
        const y = BORDER + PAD_V + (LABEL_H > 0 ? LABEL_H : 0) + row * (PHOTO_H + GAP);

        const img = loadedImgs[i];
        const imgAspect = img.naturalWidth / img.naturalHeight;
        const cellAspect = PHOTO_W / PHOTO_H;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;
        if (imgAspect > cellAspect) {
          sw = img.naturalHeight * cellAspect;
          sx = (img.naturalWidth - sw) / 2;
        } else {
          sh = img.naturalWidth / cellAspect;
          sy = (img.naturalHeight - sh) / 2;
        }
        // Use cross-browser helper (falls back to pixel ops on Safari/iOS)
        drawImageWithFilter(ctx, img, sx, sy, sw, sh, x, y, PHOTO_W, PHOTO_H, cssFilter);
      }

      if (!activeBorderColor && !hideLabels && LABEL_H > 0) {
        const labels = getFrameLabels(selectedFrame);
        if (labels.top) {
          ctx.fillStyle = labels.topBg === "transparent" ? "rgba(0,0,0,0)" : labels.topBg;
          ctx.fillRect(BORDER + PAD_H, BORDER + PAD_V, PHOTO_W * cols + GAP * (cols - 1), LABEL_H);
          ctx.fillStyle = labels.topColor;
          ctx.font = `bold ${Math.round(LABEL_H * 0.45)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labels.top, BORDER + PAD_H + (PHOTO_W * cols + GAP * (cols - 1)) / 2, BORDER + PAD_V + LABEL_H / 2);
        }
        if (labels.bottom) {
          const bY = BORDER + PAD_V + LABEL_H + rows * PHOTO_H + (rows - 1) * GAP;
          ctx.fillStyle = labels.bottomBg === "transparent" ? "rgba(0,0,0,0)" : labels.bottomBg;
          ctx.fillRect(BORDER + PAD_H, bY, PHOTO_W * cols + GAP * (cols - 1), LABEL_H);
          ctx.fillStyle = labels.bottomColor;
          ctx.font = `bold ${Math.round(LABEL_H * 0.42)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(labels.bottom, BORDER + PAD_H + (PHOTO_W * cols + GAP * (cols - 1)) / 2, bY + LABEL_H / 2);
        }
      }

      // 5. PuffSnap watermark — inside the right BORDER zone, centered
      if (activeBorderColor && WATERMARK_W > 0) {
        const c = activeBorderColor.replace("#", "");
        const r = parseInt(c.substring(0, 2), 16);
        const g = parseInt(c.substring(2, 4), 16);
        const b = parseInt(c.substring(4, 6), 16);
        const lum = (r * 299 + g * 587 + b * 114) / 1000;
        const txtColor = lum > 155 ? "rgba(0,0,0,0.65)" : "rgba(255,255,255,0.85)";

        // X center of the right border zone
        const wmarkX = canvasW - BORDER + (BORDER - WATERMARK_W) / 2 + WATERMARK_W / 2;

        ctx.save();
        ctx.translate(wmarkX, canvasH / 2);
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = txtColor;
        ctx.font = "bold 9px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("✦ PUFFSNAP ✦ PUFFSNAP ✦ PUFFSNAP ✦", 0, 0);
        ctx.restore();
      }

      const stripImage = canvas.toDataURL("image/png", 1.0);
      onComplete({
        images, mode,
        frame: selectedFrame,
        filter: selectedFilter,
        hashtag: "",
        customMessage: "",
        borderColor: activeBorderColor ?? "",
        stripImage,
      });
    } catch (err) {
      console.error("Error generating strip:", err);
      alert("Error creating strip. Please try again.");
    }
    setIsGenerating(false);
  };

  // ── Filtered frame list (search) ────────────────────────────────────────────
  const searchTrimmed = frameSearch.trim().toLowerCase();
  const searchResults = searchTrimmed
    ? allFrames.filter(f => f.name.toLowerCase().includes(searchTrimmed) || f.id.includes(searchTrimmed))
    : null;

  // ── Current selection label ──────────────────────────────────────────────────
  const selectedFrameLabel = allFrames.find(f => f.id === selectedFrame)?.name ?? "Classic";
  const selectedFilterLabel = filters.find(f => f.id === selectedFilter)?.name ?? "Normal";

  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b-4 border-foreground px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={onRetake}
          className="comic-button flex items-center gap-2 bg-muted px-4 py-2 text-sm text-muted-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          RETAKE
        </button>

        <div className="text-center">
          <h2 className="font-display text-xl text-foreground leading-none">MAKE IT POP! 💥</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{mode}-shot · {orientation}</p>
        </div>

        <button
          onClick={handleComplete}
          disabled={isGenerating}
          className="btn-primary-pop flex items-center gap-2 text-sm disabled:opacity-50 px-5 py-2"
        >
          {isGenerating ? (
            <span className="animate-pulse font-display">CREATING…</span>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span className="font-display">DONE!</span>
            </>
          )}
        </button>
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ══ LEFT PANEL — Preview ══════════════════════════════════════════ */}
        <div className="hidden lg:flex flex-col gap-3 w-[45%] max-w-[480px] shrink-0 sticky top-[61px] h-[calc(100vh-61px)] overflow-hidden py-5 px-5 border-r-4 border-foreground bg-muted/20">

          {/* Preview card — fills available space */}
          <div className="flex-1 comic-card-lg bg-card p-4 overflow-hidden flex items-center justify-center min-h-0">
            <ScaledPreview
              images={images}
              mode={mode}
              frame={activeTab === "color" ? "none" : selectedFrame}
              filter={selectedFilter}
              borderColor={activeTab === "color" ? borderColor : undefined}
              orientation={orientation}
              layoutType={layoutType}
              hideLabels={activeTab === "color" ? false : hideLabels}
            />
          </div>

          {/* Applied label */}
          <div className="flex items-center justify-center gap-2 rounded-xl border-2 border-border bg-card px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
              {activeTab === "color"
                ? `Color · ${borderColor.toUpperCase()}`
                : activeTab === "filters"
                ? `Filter · ${selectedFilterLabel}`
                : `Frame · ${selectedFrameLabel}`}
            </span>
          </div>

          {/* Info row */}
          <div className="rounded-xl border-2 border-border bg-card px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex justify-between text-muted-foreground"><span>Photos</span><span className="font-bold text-foreground">{mode} shots</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Layout</span><span className="font-bold text-foreground">{mode === 6 ? "2×3 grid" : `${mode}×1 strip`}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Frame</span><span className="font-bold text-foreground truncate max-w-[80px]">{activeTab === "color" ? "Color border" : selectedFrameLabel}</span></div>
            <div className="flex justify-between text-muted-foreground"><span>Filter</span><span className="font-bold text-foreground">{selectedFilterLabel}</span></div>
          </div>

          {/* Print badge */}
          <div className="comic-card bg-accent px-4 py-2 flex items-center gap-2 justify-center">
            <Printer className="h-4 w-4 text-accent-foreground" />
            <span className="font-display text-sm text-accent-foreground">PRINT-READY · {mode === 6 ? "4×6" : mode === 4 ? "2×8" : "2×6"} INCHES</span>
          </div>

          {/* DONE sticky at bottom of panel */}
          <button
            onClick={handleComplete}
            disabled={isGenerating}
            className="btn-primary-pop w-full flex items-center justify-center gap-2 text-lg disabled:opacity-50"
          >
            {isGenerating ? <span className="animate-pulse">CREATING…</span> : <><Zap className="h-5 w-5 fill-current" /> DONE — GENERATE STRIP!</>}
          </button>
        </div>

        {/* ══ RIGHT PANEL — Options ════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 overflow-y-auto flex flex-col">

          {/* Mobile preview */}
          <div className="lg:hidden px-4 pt-4 pb-3 border-b-2 border-border bg-muted/10">
            <div
              className="comic-card-lg bg-card p-3 flex items-center justify-center mx-auto"
              style={{ height: 260 }}
            >
              <ScaledPreview
                images={images}
                mode={mode}
                frame={activeTab === "color" ? "none" : selectedFrame}
                filter={selectedFilter}
                borderColor={activeTab === "color" ? borderColor : undefined}
                orientation={orientation}
                layoutType={layoutType}
                hideLabels={activeTab === "color" ? false : hideLabels}
              />
            </div>
            {/* Applied pill */}
            <div className="mt-2 flex items-center justify-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-muted-foreground">
                {activeTab === "color" ? `Color · ${borderColor.toUpperCase()}` : activeTab === "filters" ? `Filter · ${selectedFilterLabel}` : `Frame · ${selectedFrameLabel}`}
              </span>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="sticky top-0 z-10 bg-background border-b-4 border-foreground flex">
            {(["frames", "filters", "color"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-sm font-display uppercase tracking-wide transition-colors relative ${
                  activeTab === tab
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "frames" ? "🖼️ Frames" : tab === "filters" ? "🎨 Filters" : "🎀 Color"}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* ── Tab content ── */}
          <div className="p-4 space-y-4 pb-32 lg:pb-8">

            {/* ── FRAMES TAB ── */}
            {activeTab === "frames" && (
              <div className="space-y-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    value={frameSearch}
                    onChange={e => setFrameSearch(e.target.value)}
                    placeholder="Search frames…"
                    className="w-full rounded-xl border-2 border-border bg-card pl-9 pr-4 py-2.5 text-sm font-bold placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                  {frameSearch && (
                    <button
                      onClick={() => setFrameSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >✕</button>
                  )}
                </div>

                {/* ── No Text toggle — only visible when frame has labels ── */}
                {currentFrameHasLabels && (
                  <button
                    onClick={() => setHideLabels(prev => !prev)}
                    className={`w-full flex items-center justify-between rounded-2xl border-2 px-4 py-3 transition-all ${
                      hideLabels
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card text-muted-foreground hover:border-foreground/40"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Type className="h-4 w-4" />
                      <span className="text-sm font-bold">No Text</span>
                    </span>
                    <span className={`text-xs font-display uppercase tracking-wider ${hideLabels ? "text-background/70" : "text-muted-foreground"}`}>
                      {hideLabels ? "TEXT OFF" : "TEXT ON"}
                    </span>
                  </button>
                )}

                {/* Search results */}
                {searchResults ? (
                  <div>
                    <p className="text-xs text-muted-foreground font-bold mb-2">{searchResults.length} result{searchResults.length !== 1 ? "s" : ""}</p>
                    <div className="flex flex-wrap gap-2">
                      {searchResults.map(frame => (
                        <FrameButton
                          key={frame.id}
                          frame={frame}
                          selected={selectedFrame === frame.id}
                          onClick={() => handleFrameSelect(frame.id, frame.name)}
                          locked={!!PASSWORD_FRAMES[frame.id] && !unlockedFrames.has(frame.id)}
                        />
                      ))}
                      {searchResults.length === 0 && (
                        <p className="text-sm text-muted-foreground py-4 w-full text-center">No frames found for "{frameSearch}"</p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Accordion categories */
                  frameCategories.map(cat => (
                    <div key={cat.category} className="rounded-2xl border-2 border-border overflow-hidden">
                      {/* Category header */}
                      <button
                        onClick={() => setOpenCategory(openCategory === cat.category ? null : cat.category)}
                        className={`w-full flex items-center justify-between px-4 py-3 font-display text-base transition-colors ${
                          openCategory === cat.category ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/70"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{cat.emoji}</span>
                          <span>{cat.category}</span>
                          {/* Show dot if a frame in this category is selected */}
                          {cat.frames.some(f => f.id === selectedFrame) && (
                            <span className={`inline-block w-2 h-2 rounded-full ${openCategory === cat.category ? "bg-primary-foreground" : "bg-primary"}`} />
                          )}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${openCategory === cat.category ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* Category frames */}
                      {openCategory === cat.category && (
                        <div className="flex flex-wrap gap-2 p-3 bg-card">
                          {cat.frames.map(frame => (
                            <FrameButton
                              key={frame.id}
                              frame={frame}
                              selected={selectedFrame === frame.id}
                              onClick={() => handleFrameSelect(frame.id, frame.name)}
                              locked={!!PASSWORD_FRAMES[frame.id] && !unlockedFrames.has(frame.id)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── FILTERS TAB ── */}
            {activeTab === "filters" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {filters.map(f => {
                  const isSelected = selectedFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFilter(f.id)}
                      className={`relative rounded-2xl overflow-hidden border-4 transition-all ${
                        isSelected
                          ? "border-primary scale-[1.04] shadow-[0_0_0_3px_hsl(var(--primary)/0.3)]"
                          : "border-border hover:border-primary/50 hover:scale-[1.02]"
                      }`}
                    >
                      {images[0] && (
                        <img
                          src={images[0]}
                          alt={f.name}
                          className="w-full aspect-video object-cover"
                          style={{ filter: f.css }}
                        />
                      )}
                      <div className={`py-2 px-2 text-center text-xs font-display flex items-center justify-center gap-1 ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {isSelected && <Check className="h-3 w-3 flex-shrink-0" />}
                        {f.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ── COLOR TAB ── */}
            {activeTab === "color" && (
              <div className="space-y-5">
                <p className="text-xs text-muted-foreground bg-muted rounded-xl px-3 py-2 border border-border">
                  🎀 Pick a border color — a <strong>PUFFSNAP</strong> watermark appears on the side.
                </p>

                {/* Preset swatches */}
                <div>
                  <p className="mb-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">Preset Colors</p>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                    {PRESET_COLORS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setBorderColor(c.value)}
                        title={c.label}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`w-12 h-12 rounded-xl transition-all ${
                            borderColor === c.value
                              ? "ring-4 ring-primary ring-offset-2 scale-110 border-4 border-foreground"
                              : "ring-1 ring-border hover:scale-105"
                          }`}
                          style={{ background: c.value }}
                        >
                          {borderColor === c.value && (
                            <div className="w-full h-full flex items-center justify-center">
                              <Check
                                className="h-5 w-5 drop-shadow-md"
                                style={{ color: c.value === "#ffffff" || c.value === "#fde68a" || c.value === "#fde68a" ? "#111" : "#fff" }}
                              />
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-medium">{c.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom color picker */}
                <div>
                  <p className="mb-3 text-xs font-bold text-muted-foreground uppercase tracking-widest">Custom Color</p>
                  <div className="flex items-center gap-4 comic-card bg-card p-4">
                    <input
                      type="color"
                      value={borderColor}
                      onChange={(e) => setBorderColor(e.target.value)}
                      className="w-14 h-14 rounded-xl border-2 border-border cursor-pointer p-1 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <span className="block text-base font-display text-foreground">{borderColor.toUpperCase()}</span>
                      <span className="text-xs text-muted-foreground">Click swatch to open picker</span>
                    </div>
                    {/* Preview swatch */}
                    <div
                      className="w-16 h-16 rounded-xl border-[8px] flex items-center justify-center flex-shrink-0"
                      style={{ borderColor }}
                    >
                      <span className="text-[8px] font-bold text-muted-foreground text-center leading-tight">STRIP</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Mobile sticky DONE button ── */}
      <div className="lg:hidden sticky bottom-0 z-20 border-t-4 border-foreground bg-background p-3 flex gap-3">
        <button
          onClick={onRetake}
          className="comic-button flex items-center justify-center gap-2 bg-muted px-4 py-3 text-sm text-muted-foreground flex-shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
          RETAKE
        </button>
        <button
          onClick={handleComplete}
          disabled={isGenerating}
          className="btn-primary-pop flex-1 flex items-center justify-center gap-2 text-base disabled:opacity-50"
        >
          {isGenerating ? <span className="animate-pulse">CREATING…</span> : <><Zap className="h-5 w-5 fill-current" /> DONE — GENERATE!</>}
        </button>
      </div>

      {/* ── Password Modal for protected frames ── */}
      {passwordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="comic-card-lg bg-card w-full max-w-sm p-0 overflow-hidden animate-bounce-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-400 to-rose-400 px-6 py-5 text-center">
              <Heart className="h-10 w-10 text-white mx-auto mb-2 fill-white drop-shadow-lg" />
              <h3 className="font-display text-2xl text-white tracking-wide drop-shadow">SECRET FRAME 💝</h3>
              <p className="text-white/80 text-xs font-bold mt-1">{passwordModal.frameName}</p>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                This frame is <strong>password-protected</strong>.<br/>
                Enter the secret password to unlock it 🔐
              </p>

              <input
                type="password"
                value={passwordInput}
                onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                onKeyDown={(e) => { if (e.key === "Enter") handlePasswordSubmit(); }}
                placeholder="Enter password…"
                autoFocus
                className={`w-full rounded-xl border-4 bg-card px-4 py-3 text-center text-lg font-bold placeholder:text-muted-foreground/50 focus:outline-none transition-colors ${
                  passwordError
                    ? "border-red-400 text-red-500 shake"
                    : "border-border focus:border-pink-400"
                }`}
              />

              {passwordError && (
                <p className="text-center text-xs font-bold text-red-500 animate-pulse">
                  ❌ Wrong password! Try again.
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => { setPasswordModal(null); setPasswordInput(""); setPasswordError(false); }}
                  className="comic-button flex-1 bg-muted text-muted-foreground py-3 text-sm"
                >
                  CANCEL
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="comic-button flex-1 bg-pink-400 text-white py-3 text-sm border-pink-600 hover:bg-pink-500"
                >
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="h-4 w-4" />
                    UNLOCK
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Frame button sub-component ────────────────────────────────────────────────
function FrameButton({
  frame,
  selected,
  onClick,
  locked,
}: {
  frame: { id: string; name: string };
  selected: boolean;
  onClick: () => void;
  locked?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`comic-button flex items-center gap-1.5 px-3 py-2 text-xs font-bold transition-all ${
        selected
          ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-1 scale-[1.06]"
          : locked
          ? "bg-pink-50 text-pink-400 border-pink-300 hover:bg-pink-100"
          : "bg-muted text-muted-foreground hover:bg-card hover:text-foreground"
      }`}
    >
      {selected && <Check className="h-3 w-3 flex-shrink-0" />}
      {locked && !selected && <Lock className="h-3 w-3 flex-shrink-0" />}
      {frame.name}
    </button>
  );
}

export default StripCustomizationScreen;
