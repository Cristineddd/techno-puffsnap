import { Camera, Grid2X2, LayoutList, Rows3, Columns2, ArrowLeft, Zap } from "lucide-react";

export type PhotoMode = 2 | 3 | 4 | 6;

export type StripLayoutType = "classic-strip" | "square-strip" | "grid" | "polaroid";

interface ModeSelectionScreenProps {
  onSelectMode: (mode: PhotoMode) => void;
  onBack: () => void;
}

const modes = [
  {
    count: 2 as PhotoMode,
    name: "DUO",
    description: "2 epic shots",
    icon: LayoutList,
    color: "bg-pop-yellow",
  },
  {
    count: 3 as PhotoMode,
    name: "TRIPLE",
    description: "3 fire moments",
    icon: Rows3,
    color: "bg-primary",
  },
  {
    count: 4 as PhotoMode,
    name: "CLASSIC",
    description: "4-shot strip",
    icon: Columns2,
    color: "bg-accent",
  },
  {
    count: 6 as PhotoMode,
    name: "SQUAD",
    description: "6 pics, full grid",
    icon: Grid2X2,
    color: "bg-secondary",
  },
];

const ModeSelectionScreen = ({ onSelectMode, onBack }: ModeSelectionScreenProps) => {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 halftone">
      {/* Decorative elements */}
      <div className="absolute left-[10%] top-[20%] hidden md:block animate-wiggle">
        <Zap className="h-12 w-12 text-accent fill-accent" />
      </div>
      <div className="absolute right-[10%] bottom-[25%] hidden md:block animate-wiggle" style={{ animationDelay: "0.3s" }}>
        <Zap className="h-10 w-10 text-secondary fill-secondary" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="mb-6 sm:mb-10 text-center">
          <div className="mb-3 sm:mb-4 inline-flex items-center gap-2 comic-card px-3 py-1.5 sm:px-4 sm:py-2 bg-accent">
            <Camera className="h-4 w-4 sm:h-5 sm:w-5 text-accent-foreground" />
            <span className="font-display text-base sm:text-lg text-accent-foreground">
              CHOOSE YOUR VIBE
            </span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground comic-text-shadow">
            HOW MANY <span className="text-primary">SHOTS?</span>
          </h1>
        </div>

        {/* Mode cards — 2×2 on mobile, 4-col on md+ */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4 md:gap-6">
          {modes.map((mode, idx) => (
            <button
              key={mode.count}
              onClick={() => onSelectMode(mode.count)}
              className="comic-card-lg group relative overflow-hidden p-4 sm:p-6 text-center transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_hsl(280_80%_15%)]"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`mx-auto mb-2 sm:mb-4 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl ${mode.color} border-3 sm:border-4 border-foreground`}>
                <mode.icon className="h-7 w-7 sm:h-10 sm:w-10 text-foreground" />
              </div>

              {/* Count */}
              <div className="mb-1 sm:mb-2">
                <span className="font-display text-4xl sm:text-6xl text-foreground">{mode.count}</span>
              </div>

              {/* Name & Description */}
              <h3 className="mb-0.5 sm:mb-1 font-display text-xl sm:text-2xl text-primary">{mode.name}</h3>
              <p className="text-xs sm:text-sm font-bold text-muted-foreground">{mode.description}</p>

              {/* Layout preview — hidden on very small, shown sm+ */}
              <div className="mt-2 sm:mt-4 hidden sm:flex justify-center gap-1">
                {mode.count === 2 && (
                  <div className="flex flex-col gap-1">
                    <div className="h-6 w-12 rounded-lg bg-primary/30 border-2 border-foreground" />
                    <div className="h-6 w-12 rounded-lg bg-primary/30 border-2 border-foreground" />
                  </div>
                )}
                {mode.count === 3 && (
                  <div className="flex flex-col gap-1">
                    <div className="h-5 w-12 rounded-lg bg-primary/30 border-2 border-foreground" />
                    <div className="h-5 w-12 rounded-lg bg-primary/30 border-2 border-foreground" />
                    <div className="h-5 w-12 rounded-lg bg-primary/30 border-2 border-foreground" />
                  </div>
                )}
                {mode.count === 4 && (
                  <div className="flex flex-col gap-1">
                    <div className="h-4 w-12 rounded-lg bg-primary/30 border-2 border-foreground" />
                    <div className="h-4 w-12 rounded-lg bg-primary/30 border-2 border-foreground" />
                    <div className="h-4 w-12 rounded-lg bg-primary/30 border-2 border-foreground" />
                    <div className="h-4 w-12 rounded-lg bg-primary/30 border-2 border-foreground" />
                  </div>
                )}
                {mode.count === 6 && (
                  <div className="grid grid-cols-2 gap-1">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-5 w-6 rounded bg-primary/30 border-2 border-foreground" />
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Back button */}
        <div className="mt-6 sm:mt-10 text-center">
          <button
            onClick={onBack}
            className="comic-button flex items-center gap-2 mx-auto bg-muted px-5 py-2.5 sm:px-6 sm:py-3 text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            BACK
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModeSelectionScreen;
