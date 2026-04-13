import { useState } from "react";
import { ArrowLeft, Check, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { PhotoMode, StripLayoutType } from "./ModeSelectionScreen";

interface CameraSetupScreenProps {
  mode: PhotoMode;
  onBack: () => void;
  onNext: (settings: { timer: number; orientation: "landscape" | "portrait"; layoutType: StripLayoutType; printSize: string }) => void;
}

// ── All print sizes in one flat list ────────────────────────────────────────
const allPrintSizes = [
  { value: "2x6",    label: "2×6″",    tag: "Strip" },
  { value: "4x4",    label: "4×4″",    tag: "Grid" },
  { value: "6x6",    label: "6×6″",    tag: "Square" },
  { value: "8x8",    label: "8×8″",    tag: "Popular" },
  { value: "8x6",    label: "8×6″",    tag: "Landscape" },
  { value: "11x8.5", label: "11×8.5″", tag: "Album" },
  { value: "6x8",    label: "6×8″",    tag: "Portrait" },
  { value: "8x11",   label: "8×11″",   tag: "Tall" },
  { value: "12x12",  label: "12×12″",  tag: "Premium" },
];

// ── Layout options ──────────────────────────────────────────────────────────
const layoutOptions: { value: StripLayoutType; label: string; icon: JSX.Element }[] = [
  {
    value: "classic-strip",
    label: "Classic",
    icon: (
      <div className="flex flex-col gap-[2px]">
        <div className="h-[5px] w-5 rounded-[1px] bg-current opacity-60" />
        <div className="h-[5px] w-5 rounded-[1px] bg-current opacity-60" />
        <div className="h-[5px] w-5 rounded-[1px] bg-current opacity-60" />
      </div>
    ),
  },
  {
    value: "square-strip",
    label: "Square",
    icon: (
      <div className="flex flex-col gap-[2px]">
        <div className="h-[7px] w-[7px] rounded-[1px] bg-current opacity-60" />
        <div className="h-[7px] w-[7px] rounded-[1px] bg-current opacity-60" />
        <div className="h-[7px] w-[7px] rounded-[1px] bg-current opacity-60" />
      </div>
    ),
  },
  {
    value: "grid",
    label: "Grid",
    icon: (
      <div className="grid grid-cols-2 gap-[2px]">
        <div className="h-[7px] w-[7px] rounded-[1px] bg-current opacity-60" />
        <div className="h-[7px] w-[7px] rounded-[1px] bg-current opacity-60" />
        <div className="h-[7px] w-[7px] rounded-[1px] bg-current opacity-60" />
        <div className="h-[7px] w-[7px] rounded-[1px] bg-current opacity-60" />
      </div>
    ),
  },
  {
    value: "polaroid",
    label: "Polaroid",
    icon: (
      <div className="bg-white/80 border border-current/30 rounded-[2px] p-[2px] flex flex-col items-center">
        <div className="h-[8px] w-[10px] bg-current opacity-40 rounded-[1px]" />
        <div className="h-[2px] w-[7px] bg-current opacity-20 mt-[1px] rounded-[1px]" />
      </div>
    ),
  },
];

const CameraSetupScreen = ({ mode, onBack, onNext }: CameraSetupScreenProps) => {
  const [selectedTimer, setSelectedTimer] = useState(3);
  const [selectedOrientation, setSelectedOrientation] = useState<"landscape" | "portrait">("landscape");
  const [selectedLayout, setSelectedLayout] = useState<StripLayoutType>("classic-strip");
  const [selectedPrintSize, setSelectedPrintSize] = useState("2x6");
  const [showMoreSizes, setShowMoreSizes] = useState(false);

  const modeInfo = {
    2: { label: "DUO",     emoji: "✌️" },
    3: { label: "TRIPLE",  emoji: "🔥" },
    4: { label: "CLASSIC", emoji: "📸" },
    6: { label: "SQUAD",   emoji: "🎉" },
  }[mode];

  // Show first 4 sizes by default, rest on expand
  const visibleSizes = showMoreSizes ? allPrintSizes : allPrintSizes.slice(0, 4);

  return (
    <div className="min-h-screen halftone flex flex-col">
      {/* ── Header ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="comic-button flex items-center gap-2 bg-muted px-3 py-1.5 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          BACK
        </button>
        <h2 className="font-display text-lg text-foreground">
          {modeInfo.emoji} {modeInfo.label} · SETUP
        </h2>
        <div className="w-16" />
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col items-center px-4 py-6 gap-4 max-w-md mx-auto w-full">

        {/* ─── Timer (inline pills) ─── */}
        <div className="w-full comic-card bg-card p-4">
          <p className="font-display text-sm text-foreground mb-2.5">⏱ TIMER</p>
          <div className="flex gap-2">
            {[
              { value: 3,  label: "3s ⚡" },
              { value: 5,  label: "5s" },
              { value: 10, label: "10s" },
            ].map((t) => {
              const active = selectedTimer === t.value;
              return (
                <button
                  key={t.value}
                  onClick={() => setSelectedTimer(t.value)}
                  className={`flex-1 comic-button py-2.5 font-display text-base transition-all ${
                    active
                      ? "bg-primary text-primary-foreground scale-[1.04]"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {active && <Check className="inline h-3.5 w-3.5 mr-1 -mt-0.5" />}
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Orientation (two toggle buttons) ─── */}
        <div className="w-full comic-card bg-card p-4">
          <p className="font-display text-sm text-foreground mb-2.5">📐 ORIENTATION</p>
          <div className="flex gap-2">
            {(["landscape", "portrait"] as const).map((ori) => {
              const active = selectedOrientation === ori;
              return (
                <button
                  key={ori}
                  onClick={() => setSelectedOrientation(ori)}
                  className={`flex-1 comic-button flex items-center justify-center gap-2 py-3 transition-all ${
                    active
                      ? "bg-secondary text-secondary-foreground scale-[1.03]"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {/* tiny shape hint */}
                  <div
                    className={`border-2 rounded-sm transition-all ${
                      active ? "border-secondary-foreground" : "border-muted-foreground/50"
                    }`}
                    style={ori === "landscape" ? { width: 28, height: 20 } : { width: 20, height: 28 }}
                  />
                  <span className="font-display text-sm uppercase">{ori}</span>
                  {active && <Check className="h-3.5 w-3.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Layout (compact 4-col) ─── */}
        <div className="w-full comic-card bg-card p-4">
          <p className="font-display text-sm text-foreground mb-2.5">🎞 LAYOUT</p>
          <div className="grid grid-cols-4 gap-2">
            {layoutOptions.map((lt) => {
              const active = selectedLayout === lt.value;
              return (
                <button
                  key={lt.value}
                  onClick={() => setSelectedLayout(lt.value)}
                  className={`comic-button flex flex-col items-center gap-1.5 py-3 px-1 transition-all ${
                    active
                      ? "bg-primary text-primary-foreground scale-[1.04]"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {lt.icon}
                  <span className="font-display text-[10px] leading-none">{lt.label}</span>
                  {active && <Check className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── Print Size (compact wrap with expand) ─── */}
        <div className="w-full comic-card bg-card p-4">
          <p className="font-display text-sm text-foreground mb-2.5">🖨 PRINT SIZE</p>
          <div className="flex flex-wrap gap-2">
            {visibleSizes.map((s) => {
              const active = selectedPrintSize === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setSelectedPrintSize(s.value)}
                  className={`comic-button flex items-center gap-1.5 px-3 py-2 text-xs transition-all ${
                    active
                      ? "bg-accent text-accent-foreground scale-[1.04]"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {active && <Check className="h-3 w-3" />}
                  <span className="font-display text-xs">{s.label}</span>
                  <span className="text-[9px] opacity-60">{s.tag}</span>
                </button>
              );
            })}
          </div>
          {allPrintSizes.length > 4 && (
            <button
              onClick={() => setShowMoreSizes(!showMoreSizes)}
              className="mt-2 w-full flex items-center justify-center gap-1 text-xs font-bold text-primary hover:underline"
            >
              {showMoreSizes ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              {showMoreSizes ? "Show less" : `+${allPrintSizes.length - 4} more sizes`}
            </button>
          )}
        </div>

        {/* ─── CTA ─── */}
        <button
          onClick={() =>
            onNext({
              timer: selectedTimer,
              orientation: selectedOrientation,
              layoutType: selectedLayout,
              printSize: selectedPrintSize,
            })
          }
          className="btn-primary-pop w-full flex items-center justify-center gap-3 text-xl mt-2"
        >
          <Zap className="h-6 w-6 fill-current" />
          LET'S SHOOT!
        </button>
      </div>
    </div>
  );
};

export default CameraSetupScreen;