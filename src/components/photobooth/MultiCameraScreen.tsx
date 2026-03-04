import { useState, useEffect, useRef } from "react";
import { Camera, X, FlipHorizontal, RotateCcw, Zap } from "lucide-react";
import { PhotoMode } from "./ModeSelectionScreen";

interface MultiCameraScreenProps {
  mode: PhotoMode;
  timer?: number;
  onComplete: (images: string[]) => void;
  onBack: () => void;
}

const MultiCameraScreen = ({ mode, timer = 3, onComplete, onBack }: MultiCameraScreenProps) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [currentShot, setCurrentShot] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [showFlash, setShowFlash] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Speech synthesis function
  const speak = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.2;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    
    // Try to use a female voice if available
    const voices = speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('karen')
    );
    if (femaleVoice) utterance.voice = femaleVoice;
    
    speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const handleCapture = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    setCountdown(timer);
  };

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      // Voice countdown
      if (countdown <= 3) {
        speak(countdown.toString());
      } else if (countdown === 5) {
        speak("Get ready! 5");
      } else if (countdown === 10) {
        speak("Photo time! 10");
      }
      
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      speak("Say cheese!");
      setTimeout(() => {
        capturePhoto();
      }, 300);
    }
  }, [countdown]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        if (isMirrored) {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/png");
        
        setShowFlash(true);
        setTimeout(() => setShowFlash(false), 200);

        const newImages = [...capturedImages, imageData];
        setCapturedImages(newImages);
        
        const nextShot = currentShot + 1;
        setCurrentShot(nextShot);
        
        if (nextShot >= mode) {
          speak("Perfect! All photos captured!");
          setTimeout(() => onComplete(newImages), 1500);
        } else {
          speak(`Great shot! ${mode - nextShot} more to go`);
          setTimeout(() => {
            setCountdown(timer);
          }, 2000);
        }
      }
    }
    setCountdown(null);
  };

  const handleRetake = () => {
    setCapturedImages([]);
    setCurrentShot(0);
    setIsCapturing(false);
    setCountdown(null);
  };

  const getCountdownWord = (num: number) => {
    switch(num) {
      case 3: return "READY...";
      case 2: return "SET...";
      case 1: return "SNAP!";
      default: return "";
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8 halftone">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute left-4 top-4 z-20 comic-card flex h-14 w-14 items-center justify-center bg-muted transition-transform hover:scale-105"
      >
        <X className="h-6 w-6 text-foreground" />
      </button>

      {/* Voice toggle */}
      <button
        onClick={() => setVoiceEnabled(!voiceEnabled)}
        className={`absolute left-4 top-20 z-20 comic-card flex h-14 w-14 items-center justify-center transition-transform hover:scale-105 ${
          voiceEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {voiceEnabled ? "🔊" : "🔇"}
      </button>

      {/* Shot counter */}
      <div className="absolute right-4 top-4 z-20">
        <div className="comic-card bg-accent px-5 py-3">
          <span className="font-display text-2xl text-accent-foreground">{currentShot}</span>
          <span className="font-display text-xl text-accent-foreground/70"> / {mode}</span>
        </div>
      </div>

      {/* Main camera area */}
      <div className="relative w-full max-w-2xl">
        {/* Comic panel frame */}
        <div className="comic-panel bg-card p-2">
          <div className="relative overflow-hidden rounded-xl">
            {/* Video preview */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`aspect-[4/3] w-full object-cover ${isMirrored ? "scale-x-[-1]" : ""}`}
            />
            
            {/* Countdown overlay */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/80">
                <span className="countdown-number font-display text-9xl text-primary comic-text-shadow">
                  {countdown}
                </span>
                <p className="mt-4 font-display text-3xl text-primary-foreground animate-bounce">
                  {getCountdownWord(countdown)}
                </p>
              </div>
            )}

            {/* Flash effect */}
            {showFlash && (
              <div className="absolute inset-0 bg-accent" />
            )}

            {/* Corner decorations - comic style */}
            <div className="absolute left-3 top-3 flex items-center gap-1">
              <Zap className="h-6 w-6 text-accent fill-accent" />
            </div>
            <div className="absolute right-3 top-3 flex items-center gap-1">
              <Zap className="h-6 w-6 text-accent fill-accent scale-x-[-1]" />
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Thumbnails of captured shots */}
        {capturedImages.length > 0 && (
          <div className="mt-4 flex justify-center gap-2">
            {capturedImages.map((img, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-xl border-4 border-foreground bg-card">
                <img src={img} alt={`Shot ${idx + 1}`} className="h-16 w-20 object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-primary/60">
                  <span className="font-display text-xl text-primary-foreground">{idx + 1}</span>
                </div>
              </div>
            ))}
            {[...Array(mode - capturedImages.length)].map((_, idx) => (
              <div key={`empty-${idx}`} className="flex h-16 w-20 items-center justify-center rounded-xl border-4 border-dashed border-muted-foreground bg-muted/50">
                <span className="font-display text-lg text-muted-foreground">{capturedImages.length + idx + 1}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-6">
        {/* Mirror toggle */}
        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className={`comic-card flex h-16 w-16 items-center justify-center transition-transform hover:scale-105 ${isMirrored ? "bg-primary" : "bg-muted"}`}
        >
          <FlipHorizontal className={`h-7 w-7 ${isMirrored ? "text-primary-foreground" : "text-muted-foreground"}`} />
        </button>

        {/* Capture button */}
        {!isCapturing ? (
          <button
            onClick={handleCapture}
            className="btn-primary-pop flex h-24 w-24 items-center justify-center rounded-full"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-card border-4 border-foreground">
              <Camera className="h-10 w-10 text-primary" />
            </div>
          </button>
        ) : (
          <div className="flex h-24 w-24 items-center justify-center">
            <div className="h-20 w-20 animate-pulse rounded-full bg-secondary border-4 border-foreground" />
          </div>
        )}

        {/* Retake button */}
        <button
          onClick={handleRetake}
          disabled={capturedImages.length === 0}
          className="comic-card flex h-16 w-16 items-center justify-center bg-muted transition-transform hover:scale-105 disabled:opacity-30"
        >
          <RotateCcw className="h-7 w-7 text-muted-foreground" />
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 comic-card bg-accent px-6 py-3">
        <p className="text-center font-display text-lg text-accent-foreground">
          {isCapturing 
            ? `📸 CAPTURING ${mode} SHOTS...` 
            : `TAP TO TAKE ${mode} PHOTOS!`
          }
        </p>
      </div>
    </div>
  );
};

export default MultiCameraScreen;
