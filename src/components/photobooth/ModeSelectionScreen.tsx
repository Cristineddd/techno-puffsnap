import { Camera, Grid2X2, LayoutList, Rows3, ArrowLeft, Zap } from "lucide-react";

export type PhotoMode = 2 | 3 | 6;

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
    count: 6 as PhotoMode,
    name: "SQUAD",
    description: "6 pics, full grid",
    icon: Grid2X2,
    color: "bg-secondary",
  },
];

const ModeSelectionScreen = ({ onSelectMode, onBack }: ModeSelectionScreenProps) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12 halftone">
      {/* Decorative elements */}
      <div className="absolute left-[10%] top-[20%] hidden md:block animate-wiggle">
        <Zap className="h-12 w-12 text-accent fill-accent" />
      </div>
      <div className="absolute right-[10%] bottom-[25%] hidden md:block animate-wiggle" style={{ animationDelay: "0.3s" }}>
        <Zap className="h-10 w-10 text-secondary fill-secondary" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 comic-card px-4 py-2 bg-accent">
            <Camera className="h-5 w-5 text-accent-foreground" />
            <span className="font-display text-lg text-accent-foreground">
              CHOOSE YOUR VIBE
            </span>
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-foreground comic-text-shadow">
            HOW MANY <span className="text-primary">SHOTS?</span>
          </h1>
        </div>

        {/* Mode cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {modes.map((mode, idx) => (
            <button
              key={mode.count}
              onClick={() => onSelectMode(mode.count)}
              className="comic-card-lg group relative overflow-hidden p-6 text-center transition-all hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_hsl(280_80%_15%)]"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl ${mode.color} border-4 border-foreground`}>
                <mode.icon className="h-10 w-10 text-foreground" />
              </div>

              {/* Count */}
              <div className="mb-2">
                <span className="font-display text-6xl text-foreground">{mode.count}</span>
              </div>

              {/* Name & Description */}
              <h3 className="mb-1 font-display text-2xl text-primary">{mode.name}</h3>
              <p className="text-sm font-bold text-muted-foreground">{mode.description}</p>

              {/* Layout preview */}
              <div className="mt-4 flex justify-center gap-1">
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
        <div className="mt-10 text-center">
          <button
            onClick={onBack}
            className="comic-button flex items-center gap-2 mx-auto bg-muted px-6 py-3 text-muted-foreground"
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
