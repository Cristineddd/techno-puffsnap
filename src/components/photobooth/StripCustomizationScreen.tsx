import { useState, useRef } from "react";
import { ArrowLeft, Check, Hash, Printer, Star, Zap, Heart, Sparkles, Camera, Flame } from "lucide-react";
import { PhotoMode } from "./ModeSelectionScreen";
import PhotoStripPreview from "./PhotoStripPreview";
import html2canvas from "html2canvas";

interface StripCustomizationScreenProps {
  images: string[];
  mode: PhotoMode;
  orientation: "landscape" | "portrait";
  onComplete: (stripData: StripData) => void;
  onRetake: () => void;
}

export interface StripData {
  images: string[];
  mode: PhotoMode;
  frame: string;
  hashtag: string;
  customMessage: string;
  stripImage: string;
}

const frames = [
  { id: "none", name: "CLASSIC", color: "bg-muted" },
  { id: "pop-purple", name: "PURPLE", color: "bg-primary" },
  { id: "pop-pink", name: "PINK", color: "bg-secondary" },
  { id: "pop-yellow", name: "YELLOW", color: "bg-accent" },
  { id: "comic", name: "COMIC", color: "bg-pop-cyan" },
];

const hashtags = [
  "#PuffSnapIt",
  "#SlayTheDay",
  "#IconicMoment",
  "#SnapPoseSlay",
  "#PuffSnapVibes",
];

const stickers = [
  { icon: Star, label: "WOW!", color: "text-accent" },
  { icon: Zap, label: "ICONIC", color: "text-primary" },
  { icon: Heart, label: "SLAY", color: "text-secondary" },
  { icon: Flame, label: "FIRE", color: "text-destructive" },
  { icon: Sparkles, label: "MAGIC", color: "text-pop-cyan" },
  { icon: Camera, label: "SNAP", color: "text-primary" },
];

const StripCustomizationScreen = ({ images, mode, orientation, onComplete, onRetake }: StripCustomizationScreenProps) => {
  const [selectedFrame, setSelectedFrame] = useState("none");
  const [selectedHashtag, setSelectedHashtag] = useState(hashtags[0]);
  const [showHashtag, setShowHashtag] = useState(false);
  const [customMessage, setCustomMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  const handleComplete = async () => {
    if (!stripRef.current) return;
    
    setIsGenerating(true);
    try {
      // Wait longer for all CSS styles and images to fully load
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const canvas = await html2canvas(stripRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: false,
        foreignObjectRendering: false,
        logging: true,
        width: stripRef.current.offsetWidth,
        height: stripRef.current.offsetHeight,
        ignoreElements: (element) => {
          // Skip elements that might cause issues
          return element.classList.contains('ignore-capture');
        },
      });
      
      // Check if canvas is valid
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error('Canvas has invalid dimensions');
      }
      
      const stripImage = canvas.toDataURL("image/png", 1.0);
      
      // Check if image data is valid (not just a blank white image)
      if (stripImage.length < 1000) {
        throw new Error('Generated image appears to be invalid');
      }
      
      onComplete({
        images,
        mode,
        frame: selectedFrame,
        hashtag: selectedHashtag,
        customMessage: showMessage ? customMessage : "",
        stripImage,
      });
    } catch (err) {
      console.error("Error generating strip:", err);
      alert("Error creating strip. Please try again or try a different frame.");
    }
    setIsGenerating(false);
  };

  return (
    <div className="min-h-screen px-4 py-8 halftone">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onRetake}
            className="comic-button flex items-center gap-2 bg-muted px-4 py-2 text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            RETAKE
          </button>
          <h2 className="font-display text-2xl text-foreground">MAKE IT POP! 🎨</h2>
          <button
            onClick={handleComplete}
            disabled={isGenerating}
            className="btn-primary-pop flex items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>CREATING...</>
            ) : (
              <>
                <Check className="h-5 w-5" />
                DONE!
              </>
            )}
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Strip preview */}
          <div className="flex flex-col items-center">
            <div className="comic-card-lg bg-card p-6">
              <PhotoStripPreview
                ref={stripRef}
                images={images}
                mode={mode}
                frame={selectedFrame}
                hashtag={showHashtag ? selectedHashtag : ""}
                customMessage={showMessage ? customMessage : ""}
                orientation={orientation}
              />
            </div>
            
            <div className="mt-4 comic-card bg-accent px-4 py-2 flex items-center gap-2">
              <Printer className="h-5 w-5 text-accent-foreground" />
              <span className="font-display text-accent-foreground">PRINT-READY {mode}-SHOT STRIP!</span>
            </div>
          </div>

          {/* Customization options */}
          <div className="space-y-6">
            {/* Frames */}
            <div className="comic-card bg-card p-5">
              <h3 className="mb-4 font-display text-xl text-primary">
                🖼️ PICK A FRAME
              </h3>
              <div className="flex flex-wrap gap-3">
                {frames.map(frame => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`comic-button px-4 py-2 text-sm ${
                      selectedFrame === frame.id
                        ? `${frame.color} text-foreground`
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {frame.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="comic-card bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 font-display text-xl text-primary">
                  <Hash className="h-5 w-5" />
                  HASHTAG IT
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showHashtag}
                    onChange={(e) => setShowHashtag(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground">Show on strip</span>
                </label>
              </div>
              
              {showHashtag && (
                <div className="flex flex-wrap gap-2">
                  {hashtags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setSelectedHashtag(tag)}
                      className={`comic-button px-4 py-2 text-sm ${
                        selectedHashtag === tag
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              
              {!showHashtag && (
                <p className="text-sm text-muted-foreground italic">
                  Toggle on to add hashtags to your strip
                </p>
              )}
            </div>

            {/* Custom Message */}
            <div className="comic-card bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-2 font-display text-xl text-primary">
                  💬 CUSTOM MESSAGE
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showMessage}
                    onChange={(e) => setShowMessage(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-muted-foreground">Show on strip</span>
                </label>
              </div>
              
              {showMessage && (
                <div className="space-y-3">
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    placeholder="Type your message here... (e.g., 'Happy Birthday Sarah!', 'Class of 2026', 'Best Friends Forever')"
                    className="w-full p-3 border-2 border-primary/20 rounded-lg resize-none h-20 text-sm focus:border-primary focus:outline-none"
                    maxLength={100}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Perfect for birthdays, events, or personal messages!</span>
                    <span>{customMessage.length}/100</span>
                  </div>
                </div>
              )}
              
              {!showMessage && (
                <p className="text-sm text-muted-foreground italic">
                  Toggle on to add a personal message to your strip
                </p>
              )}
            </div>

            {/* Info card */}
            <div className="comic-card bg-accent p-5">
              <h3 className="mb-3 font-display text-lg text-accent-foreground">
                📋 STRIP INFO
              </h3>
              <div className="space-y-2 text-sm font-bold text-accent-foreground">
                <div className="flex justify-between">
                  <span>Photos:</span>
                  <span>{mode} SHOTS</span>
                </div>
                <div className="flex justify-between">
                  <span>Layout:</span>
                  <span>{mode === 6 ? "2×3 GRID" : `${mode}×1 STRIP`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Print Size:</span>
                  <span>{mode === 6 ? "4×6 INCHES" : "2×6 INCHES"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StripCustomizationScreen;
