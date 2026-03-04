import { useState } from "react";
import { ArrowLeft, Check, Lightbulb, Rocket, Code, Settings, TrendingUp, Zap, Star, Hash } from "lucide-react";

interface CustomizationScreenProps {
  imageData: string;
  onComplete: (customizedImage: CustomizedPhoto) => void;
  onRetake: () => void;
}

export interface CustomizedPhoto {
  imageData: string;
  frame: string;
  stickers: string[];
  hashtag: string;
}

const frames = [
  { id: "none", name: "None", border: "" },
  { id: "neon-cyan", name: "Neon Cyan", border: "border-4 border-neon-cyan neon-glow-cyan" },
  { id: "neon-purple", name: "Neon Purple", border: "border-4 border-neon-purple neon-glow-purple" },
  { id: "gradient", name: "Gradient", border: "ring-4 ring-offset-2 ring-offset-background" },
  { id: "tech", name: "Tech Grid", border: "border-4 border-dashed border-primary" },
];

const stickers = [
  { id: "lightbulb", icon: Lightbulb, color: "text-accent" },
  { id: "rocket", icon: Rocket, color: "text-neon-cyan" },
  { id: "code", icon: Code, color: "text-neon-green" },
  { id: "gear", icon: Settings, color: "text-muted-foreground" },
  { id: "graph", icon: TrendingUp, color: "text-neon-purple" },
  { id: "zap", icon: Zap, color: "text-accent" },
  { id: "star", icon: Star, color: "text-neon-pink" },
];

const hashtags = [
  "#TechnopreneurshipDay",
  "#InnovateNow",
  "#StartupReady",
  "#FutureMakers",
  "#TechInnovators",
];

const CustomizationScreen = ({ imageData, onComplete, onRetake }: CustomizationScreenProps) => {
  const [selectedFrame, setSelectedFrame] = useState("none");
  const [selectedStickers, setSelectedStickers] = useState<string[]>([]);
  const [selectedHashtag, setSelectedHashtag] = useState(hashtags[0]);

  const toggleSticker = (stickerId: string) => {
    setSelectedStickers(prev =>
      prev.includes(stickerId)
        ? prev.filter(s => s !== stickerId)
        : [...prev, stickerId]
    );
  };

  const handleComplete = () => {
    onComplete({
      imageData,
      frame: selectedFrame,
      stickers: selectedStickers,
      hashtag: selectedHashtag,
    });
  };

  const getFrameClass = () => {
    const frame = frames.find(f => f.id === selectedFrame);
    return frame?.border || "";
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onRetake}
            className="glass-card flex items-center gap-2 rounded-full px-4 py-2 transition-transform hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Retake</span>
          </button>
          <h2 className="font-display text-xl font-semibold">Customize Your Photo</h2>
          <button
            onClick={handleComplete}
            className="btn-primary-glow flex items-center gap-2 rounded-full px-5 py-2 font-semibold text-primary-foreground"
          >
            <Check className="h-4 w-4" />
            Done
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Photo preview */}
          <div className="flex flex-col items-center">
            <div className={`relative overflow-hidden rounded-2xl ${getFrameClass()}`}>
              <img
                src={imageData}
                alt="Your photo"
                className="aspect-[4/3] w-full max-w-md object-cover"
              />
              
              {/* Sticker overlays */}
              <div className="absolute inset-0 pointer-events-none">
                {selectedStickers.includes("lightbulb") && (
                  <div className="absolute right-4 top-4 animate-float">
                    <Lightbulb className="h-12 w-12 text-accent drop-shadow-lg" />
                  </div>
                )}
                {selectedStickers.includes("rocket") && (
                  <div className="absolute left-4 top-4 animate-float" style={{ animationDelay: "0.5s" }}>
                    <Rocket className="h-12 w-12 text-neon-cyan drop-shadow-lg" />
                  </div>
                )}
                {selectedStickers.includes("code") && (
                  <div className="absolute left-4 bottom-4 animate-float" style={{ animationDelay: "1s" }}>
                    <Code className="h-10 w-10 text-neon-green drop-shadow-lg" />
                  </div>
                )}
                {selectedStickers.includes("gear") && (
                  <div className="absolute right-4 bottom-4 animate-spin-slow">
                    <Settings className="h-10 w-10 text-muted-foreground drop-shadow-lg" />
                  </div>
                )}
                {selectedStickers.includes("graph") && (
                  <div className="absolute right-12 top-1/2 animate-float" style={{ animationDelay: "1.5s" }}>
                    <TrendingUp className="h-10 w-10 text-neon-purple drop-shadow-lg" />
                  </div>
                )}
                {selectedStickers.includes("zap") && (
                  <div className="absolute left-12 top-1/3 animate-pulse">
                    <Zap className="h-10 w-10 text-accent drop-shadow-lg" />
                  </div>
                )}
                {selectedStickers.includes("star") && (
                  <div className="absolute right-1/3 top-4 animate-pulse" style={{ animationDelay: "0.3s" }}>
                    <Star className="h-8 w-8 text-neon-pink drop-shadow-lg" />
                  </div>
                )}
              </div>

              {/* Branding overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-display text-xs font-semibold text-primary">Technopreneurship 2025</p>
                    <p className="text-xs text-muted-foreground">Innovation University</p>
                  </div>
                  <p className="font-display text-xs font-medium text-neon-cyan">{selectedHashtag}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Customization options */}
          <div className="space-y-6">
            {/* Frames */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Choose a Frame
              </h3>
              <div className="flex flex-wrap gap-3">
                {frames.map(frame => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
                      selectedFrame === frame.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {frame.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Stickers */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Add Stickers
              </h3>
              <div className="flex flex-wrap gap-3">
                {stickers.map(sticker => (
                  <button
                    key={sticker.id}
                    onClick={() => toggleSticker(sticker.id)}
                    className={`flex h-14 w-14 items-center justify-center rounded-xl transition-all ${
                      selectedStickers.includes(sticker.id)
                        ? "bg-primary/20 ring-2 ring-primary"
                        : "bg-muted hover:bg-muted/80"
                    }`}
                  >
                    <sticker.icon className={`h-7 w-7 ${sticker.color}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div className="glass-card rounded-2xl p-5">
              <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Hash className="h-4 w-4" />
                Event Hashtag
              </h3>
              <div className="flex flex-wrap gap-2">
                {hashtags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedHashtag(tag)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      selectedHashtag === tag
                        ? "bg-secondary text-secondary-foreground neon-glow-purple"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationScreen;
