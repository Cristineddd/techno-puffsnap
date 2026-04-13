import { Download, Mail, Printer, QrCode, ArrowLeft, CheckCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { PhotoMode } from "./ModeSelectionScreen";
import { saveToGallery } from "../../lib/galleryService";
import { sendStripEmail, type StripEmailData } from "../../lib/emailServiceReal";
import EmailScheduling from "./EmailScheduling";

interface StripData {
  mode: PhotoMode;
  frame: string;
  hashtag: string;
  customMessage?: string;
  stripImage: string;
}

interface StripSharingScreenProps {
  stripData: StripData;
  onBack: () => void;
  onFinish: () => void;
}

const StripSharingScreen = ({ stripData, onBack, onFinish }: StripSharingScreenProps) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showEmailScheduling, setShowEmailScheduling] = useState(false);
  const [emailScheduled, setEmailScheduled] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [cloudinaryUrl, setCloudinaryUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Cloudinary config
  const CLOUDINARY_CLOUD_NAME = 'dopc9l096';
  const CLOUDINARY_UPLOAD_PRESET = 'puffsnap_uploads';

  // NO auto-upload on mount — Cloudinary upload only happens when QR is requested

  /** Upload to Cloudinary + generate QR — only called when user taps "SCAN QR" */
  const generateQRCode = async () => {
    // If we already have a QR code from a previous click, just toggle display
    if (qrCodeUrl) return;

    try {
      setIsGeneratingQR(true);
      setUploadError(null);

      let qrData: string;

      // If already uploaded, reuse URL
      if (cloudinaryUrl) {
        qrData = cloudinaryUrl;
      } else {
        try {
          const url = await uploadToCloudinary(stripData.stripImage);
          setCloudinaryUrl(url);
          qrData = url;
          console.log('Image uploaded to Cloudinary:', url);
        } catch (err) {
          console.warn('Cloudinary upload failed:', err);
          setUploadError('Upload failed — try downloading instead!');
          setIsGeneratingQR(false);
          return;
        }
      }

      const qrCode = await QRCode.toDataURL(qrData, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
      setUploadError('Could not generate QR code.');
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleDownload = async () => {
    try {
      if (!stripData.stripImage || stripData.stripImage === '') {
        alert('Strip image not available. Please try regenerating.');
        return;
      }
      
      const link = document.createElement("a");
      link.download = `puffsnap-${stripData.mode}shots-${Date.now()}.png`;
      link.href = stripData.stripImage;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Save to Firestore gallery (+ localStorage fallback)
      try {
        await saveToGallery({
          stripImage: stripData.stripImage,
          cloudinaryUrl: cloudinaryUrl || undefined,
          mode: stripData.mode,
          frame: stripData.frame,
        });
      } catch (err) {
        console.warn("Gallery save failed:", err);
      }

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2000);
    } catch (error) {
      console.error('Download failed:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Print PUFF SNAP Strip</title>
            <style>
              body {
                margin: 0;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                background: #f5f5f5;
              }
              img {
                max-width: 100%;
                max-height: 100vh;
              }
              @media print {
                body { background: white; }
                img { max-width: ${stripData.mode === 6 ? "4in" : stripData.mode === 4 ? "2in" : "2in"}; }
              }
            </style>
          </head>
          <body>
            <img src="${stripData.stripImage}" alt="PUFF SNAP Strip" />
            <script>
              window.onload = function() {
                window.print();
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Navigate to email scheduling screen with proper data structure
  const handleEmailClick = () => {
    navigate("/email-schedule", {
      state: {
        stripImage: stripData.stripImage,
        imageUrl: cloudinaryUrl || stripData.stripImage,
        qrCode: qrCodeUrl,
        mode: stripData.mode,
        frame: stripData.frame,
        hashtag: stripData.hashtag,
        customMessage: stripData.customMessage || '',
        onSchedule: (emailData: StripEmailData) => handleScheduleEmail(emailData),
      },
    });
  };

  const handleScheduleEmail = async (emailData: StripEmailData) => {
    try {
      const result = await sendStripEmail(emailData);
      
      if (!result.success) {
        throw new Error(`Failed to send to ${result.failed} recipient(s)`);
      }
      
      setEmailScheduled(true);
    } catch (error) {
      console.error("Failed to send email:", error);
      alert(error instanceof Error ? error.message : "Failed to send email");
    }
  };

  // Show email scheduling screen if enabled
  if (showEmailScheduling) {
    return (
      <EmailScheduling
        stripImage={stripData.stripImage}
        onScheduleEmail={handleScheduleEmail}
        onCancel={() => setShowEmailScheduling(false)}
      />
    );
  }

  return (
    <div className="min-h-[100dvh] halftone flex flex-col">
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack}
          className="comic-button flex items-center gap-1.5 bg-muted px-3 py-1.5 text-sm text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          BACK
        </button>
        <h2 className="font-display text-lg text-foreground">SHARE IT! 🚀</h2>
        <div className="w-16" />
      </div>

      {/* ── Body ── */}
      <div className="flex-1 flex flex-col items-center px-4 py-5 gap-4 max-w-md mx-auto w-full">

        {/* Strip preview — compact */}
        <div className="comic-card overflow-hidden bg-card p-2 inline-block">
          <img
            src={stripData.stripImage}
            alt="Your PUFF SNAP strip"
            className="max-h-[200px] sm:max-h-[280px] w-auto rounded-xl object-contain border-2 border-foreground"
          />
        </div>

        {/* Sharing options */}
        <div className="w-full space-y-3">
          {/* Download */}
          <button
            onClick={handleDownload}
            className="btn-primary-pop flex w-full items-center justify-center gap-3 text-xl"
          >
            {downloadSuccess ? (
              <>
                <CheckCircle className="h-7 w-7" />
                DOWNLOADED! ✅
              </>
            ) : (
              <>
                <Download className="h-7 w-7" />
                DOWNLOAD STRIP
              </>
            )}
          </button>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="btn-secondary-pop flex w-full items-center justify-center gap-3 text-xl"
          >
            <Printer className="h-7 w-7" />
            PRINT IT!
          </button>

          {/* Email */}
          <button
            onClick={() => setShowEmailScheduling(true)}
            className="btn-primary-pop flex w-full items-center justify-center gap-3 text-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            {emailScheduled ? (
              <>
                <CheckCircle className="h-7 w-7" />
                EMAIL SENT! ✅
              </>
            ) : (
              <>
                <Mail className="h-7 w-7" />
                SEND VIA EMAIL
              </>
            )}
          </button>

          {/* QR Code */}
          <button
            onClick={() => {
              if (!showQR) {
                // First time opening — upload to Cloudinary + generate QR
                generateQRCode();
              }
              setShowQR(!showQR);
            }}
            disabled={isGeneratingQR}
            className="comic-button flex w-full items-center justify-center gap-3 bg-accent text-accent-foreground text-xl px-6 py-4 disabled:opacity-60"
          >
            {isGeneratingQR ? (
              <>
                <QrCode className="h-7 w-7 animate-pulse" />
                UPLOADING… ☁️
              </>
            ) : (
              <>
                <QrCode className="h-7 w-7" />
                {showQR ? "HIDE QR" : "SCAN QR CODE"}
              </>
            )}
          </button>

          {/* QR Code Display */}
          {showQR && (
            <div className="comic-card bg-card flex flex-col items-center p-6 animate-scale-in">
              {isGeneratingQR ? (
                <div className="mb-4 h-48 w-48 rounded-2xl bg-muted p-4 border-4 border-foreground flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <QrCode className="h-12 w-12 text-muted-foreground animate-pulse" />
                    <span className="text-xs font-bold text-muted-foreground">Uploading to cloud…</span>
                  </div>
                </div>
              ) : uploadError ? (
                <div className="mb-4 flex flex-col items-center gap-3">
                  <div className="h-48 w-48 rounded-2xl bg-red-50 border-4 border-red-300 flex items-center justify-center p-4">
                    <div className="text-center">
                      <span className="text-4xl">😿</span>
                      <p className="text-sm font-bold text-red-500 mt-2">{uploadError}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setUploadError(null); generateQRCode(); }}
                    className="comic-button bg-accent text-accent-foreground px-4 py-2 text-sm"
                  >
                    🔄 TRY AGAIN
                  </button>
                </div>
              ) : qrCodeUrl ? (
                <div className="mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              ) : null}
              {qrCodeUrl && !uploadError && (
                <p className="text-center font-bold text-muted-foreground">
                  Scan with your phone to download! 📱
                </p>
              )}
            </div>
          )}

          {/* Done */}
          <button
            onClick={onFinish}
            className="comic-button w-full bg-muted py-3 text-center text-sm text-muted-foreground"
          >
            DONE — BACK TO START
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripSharingScreen;