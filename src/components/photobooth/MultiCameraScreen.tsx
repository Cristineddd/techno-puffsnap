import { useState, useEffect, useRef } from "react";
import { Camera, X, FlipHorizontal, RotateCcw, Zap } from "lucide-react";
import { PhotoMode } from "./ModeSelectionScreen";

interface MultiCameraScreenProps {
  mode: PhotoMode;
  timer?: number;
  onComplete: (images: string[]) => void;
  onBack: () => void;
  /** Pre-filled images from a previous session (for selective retake) */
  existingImages?: string[];
  /** Indices of slots to retake; undefined means shoot all slots fresh */
  retakeIndices?: number[];
}

const MultiCameraScreen = ({ mode, timer = 3, onComplete, onBack, existingImages, retakeIndices }: MultiCameraScreenProps) => {
  // Build initial images array: fill slots with existing images, leave retake slots empty ("")
  const buildInitialImages = () => {
    if (!existingImages || !retakeIndices) return [] as string[];
    const retakeSet = new Set(retakeIndices);
    return existingImages.map((img, i) => (retakeSet.has(i) ? "" : img));
  };

  // Which slots still need a photo shot
  const buildSlotsQueue = (): number[] => {
    if (!retakeIndices) return Array.from({ length: mode }, (_, i) => i);
    return retakeIndices.slice().sort((a, b) => a - b);
  };

  const initialImages = buildInitialImages();
  const slotsQueue = buildSlotsQueue();

  const [countdown, setCountdown] = useState<number | null>(null);
  const [shotQueueIdx, setShotQueueIdx] = useState(0); // index into slotsQueue
  const [capturedImages, setCapturedImages] = useState<string[]>(
    initialImages.length ? initialImages : Array(mode).fill("")
  );
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

        // Place photo into the correct slot
        const slotIdx = slotsQueue[shotQueueIdx];
        const newImages = [...capturedImages];
        newImages[slotIdx] = imageData;
        setCapturedImages(newImages);

        const nextQueueIdx = shotQueueIdx + 1;
        setShotQueueIdx(nextQueueIdx);

        const remaining = slotsQueue.length - nextQueueIdx;
        if (remaining === 0) {
          speak("Perfect! All photos captured!");
          setTimeout(() => onComplete(newImages), 1500);
        } else {
          speak(`Great shot! ${remaining} more to go`);
          setTimeout(() => setCountdown(timer), 2000);
        }
      }
    }
    setCountdown(null);
  };

  const handleRetake = () => {
    setCapturedImages(initialImages.length ? [...initialImages] : Array(mode).fill(""));
    setShotQueueIdx(0);
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
    <div className="relative flex h-[100dvh] flex-col halftone overflow-hidden">
      {/* Top bar — compact on mobile */}
      <div className="relative z-20 flex items-center justify-between px-3 py-2 sm:px-4 sm:py-3 bg-background/80 backdrop-blur shrink-0">
        {/* Back */}
        <button
          onClick={onBack}
          className="comic-card flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center bg-muted"
        >
          <X className="h-5 w-5 text-foreground" />
        </button>

        {/* Shot counter */}
        <div className="comic-card bg-accent px-4 py-1.5 sm:px-5 sm:py-2">
          <span className="font-display text-xl sm:text-2xl text-accent-foreground">{capturedImages.filter(Boolean).length}</span>
          <span className="font-display text-lg sm:text-xl text-accent-foreground/70"> / {mode}</span>
        </div>

        {/* Voice toggle */}
        <button
          onClick={() => setVoiceEnabled(!voiceEnabled)}
          className={`comic-card flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center text-lg ${
            voiceEnabled ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}
        >
          {voiceEnabled ? "🔊" : "🔇"}
        </button>
      </div>

      {/* Camera viewfinder — takes as much space as possible */}
      <div className="flex-1 relative min-h-0 px-2 sm:px-4 py-1 sm:py-2 flex items-center justify-center">
        <div className="comic-panel bg-card p-1 sm:p-2 w-full h-full max-w-2xl flex items-center justify-center">
          <div className="relative overflow-hidden rounded-xl w-full h-full">
            {/* Video preview — fill container, phone-friendly */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${isMirrored ? "scale-x-[-1]" : ""}`}
            />
            
            {/* Countdown overlay */}
            {countdown !== null && countdown > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/80">
                <span className="countdown-number font-display text-7xl sm:text-9xl text-primary comic-text-shadow">
                  {countdown}
                </span>
                <p className="mt-2 sm:mt-4 font-display text-xl sm:text-3xl text-primary-foreground animate-bounce">
                  {getCountdownWord(countdown)}
                </p>
              </div>
            )}

            {/* Flash effect */}
            {showFlash && (
              <div className="absolute inset-0 bg-accent" />
            )}

            {/* Corner decorations */}
            <div className="absolute left-2 top-2 sm:left-3 sm:top-3">
              <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-accent fill-accent" />
            </div>
            <div className="absolute right-2 top-2 sm:right-3 sm:top-3">
              <Zap className="h-4 w-4 sm:h-6 sm:w-6 text-accent fill-accent scale-x-[-1]" />
            </div>

            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>
      </div>

      {/* Thumbnails — smaller on mobile */}
      <div className="shrink-0 px-3 py-1.5 sm:py-2 flex justify-center gap-1.5 sm:gap-2 overflow-x-auto">
        {capturedImages.map((img, idx) => {
          const isRetakeSlot = slotsQueue.includes(idx);
          const isCurrent = slotsQueue[shotQueueIdx] === idx;
          const isDone = !!img;
          return (
            <div
              key={idx}
              className={`relative overflow-hidden rounded-lg sm:rounded-xl border-3 sm:border-4 bg-card shrink-0 ${
                isCurrent
                  ? "border-primary animate-pulse"
                  : isDone
                  ? "border-foreground"
                  : "border-dashed border-muted-foreground"
              }`}
            >
              {isDone ? (
                <img src={img} alt={`Shot ${idx + 1}`} className="h-11 w-14 sm:h-16 sm:w-20 object-cover" />
              ) : (
                <div className="flex h-11 w-14 sm:h-16 sm:w-20 items-center justify-center">
                  <span className="font-display text-sm sm:text-lg text-muted-foreground">{idx + 1}</span>
                </div>
              )}
              <div className={`absolute inset-0 flex items-center justify-center ${isDone ? "bg-primary/50" : ""}`}>
                <span className="font-display text-base sm:text-xl text-primary-foreground">
                  {isCurrent ? "📸" : isDone && isRetakeSlot ? "✓" : isDone ? idx + 1 : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls — compact bottom bar */}
      <div className="shrink-0 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-1 sm:pb-6 sm:pt-2 flex items-center justify-center gap-4 sm:gap-6">
        {/* Mirror toggle */}
        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className={`comic-card flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center transition-transform hover:scale-105 ${isMirrored ? "bg-primary" : "bg-muted"}`}
        >
          <FlipHorizontal className={`h-5 w-5 sm:h-7 sm:w-7 ${isMirrored ? "text-primary-foreground" : "text-muted-foreground"}`} />
        </button>

        {/* Capture button */}
        {!isCapturing ? (
          <button
            onClick={handleCapture}
            className="btn-primary-pop flex h-18 w-18 sm:h-24 sm:w-24 items-center justify-center rounded-full"
            style={{ height: 72, width: 72 }}
          >
            <div className="flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-card border-4 border-foreground"
              style={{ height: 56, width: 56 }}
            >
              <Camera className="h-7 w-7 sm:h-10 sm:w-10 text-primary" />
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-center" style={{ height: 72, width: 72 }}>
            <div className="h-14 w-14 sm:h-20 sm:w-20 animate-pulse rounded-full bg-secondary border-4 border-foreground"
              style={{ height: 56, width: 56 }}
            />
          </div>
        )}

        {/* Retake button */}
        <button
          onClick={handleRetake}
          disabled={capturedImages.filter(Boolean).length === 0}
          className="comic-card flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center bg-muted transition-transform hover:scale-105 disabled:opacity-30"
        >
          <RotateCcw className="h-5 w-5 sm:h-7 sm:w-7 text-muted-foreground" />
        </button>
      </div>

      {/* Instructions — compact on mobile */}
      <div className="shrink-0 px-3 pb-2 sm:pb-4">
        <div className="comic-card bg-accent px-4 py-2 sm:px-6 sm:py-3 mx-auto max-w-md">
          <p className="text-center font-display text-sm sm:text-lg text-accent-foreground">
            {isCapturing
              ? `📸 CAPTURING SHOT ${(slotsQueue[shotQueueIdx] ?? 0) + 1}...`
              : shotQueueIdx < slotsQueue.length
              ? `TAP TO TAKE PHOTO ${(slotsQueue[shotQueueIdx] ?? 0) + 1} OF ${mode}!`
              : "✅ ALL SHOTS DONE!"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default MultiCameraScreen;
