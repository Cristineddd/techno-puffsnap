import { forwardRef } from "react";
import { Camera, Star, Zap } from "lucide-react";
import { PhotoMode } from "./ModeSelectionScreen";

interface PhotoStripPreviewProps {
  images: string[];
  mode: PhotoMode;
  frame: string;
  hashtag: string;
  customMessage?: string;
  orientation?: "landscape" | "portrait";
}

const PhotoStripPreview = forwardRef<HTMLDivElement, PhotoStripPreviewProps>(
  ({ images, mode, frame, hashtag, customMessage, orientation = "landscape" }, ref) => {
    const getFrameClass = () => {
      switch (frame) {
        case "pop-purple":
          return "ring-8 ring-[hsl(280,85%,55%)]";
        case "pop-pink":
          return "ring-8 ring-[hsl(330,85%,60%)]";
        case "pop-yellow":
          return "ring-8 ring-[hsl(50,100%,55%)]";
        case "comic":
          return "ring-8 ring-[hsl(185,100%,50%)] shadow-[0_0_20px_hsl(185,100%,50%)] border-4 border-dashed border-[hsl(185,100%,50%)]";
        default:
          return "ring-4 ring-[hsl(280,80%,15%)]";
      }
    };

    const getBrandingColors = () => {
      switch (frame) {
        case "pop-purple":
          return {
            bg: "bg-[hsl(280,85%,55%)]",
            text: "text-white",
            accent: "text-[hsl(50,100%,55%)]"
          };
        case "pop-pink":
          return {
            bg: "bg-[hsl(330,85%,60%)]",
            text: "text-white",
            accent: "text-[hsl(50,100%,55%)]"
          };
        case "pop-yellow":
          return {
            bg: "bg-[hsl(50,100%,55%)]",
            text: "text-black",
            accent: "text-[hsl(280,85%,55%)]"
          };
        case "comic":
          return {
            bg: "bg-[hsl(185,100%,50%)]",
            text: "text-black",
            accent: "text-[hsl(280,85%,55%)]"
          };
        default:
          return {
            bg: "bg-[hsl(280,85%,55%)]",
            text: "text-white",
            accent: "text-[hsl(50,100%,55%)]"
          };
      }
    };

    const brandingColors = getBrandingColors();

    const getImageAspectRatio = () => {
      if (orientation === "portrait") {
        return "aspect-[3/4]";
      }
      return "aspect-[16/9]";
    };

    // Strip layouts based on mode
    if (mode === 2) {
      return (
        <div
          ref={ref}
          className={`relative overflow-hidden bg-white p-4 ${getFrameClass()}`}
          style={{ width: "280px" }}
        >
          {/* Photos */}
          <div className="space-y-3">
            {images.map((img, idx) => (
              <div key={idx} className="relative overflow-hidden">
                <img src={img} alt={`Photo ${idx + 1}`} className={`${getImageAspectRatio()} w-full object-cover`} />
              </div>
            ))}
          </div>
          
          {/* Messages and Hashtag */}
          <div className="mt-3 space-y-2">
            {customMessage && (
              <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-2 rounded">
                <p className="font-display text-sm font-bold text-primary leading-tight">{customMessage}</p>
              </div>
            )}
            {hashtag && (
              <div className="text-center">
                <p className="font-display text-lg text-primary font-bold">{hashtag}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (mode === 3) {
      return (
        <div
          ref={ref}
          className={`relative overflow-hidden bg-white p-4 ${getFrameClass()}`}
          style={{ width: "240px" }}
        >
          {/* Photos */}
          <div className="space-y-2">
            {images.map((img, idx) => (
              <div key={idx} className="relative overflow-hidden">
                <img src={img} alt={`Photo ${idx + 1}`} className={`${getImageAspectRatio()} w-full object-cover`} />
              </div>
            ))}
          </div>
          
          {/* Messages and Hashtag */}
          <div className="mt-2 space-y-2">
            {customMessage && (
              <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-2 rounded">
                <p className="font-display text-xs font-bold text-primary leading-tight">{customMessage}</p>
              </div>
            )}
            {hashtag && (
              <div className="text-center">
                <p className="font-display text-base text-primary font-bold">{hashtag}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Mode 6 - 2x3 grid
    return (
      <div
        ref={ref}
        className={`relative overflow-hidden bg-white p-4 ${getFrameClass()}`}
        style={{ width: "360px" }}
      >
        {/* Photos grid */}
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, idx) => (
            <div key={idx} className="relative overflow-hidden">
              <img src={img} alt={`Photo ${idx + 1}`} className={`${getImageAspectRatio()} w-full object-cover`} />
            </div>
          ))}
        </div>
        
        {/* Messages and Hashtag */}
        <div className="mt-3 space-y-2">
          {customMessage && (
            <div className="text-center bg-gradient-to-r from-primary/10 to-secondary/10 p-2 rounded">
              <p className="font-display text-base font-bold text-primary leading-tight">{customMessage}</p>
            </div>
          )}
          {hashtag && (
            <div className="text-center">
              <p className="font-display text-xl text-primary font-bold">{hashtag}</p>
            </div>
          )}
        </div>
      </div>
    );
  }
);

PhotoStripPreview.displayName = "PhotoStripPreview";

export default PhotoStripPreview;
