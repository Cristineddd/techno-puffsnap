import { useState } from "react";
import { ArrowLeft, Timer, Camera, Smartphone, RotateCcw } from "lucide-react";
import { PhotoMode } from "./ModeSelectionScreen";

interface CameraSetupScreenProps {
  mode: PhotoMode;
  onBack: () => void;
  onNext: (settings: { timer: number; orientation: "landscape" | "portrait" }) => void;
}

const CameraSetupScreen = ({ mode, onBack, onNext }: CameraSetupScreenProps) => {
  const [selectedTimer, setSelectedTimer] = useState(3);
  const [selectedOrientation, setSelectedOrientation] = useState<"landscape" | "portrait">("landscape");

  const timerOptions = [
    { value: 3, label: "3 SEC", icon: "⚡" },
    { value: 5, label: "5 SEC", icon: "⏱️" },
    { value: 10, label: "10 SEC", icon: "⏰" }
  ];

  const handleNext = () => {
    onNext({
      timer: selectedTimer,
      orientation: selectedOrientation
    });
  };

  return (
    <div className="min-h-screen px-4 py-8 halftone">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="comic-button flex items-center gap-2 bg-muted px-4 py-2 text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            BACK
          </button>
          <h2 className="font-display text-3xl text-foreground">CAMERA SETUP 📸</h2>
          <div></div>
        </div>

        <div className="flex flex-col items-center justify-center space-y-8">
          {/* Preview */}
          <div className="comic-card-lg bg-card p-8">
            <div className="text-center">
              <Camera className="mx-auto h-20 w-20 text-primary mb-4" />
              <h3 className="font-display text-2xl text-foreground mb-2">
                {mode === 2 ? "2 PHOTOS" : mode === 3 ? "3 PHOTOS" : "6 PHOTOS"}
              </h3>
              <p className="text-muted-foreground">
                Get ready for your photo session!
              </p>
            </div>
          </div>

          {/* Settings - All in one row */}
          <div className="flex items-center gap-8">
            {/* Timer Selection */}
            <div className="comic-card bg-card p-6">
              <h3 className="mb-4 font-display text-xl text-foreground flex items-center gap-2">
                <Timer className="h-6 w-6" />
                TIMER
              </h3>
              <div className="flex gap-3">
                {timerOptions.map((timer) => (
                  <button
                    key={timer.value}
                    onClick={() => setSelectedTimer(timer.value)}
                    className={`comic-button p-4 text-center ${
                      selectedTimer === timer.value
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <div className="text-2xl mb-1">{timer.icon}</div>
                    <div className="font-display text-lg">{timer.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Orientation Selection */}
            <div className="comic-card bg-card p-6">
              <h3 className="mb-4 font-display text-xl text-foreground flex items-center gap-2">
                <RotateCcw className="h-6 w-6" />
                ORIENTATION
              </h3>
              <div className="flex gap-4">
                {[
                  { key: "landscape", label: "LANDSCAPE", icon: "📱", desc: "Wide format" },
                  { key: "portrait", label: "PORTRAIT", icon: "📲", desc: "Tall format" }
                ].map((orientation) => (
                  <button
                    key={orientation.key}
                    onClick={() => setSelectedOrientation(orientation.key as "landscape" | "portrait")}
                    className={`comic-button p-4 text-center ${
                      selectedOrientation === orientation.key
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    <div className="text-3xl mb-2">{orientation.icon}</div>
                    <div className="font-display text-lg mb-1">{orientation.label}</div>
                    <div className="text-xs opacity-80">{orientation.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleNext}
            className="btn-primary-pop text-xl py-4 px-8 flex items-center justify-center gap-3"
          >
            <Smartphone className="h-7 w-7" />
            START PHOTO SESSION
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraSetupScreen;