import { useState } from "react";
import { ArrowLeft, Check, RefreshCw, RotateCcw } from "lucide-react";

interface PhotoReviewScreenProps {
  images: string[];
  onProceed: () => void;
  onRetakeAll: () => void;
  onRetakeSelected: (indices: number[]) => void;
}

const PhotoReviewScreen = ({
  images,
  onProceed,
  onRetakeAll,
  onRetakeSelected,
}: PhotoReviewScreenProps) => {
  const [retakeMode, setRetakeMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleRetakeSelected = () => {
    if (selected.size === 0) return;
    if (selected.size === images.length) {
      onRetakeAll();
    } else {
      onRetakeSelected(Array.from(selected));
    }
  };

  const cancelRetakeMode = () => {
    setRetakeMode(false);
    setSelected(new Set());
  };

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col halftone">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-3 py-2 sm:px-4 sm:py-3 flex items-center justify-between gap-2 sm:gap-3">
        {retakeMode ? (
          <button
            onClick={cancelRetakeMode}
            className="comic-button flex items-center gap-2 bg-muted px-4 py-2 text-sm text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            CANCEL
          </button>
        ) : (
          <div className="w-24" />
        )}

        <div className="text-center">
          <h2 className="font-display text-lg sm:text-xl text-foreground leading-none">
            {retakeMode ? "PICK TO RETAKE" : "REVIEW SHOTS"}
          </h2>
          <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
            {retakeMode
              ? selected.size === 0
                ? "Tap a photo to mark it"
                : `${selected.size} photo${selected.size > 1 ? "s" : ""} selected`
              : `${images.length} shot${images.length > 1 ? "s" : ""} taken`}
          </p>
        </div>

        {retakeMode ? (
          <button
            onClick={handleRetakeSelected}
            disabled={selected.size === 0}
            className="btn-primary-pop flex items-center gap-2 text-sm disabled:opacity-40 bg-destructive"
            style={{ background: selected.size > 0 ? undefined : undefined }}
          >
            <RefreshCw className="h-4 w-4" />
            RETAKE
          </button>
        ) : (
          <button
            onClick={onProceed}
            className="btn-primary-pop flex items-center gap-2 text-sm"
          >
            <Check className="h-4 w-4" />
            PROCEED
          </button>
        )}
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-3 py-4 sm:px-4 sm:py-8 gap-4 sm:gap-6">
        {/* Instruction banner */}
        <div
          className={`comic-card px-4 py-2 sm:px-5 sm:py-3 w-full max-w-lg text-center transition-all ${
            retakeMode ? "bg-destructive/10 border-destructive/60" : "bg-accent"
          }`}
        >
          <p
            className={`font-display text-sm sm:text-base tracking-wide ${
              retakeMode ? "text-destructive" : "text-accent-foreground"
            }`}
          >
            {retakeMode
              ? "👆 TAP PHOTOS YOU WANT TO RESHOOT"
              : "HAPPY WITH YOUR SHOTS?"}
          </p>
        </div>

        {/* ── Photo Grid — 2-col on mobile, up to 3-col on larger ── */}
        <div
          className={`w-full max-w-2xl grid gap-2 sm:gap-3 ${
            images.length <= 2
              ? "grid-cols-2"
              : "grid-cols-2 sm:grid-cols-3"
          }`}
        >
          {images.map((src, i) => {
            const isSelected = selected.has(i);
            return (
              <button
                key={i}
                onClick={() => retakeMode && toggleSelect(i)}
                disabled={!retakeMode}
                className={`relative rounded-2xl overflow-hidden border-4 transition-all duration-150 focus:outline-none ${
                  retakeMode
                    ? isSelected
                      ? "border-destructive scale-95 ring-4 ring-destructive/30"
                      : "border-border hover:border-primary/60 hover:scale-[1.02]"
                    : "border-foreground cursor-default"
                }`}
                style={{ aspectRatio: "4/3" }}
              >
                <img
                  src={src}
                  alt={`Shot ${i + 1}`}
                  className="w-full h-full object-cover block"
                />

                {/* Red overlay when selected for retake */}
                {retakeMode && isSelected && (
                  <div className="absolute inset-0 bg-destructive/30 flex flex-col items-center justify-center gap-0.5 sm:gap-1">
                    <RefreshCw className="h-5 w-5 sm:h-8 sm:w-8 text-white drop-shadow-lg" />
                    <span className="font-display text-[10px] sm:text-sm text-white drop-shadow-lg tracking-wider">
                      RETAKE
                    </span>
                  </div>
                )}

                {/* Shot number badge */}
                <div
                  className={`absolute top-2 left-2 font-display text-xs px-2.5 py-0.5 rounded-full border-2 ${
                    retakeMode && isSelected
                      ? "bg-destructive text-white border-white"
                      : "bg-foreground/75 text-white border-transparent"
                  }`}
                >
                  #{i + 1}
                </div>

                {/* Green check when NOT selected in retake mode (good photo) */}
                {retakeMode && !isSelected && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500/90 border-2 border-white flex items-center justify-center">
                    <Check className="h-3 w-3 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Action Buttons ── */}
        {!retakeMode ? (
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <button
              onClick={() => setRetakeMode(true)}
              className="comic-button flex-1 flex items-center justify-center gap-2 bg-muted px-5 py-3 text-sm text-muted-foreground"
            >
              <RefreshCw className="h-4 w-4" />
              RETAKE A PHOTO
            </button>
            <button
              onClick={onProceed}
              className="btn-primary-pop flex-1 flex items-center justify-center gap-2 text-sm"
            >
              <Check className="h-4 w-4" />
              LOOKS GOOD!
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3 w-full max-w-sm">
            {/* Selected count pill */}
            <div className="flex items-center justify-center">
              <div
                className={`px-4 py-1.5 rounded-full border-2 font-bold text-sm transition-all ${
                  selected.size > 0
                    ? "border-destructive bg-destructive/10 text-destructive"
                    : "border-border bg-muted text-muted-foreground"
                }`}
              >
                {selected.size === 0
                  ? "No photos selected yet"
                  : `${selected.size} of ${images.length} photo${
                      selected.size > 1 ? "s" : ""
                    } to reshoot`}
              </div>
            </div>

            {/* Cancel + Retake Selected row */}
            <div className="flex gap-3">
              <button
                onClick={cancelRetakeMode}
                className="comic-button flex-1 flex items-center justify-center gap-2 bg-muted px-4 py-3 text-sm text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                CANCEL
              </button>
              <button
                onClick={handleRetakeSelected}
                disabled={selected.size === 0}
                className={`comic-button flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white border-4 transition-all ${
                  selected.size > 0
                    ? "bg-destructive border-destructive hover:opacity-90"
                    : "bg-muted border-muted text-muted-foreground opacity-40 cursor-not-allowed"
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                RETAKE {selected.size > 0 ? `(${selected.size})` : ""}
              </button>
            </div>

            {/* Retake All — subtle secondary option */}
            <button
              onClick={onRetakeAll}
              className="comic-button flex items-center justify-center gap-2 bg-muted/60 px-4 py-2.5 text-xs text-muted-foreground w-full"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              RETAKE ALL PHOTOS INSTEAD
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoReviewScreen;
