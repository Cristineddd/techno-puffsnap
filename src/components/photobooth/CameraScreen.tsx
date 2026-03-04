import { useState, useEffect, useRef } from "react";
import { Camera, RotateCcw, X, FlipHorizontal } from "lucide-react";

interface CameraScreenProps {
  onCapture: (imageData: string) => void;
  onBack: () => void;
}

const CameraScreen = ({ onCapture, onBack }: CameraScreenProps) => {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    setIsCapturing(true);
    setCountdown(3);
  };

  useEffect(() => {
    if (countdown === null) return;
    
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      // Take the photo
      setTimeout(() => {
        capturePhoto();
      }, 500);
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
        onCapture(imageData);
      }
    }
    setCountdown(null);
    setIsCapturing(false);
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-8">
      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute left-4 top-4 z-20 glass-card flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105"
      >
        <X className="h-5 w-5 text-foreground" />
      </button>

      {/* Camera preview container */}
      <div className="relative w-full max-w-2xl">
        {/* Frame decoration */}
        <div className="camera-ring rounded-3xl p-1">
          <div className="relative overflow-hidden rounded-3xl bg-background">
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
              <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                <span className="countdown-number font-display text-9xl font-bold text-primary">
                  {countdown}
                </span>
              </div>
            )}

            {/* Flash effect */}
            {countdown === 0 && (
              <div className="absolute inset-0 animate-pulse bg-white/80" />
            )}

            {/* Corner decorations */}
            <div className="absolute left-4 top-4 h-8 w-8 border-l-2 border-t-2 border-primary" />
            <div className="absolute right-4 top-4 h-8 w-8 border-r-2 border-t-2 border-primary" />
            <div className="absolute bottom-4 left-4 h-8 w-8 border-b-2 border-l-2 border-primary" />
            <div className="absolute bottom-4 right-4 h-8 w-8 border-b-2 border-r-2 border-primary" />

            {/* Hidden canvas for capture */}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </div>

        {/* Camera info bar */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="glass-card flex items-center gap-2 rounded-full px-4 py-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">Live Preview</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mt-8 flex items-center gap-6">
        {/* Mirror toggle */}
        <button
          onClick={() => setIsMirrored(!isMirrored)}
          className="glass-card flex h-14 w-14 items-center justify-center rounded-full transition-transform hover:scale-105"
        >
          <FlipHorizontal className={`h-6 w-6 ${isMirrored ? "text-primary" : "text-muted-foreground"}`} />
        </button>

        {/* Capture button */}
        <button
          onClick={handleCapture}
          disabled={isCapturing}
          className="btn-primary-glow flex h-20 w-20 items-center justify-center rounded-full disabled:opacity-50"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-primary-foreground">
            <Camera className="h-8 w-8 text-primary-foreground" />
          </div>
        </button>

        {/* Placeholder for balance */}
        <div className="h-14 w-14" />
      </div>

      {/* Instructions */}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Position yourself in the frame and tap the capture button
      </p>
    </div>
  );
};

export default CameraScreen;
