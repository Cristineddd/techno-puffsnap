import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowLeft, ArrowRight, Download, Share2, ZoomIn, ZoomOut, Grid2X2, BookOpen, ChevronLeft, ChevronRight, X, Smartphone, Monitor, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loadGallery, type GalleryPhoto } from "@/lib/galleryService";

// ─── Admin PIN (change this to your own secret) ────────────────────────────
const ADMIN_PIN = "1234";
const SESSION_KEY = "puffsnap_gallery_auth";

// ─── Load from Firestore (with localStorage fallback) ───────────────────────
const useSavedStrips = (): { strips: GalleryPhoto[]; loading: boolean } => {
  const [strips, setStrips] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const photos = await loadGallery();
        if (!cancelled) setStrips(photos);
      } catch {
        if (!cancelled) setStrips([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return { strips, loading };
};

// ─── Flipbook (Desktop) ─────────────────────────────────────────────────────
function FlipbookView({ photos }: { photos: GalleryPhoto[] }) {
  const [currentSpread, setCurrentSpread] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");

  // 2 photos per spread (left page + right page)
  const totalSpreads = Math.ceil(photos.length / 2);

  const goNext = () => {
    if (currentSpread >= totalSpreads - 1 || isFlipping) return;
    setFlipDirection("next");
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentSpread((p) => p + 1);
      setIsFlipping(false);
    }, 400);
  };

  const goPrev = () => {
    if (currentSpread <= 0 || isFlipping) return;
    setFlipDirection("prev");
    setIsFlipping(true);
    setTimeout(() => {
      setCurrentSpread((p) => p - 1);
      setIsFlipping(false);
    }, 400);
  };

  const leftIdx = currentSpread * 2;
  const rightIdx = currentSpread * 2 + 1;
  const leftPhoto = photos[leftIdx];
  const rightPhoto = rightIdx < photos.length ? photos[rightIdx] : null;

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Book */}
      <div className="relative perspective-[1200px]">
        <div
          className={`flex bg-card rounded-2xl border-4 border-foreground shadow-[8px_8px_0px_hsl(280_80%_15%)] overflow-hidden transition-transform duration-400 ${
            isFlipping
              ? flipDirection === "next"
                ? "animate-flip-next"
                : "animate-flip-prev"
              : ""
          }`}
          style={{ width: "min(80vw, 800px)", minHeight: 500 }}
        >
          {/* Left page */}
          <div className="flex-1 border-r-2 border-dashed border-border bg-gradient-to-br from-card to-muted/30 p-6 flex flex-col items-center justify-center gap-4">
            {leftPhoto ? (
              <>
                <div className="comic-card bg-white p-2 rotate-[-2deg] hover:rotate-0 transition-transform">
                  <img
                    src={leftPhoto.src}
                    alt={leftPhoto.caption || `Photo ${leftIdx + 1}`}
                    className="max-h-[340px] w-auto rounded-lg object-contain"
                  />
                </div>
                {leftPhoto.caption && (
                  <p className="text-sm font-bold text-muted-foreground text-center max-w-[250px]">
                    {leftPhoto.caption}
                  </p>
                )}
                {leftPhoto.date && (
                  <p className="text-xs text-muted-foreground/60">{leftPhoto.date}</p>
                )}
              </>
            ) : (
              <p className="text-muted-foreground/40 font-display text-xl">COVER</p>
            )}
          </div>

          {/* Right page */}
          <div className="flex-1 bg-gradient-to-bl from-card to-muted/30 p-6 flex flex-col items-center justify-center gap-4">
            {rightPhoto ? (
              <>
                <div className="comic-card bg-white p-2 rotate-[2deg] hover:rotate-0 transition-transform">
                  <img
                    src={rightPhoto.src}
                    alt={rightPhoto.caption || `Photo ${rightIdx + 1}`}
                    className="max-h-[340px] w-auto rounded-lg object-contain"
                  />
                </div>
                {rightPhoto.caption && (
                  <p className="text-sm font-bold text-muted-foreground text-center max-w-[250px]">
                    {rightPhoto.caption}
                  </p>
                )}
                {rightPhoto.date && (
                  <p className="text-xs text-muted-foreground/60">{rightPhoto.date}</p>
                )}
              </>
            ) : (
              <div className="text-center">
                <p className="font-display text-3xl text-primary">📸 PUFFSNAP</p>
                <p className="text-sm text-muted-foreground mt-2">End of photobook</p>
              </div>
            )}
          </div>
        </div>

        {/* Page number */}
        <div className="mt-4 text-center">
          <span className="comic-card bg-muted px-4 py-1 font-display text-sm text-muted-foreground">
            Page {currentSpread * 2 + 1}–{Math.min(currentSpread * 2 + 2, photos.length)} of {photos.length}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={goPrev}
          disabled={currentSpread === 0}
          className="comic-button bg-muted px-5 py-3 text-muted-foreground disabled:opacity-30 flex items-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          PREV
        </button>
        <span className="font-display text-lg text-foreground">
          {currentSpread + 1} / {totalSpreads}
        </span>
        <button
          onClick={goNext}
          disabled={currentSpread >= totalSpreads - 1}
          className="comic-button bg-primary text-primary-foreground px-5 py-3 disabled:opacity-30 flex items-center gap-2"
        >
          NEXT
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// ─── Grid Gallery ────────────────────────────────────────────────────────────
function GridGalleryView({ photos, onSelect }: { photos: GalleryPhoto[]; onSelect: (idx: number) => void }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {photos.map((photo, idx) => (
        <button
          key={photo.id}
          onClick={() => onSelect(idx)}
          className="comic-card bg-card overflow-hidden hover:scale-[1.03] transition-transform group"
        >
          <div className="aspect-[3/4] overflow-hidden">
            <img
              src={photo.src}
              alt={photo.caption || `Photo ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="p-2 text-center">
            <p className="text-xs font-bold text-muted-foreground truncate">
              {photo.caption || `Strip #${idx + 1}`}
            </p>
            {photo.date && (
              <p className="text-[10px] text-muted-foreground/60">{photo.date}</p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}

// ─── Mobile Swipe Gallery ────────────────────────────────────────────────────
function MobileSwipeGallery({ photos }: { photos: GalleryPhoto[] }) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIdx < photos.length - 1) {
        setCurrentIdx((p) => p + 1);
      } else if (diff < 0 && currentIdx > 0) {
        setCurrentIdx((p) => p - 1);
      }
    }
  };

  const handleDownload = useCallback(() => {
    const photo = photos[currentIdx];
    if (!photo) return;
    const link = document.createElement("a");
    link.download = `puffsnap-gallery-${currentIdx + 1}.png`;
    link.href = photo.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [currentIdx, photos]);

  const handleShare = useCallback(async () => {
    const photo = photos[currentIdx];
    if (!photo || !navigator.share) return;
    try {
      await navigator.share({
        title: "PUFFSNAP Photo",
        text: photo.caption || "Check out my PUFFSNAP photo strip!",
        url: photo.src,
      });
    } catch {
      // User cancelled share
    }
  }, [currentIdx, photos]);

  if (photos.length === 0) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Main swipe area */}
      <div
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex-1 flex items-center justify-center relative overflow-hidden bg-background"
        onClick={() => setZoomed(!zoomed)}
      >
        <div
          className="flex transition-transform duration-300 ease-out"
          style={{
            transform: `translateX(-${currentIdx * 100}%)`,
            width: `${photos.length * 100}%`,
          }}
        >
          {photos.map((photo, idx) => (
            <div
              key={photo.id}
              className="flex items-center justify-center p-4"
              style={{ width: `${100 / photos.length}%` }}
            >
              <img
                src={photo.src}
                alt={photo.caption || `Photo ${idx + 1}`}
                className={`max-w-full rounded-2xl transition-transform duration-300 ${
                  zoomed && idx === currentIdx ? "scale-150" : "max-h-[60vh] object-contain"
                }`}
                style={{
                  filter: zoomed && idx === currentIdx ? "none" : undefined,
                  boxShadow: "4px 4px 0px hsl(280 80% 15%)",
                  border: "3px solid hsl(280 80% 15%)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Zoom indicator */}
        <div className="absolute top-4 right-4 comic-card bg-card/80 backdrop-blur px-2 py-1">
          {zoomed ? (
            <ZoomOut className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ZoomIn className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Caption */}
      <div className="px-4 py-3 text-center">
        {photos[currentIdx]?.caption && (
          <p className="font-bold text-foreground text-sm mb-1">{photos[currentIdx].caption}</p>
        )}
        {photos[currentIdx]?.date && (
          <p className="text-xs text-muted-foreground">{photos[currentIdx].date}</p>
        )}
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center gap-2 pb-2">
        {photos.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIdx(idx)}
            className={`rounded-full transition-all ${
              idx === currentIdx
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-6 flex gap-3">
        <button
          onClick={handleDownload}
          className="flex-1 comic-button bg-primary text-primary-foreground py-3 flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="font-display text-sm">SAVE</span>
        </button>
        {navigator.share && (
          <button
            onClick={handleShare}
            className="flex-1 comic-button bg-secondary text-secondary-foreground py-3 flex items-center justify-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            <span className="font-display text-sm">SHARE</span>
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ photo, onClose }: { photo: GalleryPhoto; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 comic-button bg-card/80 p-2 z-10"
      >
        <X className="h-5 w-5 text-foreground" />
      </button>
      <img
        src={photo.src}
        alt={photo.caption || "Photo"}
        className="max-w-full max-h-[85vh] object-contain rounded-2xl"
        style={{
          boxShadow: "8px 8px 0px hsl(280 80% 15%)",
          border: "4px solid hsl(280 80% 15%)",
        }}
        onClick={(e) => e.stopPropagation()}
      />
      {photo.caption && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 comic-card bg-card/90 backdrop-blur px-6 py-3 text-center">
          <p className="font-bold text-foreground text-sm">{photo.caption}</p>
          {photo.date && <p className="text-xs text-muted-foreground">{photo.date}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Admin PIN Gate ─────────────────────────────────────────────────────────
function AdminGate({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [authed, setAuthed] = useState(() => {
    try { return sessionStorage.getItem(SESSION_KEY) === "1"; } catch { return false; }
  });

  if (authed) return <>{children}</>;

  const handleSubmit = () => {
    if (pin === ADMIN_PIN) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch {}
      setAuthed(true);
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 1500);
    }
  };

  return (
    <div className="min-h-[100dvh] halftone flex flex-col items-center justify-center px-4">
      <div className="comic-card bg-card p-8 max-w-xs w-full text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 border-3 border-foreground">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h2 className="font-display text-2xl text-foreground mb-1">ADMIN ONLY</h2>
        <p className="text-xs text-muted-foreground mb-5">Enter PIN to view the gallery</p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="••••"
          className={`w-full text-center text-2xl tracking-[0.5em] rounded-xl border-3 bg-background px-4 py-3 font-display placeholder:text-muted-foreground/30 focus:outline-none transition-colors ${
            error ? "border-destructive animate-shake" : "border-border focus:border-primary"
          }`}
          autoFocus
        />

        {error && (
          <p className="mt-2 text-xs font-bold text-destructive">Wrong PIN! Try again.</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={pin.length === 0}
          className="btn-primary-pop w-full mt-4 flex items-center justify-center gap-2 text-lg disabled:opacity-40"
        >
          <Lock className="h-5 w-5" />
          UNLOCK
        </button>

        <button
          onClick={() => navigate("/")}
          className="mt-3 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to home
        </button>
      </div>
    </div>
  );
}

// ─── Main Gallery Page ───────────────────────────────────────────────────────
const Gallery = () => {
  return (
    <AdminGate>
      <GalleryContent />
    </AdminGate>
  );
};

const GalleryContent = () => {
  const navigate = useNavigate();
  const { strips: photos, loading } = useSavedStrips();
  const [isMobile, setIsMobile] = useState(false);
  const [viewMode, setViewMode] = useState<"flipbook" | "grid" | "swipe">("flipbook");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    setViewMode(isMobile ? "swipe" : "flipbook");
  }, [isMobile]);

  // Demo data if no saved strips
  const demoPhotos: GalleryPhoto[] = photos.length > 0
    ? photos
    : loading
    ? []
    : Array.from({ length: 6 }, (_, i) => ({
        id: `demo-${i}`,
        src: `/placeholder.svg`,
        caption: `Photo Strip #${i + 1}`,
        date: new Date().toLocaleDateString(),
        mode: i % 2 === 0 ? "3-shot" : "4-shot",
      }));

  return (
    <div className="min-h-screen bg-background halftone flex flex-col">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b-4 border-foreground px-4 py-3 flex items-center justify-between gap-3">
        <button
          onClick={() => navigate("/")}
          className="comic-button flex items-center gap-2 bg-muted px-4 py-2 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          HOME
        </button>

        <div className="text-center">
          <h2 className="font-display text-xl text-foreground leading-none">📸 MY GALLERY</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{demoPhotos.length} photo strip{demoPhotos.length !== 1 ? "s" : ""}</p>
        </div>

        {/* View toggle */}
        <div className="flex gap-1">
          {!isMobile && (
            <>
              <button
                onClick={() => setViewMode("flipbook")}
                className={`comic-button p-2 ${viewMode === "flipbook" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                title="Flipbook view"
              >
                <BookOpen className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`comic-button p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                title="Grid view"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
            </>
          )}
          {isMobile && (
            <>
              <button
                onClick={() => setViewMode("swipe")}
                className={`comic-button p-2 ${viewMode === "swipe" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                title="Swipe view"
              >
                <Smartphone className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`comic-button p-2 ${viewMode === "grid" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                title="Grid view"
              >
                <Grid2X2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Gallery content ── */}
      <div className="flex-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="comic-card bg-muted p-8 text-center animate-pulse">
              <p className="font-display text-4xl mb-2">📸</p>
              <p className="font-display text-xl text-foreground">LOADING GALLERY…</p>
              <p className="text-sm text-muted-foreground mt-2">
                Fetching your photo strips from the cloud ☁️
              </p>
            </div>
          </div>
        ) : demoPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
            <div className="comic-card bg-muted p-8 text-center">
              <p className="font-display text-4xl mb-2">📷</p>
              <p className="font-display text-xl text-foreground">NO STRIPS YET!</p>
              <p className="text-sm text-muted-foreground mt-2">
                Take some photos and they'll appear here
              </p>
              <button
                onClick={() => navigate("/")}
                className="btn-primary-pop mt-4 flex items-center gap-2 mx-auto text-sm"
              >
                START SNAPPING!
              </button>
            </div>
          </div>
        ) : (
          <>
            {viewMode === "flipbook" && (
              <div className="py-8">
                <FlipbookView photos={demoPhotos} />
              </div>
            )}

            {viewMode === "grid" && (
              <GridGalleryView
                photos={demoPhotos}
                onSelect={(idx) => setLightboxIdx(idx)}
              />
            )}

            {viewMode === "swipe" && (
              <MobileSwipeGallery photos={demoPhotos} />
            )}
          </>
        )}
      </div>

      {/* ── Lightbox ── */}
      {lightboxIdx !== null && demoPhotos[lightboxIdx] && (
        <Lightbox
          photo={demoPhotos[lightboxIdx]}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      {/* ── Device hint ── */}
      <div className="border-t-2 border-border bg-card/50 px-4 py-3 text-center flex items-center justify-center gap-2">
        {isMobile ? (
          <>
            <Smartphone className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              <strong>Mobile:</strong> Swipe left/right · Tap to zoom · Save & share below
            </span>
          </>
        ) : (
          <>
            <Monitor className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">
              <strong>Desktop:</strong> Flipbook mode — click arrows to turn pages · Switch to grid for overview
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default Gallery;
