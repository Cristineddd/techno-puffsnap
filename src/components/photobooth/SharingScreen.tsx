import { Download, QrCode, Share2, Facebook, Instagram, Twitter, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { CustomizedPhoto } from "./CustomizationScreen";

interface SharingScreenProps {
  photo: CustomizedPhoto;
  onBack: () => void;
  onFinish: () => void;
}

const SharingScreen = ({ photo, onBack, onFinish }: SharingScreenProps) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = "technopreneurship-photo.png";
    link.href = photo.imageData;
    link.click();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2000);
  };

  const handleShare = (platform: string) => {
    // In a real app, this would integrate with social media APIs
    console.log(`Sharing to ${platform}`);
    // Show success and proceed to thank you
    onFinish();
  };

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="glass-card flex items-center gap-2 rounded-full px-4 py-2 transition-transform hover:scale-105"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">Back</span>
          </button>
          <h2 className="font-display text-xl font-semibold">Share Your Moment</h2>
          <div className="w-20" />
        </div>

        {/* Photo preview */}
        <div className="mb-8 flex justify-center">
          <div className="glass-card overflow-hidden rounded-2xl p-2">
            <img
              src={photo.imageData}
              alt="Your customized photo"
              className="aspect-[4/3] w-full max-w-md rounded-xl object-cover"
            />
          </div>
        </div>

        {/* Sharing options */}
        <div className="space-y-4">
          {/* Download */}
          <button
            onClick={handleDownload}
            className="btn-primary-glow flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-display text-lg font-semibold text-primary-foreground"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle className="h-6 w-6" />
                Downloaded!
              </>
            ) : (
              <>
                <Download className="h-6 w-6" />
                Download Photo
              </>
            )}
          </button>

          {/* QR Code */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="glass-card flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-4 font-display text-lg font-semibold transition-transform hover:scale-[1.02]"
          >
            <QrCode className="h-6 w-6 text-primary" />
            {showQR ? "Hide QR Code" : "Scan QR to Get Photo"}
          </button>

          {/* QR Code Display */}
          {showQR && (
            <div className="glass-card flex flex-col items-center rounded-2xl p-6 animate-scale-in">
              <div className="mb-4 h-48 w-48 rounded-xl bg-white p-4">
                {/* Placeholder QR code - in real app, generate actual QR */}
                <div className="grid h-full w-full grid-cols-8 grid-rows-8 gap-0.5">
                  {Array.from({ length: 64 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${Math.random() > 0.5 ? "bg-background" : "bg-transparent"}`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Scan with your phone camera to download
              </p>
            </div>
          )}

          {/* Social sharing */}
          <div className="glass-card rounded-2xl p-6">
            <h3 className="mb-4 text-center font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Share on Social Media
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleShare("facebook")}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1877F2] transition-transform hover:scale-105"
              >
                <Facebook className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={() => handleShare("instagram")}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] transition-transform hover:scale-105"
              >
                <Instagram className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#000000] transition-transform hover:scale-105"
              >
                <Twitter className="h-8 w-8 text-white" />
              </button>
            </div>
          </div>

          {/* Skip button */}
          <button
            onClick={onFinish}
            className="w-full py-3 text-center text-muted-foreground transition-colors hover:text-foreground"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharingScreen;
