import { Camera, Zap, Star, Sparkles } from "lucide-react";

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 halftone">
      {/* Floating comic elements */}
      <div className="floating-particle left-[8%] top-[15%]" style={{ animationDelay: "0s" }}>
        <Star className="h-8 w-8 text-accent fill-accent" />
      </div>
      <div className="floating-particle right-[12%] top-[20%]" style={{ animationDelay: "1s" }}>
        <Zap className="h-10 w-10 text-secondary fill-secondary" />
      </div>
      <div className="floating-particle left-[15%] bottom-[20%]" style={{ animationDelay: "2s" }}>
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <div className="floating-particle right-[10%] bottom-[30%]" style={{ animationDelay: "3s" }}>
        <Star className="h-6 w-6 text-pop-yellow fill-pop-yellow" />
      </div>
      
      {/* Speech bubble decorations */}
      <div className="absolute left-[5%] top-[35%] hidden md:block animate-bounce-in" style={{ animationDelay: "0.5s" }}>
        <div className="comic-card rotate-[-8deg] px-4 py-2">
          <span className="font-display text-xl text-primary">WOW!</span>
        </div>
      </div>
      <div className="absolute right-[8%] top-[40%] hidden md:block animate-bounce-in" style={{ animationDelay: "0.8s" }}>
        <div className="comic-card rotate-[5deg] px-4 py-2">
          <span className="font-display text-xl text-secondary">SLAY!</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Logo area with starburst */}
        <div className="mb-6 animate-float">
          <div className="starburst">
            <div className="camera-ring p-1">
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-card border-4 border-foreground">
                <Camera className="h-14 w-14 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Brand name */}
        <h1 className="mb-2 font-display text-8xl md:text-9xl lg:text-[12rem] font-black comic-text-shadow text-primary leading-none tracking-wide" style={{
          textShadow: '-2px -2px 0 #000, 2px -2px 0 #000, -2px 2px 0 #000, 2px 2px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000, 3px 3px 0 #000',
          letterSpacing: '0.05em'
        }}>
          PUFF SNAP
        </h1>

        {/* Tagline in speech bubble style */}
        <div className="speech-bubble mb-10 mt-4">
          <p className="font-display text-2xl md:text-3xl text-foreground tracking-wider">
            Snap. Pose. Slay. ✨
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={onStart}
          className="btn-primary-pop group flex items-center gap-3 text-xl mb-4"
        >
          <Camera className="h-7 w-7 transition-transform group-hover:scale-110" />
          START SNAPPING!
        </button>

        {/* Feature icons */}
        <div className="mt-14 flex items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="comic-card flex h-16 w-16 items-center justify-center bg-pop-yellow">
              <Star className="h-8 w-8 text-foreground fill-foreground" />
            </div>
            <span className="font-bold text-sm text-muted-foreground">ICONIC</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="comic-card flex h-16 w-16 items-center justify-center bg-primary">
              <Zap className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-muted-foreground">BOLD</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="comic-card flex h-16 w-16 items-center justify-center bg-secondary">
              <Sparkles className="h-8 w-8 text-secondary-foreground" />
            </div>
            <span className="font-bold text-sm text-muted-foreground">FUN</span>
          </div>
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="font-display text-lg text-muted-foreground tracking-wider">
          #PuffSnapIt 📸
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
