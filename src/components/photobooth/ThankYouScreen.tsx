import { Heart, RefreshCcw, Star, Zap, Camera, Sparkles } from "lucide-react";

interface ThankYouScreenProps {
  onRestart: () => void;
}

const ThankYouScreen = ({ onRestart }: ThankYouScreenProps) => {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-12 halftone">
      {/* Floating comic elements */}
      <div className="floating-particle left-[10%] top-[20%]" style={{ animationDelay: "0s" }}>
        <Star className="h-10 w-10 text-accent fill-accent" />
      </div>
      <div className="floating-particle right-[15%] top-[25%]" style={{ animationDelay: "1s" }}>
        <Zap className="h-8 w-8 text-secondary fill-secondary" />
      </div>
      <div className="floating-particle left-[20%] bottom-[25%]" style={{ animationDelay: "2s" }}>
        <Heart className="h-10 w-10 text-secondary fill-secondary" />
      </div>
      <div className="floating-particle right-[10%] bottom-[35%]" style={{ animationDelay: "3s" }}>
        <Sparkles className="h-8 w-8 text-primary" />
      </div>
      <div className="floating-particle left-[40%] top-[10%]" style={{ animationDelay: "4s" }}>
        <Camera className="h-6 w-6 text-pop-cyan" />
      </div>
      
      {/* Speech bubbles */}
      <div className="absolute left-[5%] top-[35%] hidden md:block animate-bounce">
        <div className="comic-card rotate-[-8deg] px-4 py-2 bg-accent">
          <span className="font-display text-xl text-accent-foreground">ICONIC!</span>
        </div>
      </div>
      <div className="absolute right-[8%] top-[40%] hidden md:block animate-bounce" style={{ animationDelay: "0.5s" }}>
        <div className="comic-card rotate-[5deg] px-4 py-2 bg-secondary">
          <span className="font-display text-xl text-secondary-foreground">SLAY!</span>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center">
        {/* Heart icon with starburst */}
        <div className="mb-8 starburst animate-bounce-in">
          <div className="comic-card bg-secondary p-6 rounded-full">
            <Heart className="h-16 w-16 text-secondary-foreground fill-secondary-foreground" />
          </div>
        </div>

        {/* Thank you message */}
        <h1 className="mb-4 font-display text-6xl md:text-7xl text-primary comic-text-shadow">
          THANK YOU!
        </h1>

        <div className="speech-bubble mb-8 max-w-md">
          <p className="font-display text-2xl text-foreground">
            You absolutely SLAYED! 💅✨
          </p>
        </div>

        {/* Share reminder card */}
        <div className="comic-card-lg bg-card mb-10 max-w-md p-6">
          <div className="mb-4 flex items-center justify-center gap-2">
            <Camera className="h-6 w-6 text-primary" />
            <span className="font-display text-xl text-foreground">DON'T FORGET TO SHARE!</span>
          </div>
          <p className="mb-4 font-bold text-muted-foreground">
            Post your photo and tag us to be featured! 📸
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="comic-card bg-secondary px-4 py-2 text-sm font-display text-secondary-foreground">
              #PuffSnapIt
            </span>
            <span className="comic-card bg-primary px-4 py-2 text-sm font-display text-primary-foreground">
              #SnapPoseSlay
            </span>
          </div>
        </div>

        {/* Restart button */}
        <button
          onClick={onRestart}
          className="btn-secondary-pop group flex items-center gap-3 text-xl"
        >
          <RefreshCcw className="h-6 w-6 transition-transform group-hover:rotate-180" />
          SNAP AGAIN!
        </button>

        {/* Decorative footer */}
        <div className="mt-12 flex items-center gap-4">
          <Star className="h-8 w-8 text-accent fill-accent animate-wiggle" />
          <span className="font-display text-lg text-muted-foreground">KEEP SLAYING!</span>
          <Star className="h-8 w-8 text-accent fill-accent animate-wiggle" style={{ animationDelay: "0.3s" }} />
        </div>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-6 left-0 right-0 text-center">
        <p className="font-display text-2xl text-primary">
          PUFF SNAP 📸
        </p>
        <p className="font-bold text-muted-foreground">
          Snap. Pose. Slay.
        </p>
      </div>
    </div>
  );
};

export default ThankYouScreen;
