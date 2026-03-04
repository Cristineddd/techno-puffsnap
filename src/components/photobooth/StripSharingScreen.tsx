import { Download, QrCode, Facebook, Instagram, Twitter, ArrowLeft, CheckCircle, Printer, Star, Zap, Smartphone, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import QRCodeLib from 'qrcode';
import { StripData } from "./StripCustomizationScreen";
import EmailScheduling from "./EmailScheduling";
import { EmailService } from "../../lib/emailServiceReal";

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

  // Cloudinary config - replace with your actual values
  const CLOUDINARY_CLOUD_NAME = 'dopc9l096'; // Your cloud name
  const CLOUDINARY_UPLOAD_PRESET = 'puffsnap_uploads'; // Your upload preset

  // Generate QR code when component mounts
  useEffect(() => {
    generateQRCode();
  }, [stripData.stripImage]);

  const uploadToCloudinary = async (imageDataUrl: string): Promise<string> => {
    const formData = new FormData();
    
    // Convert data URL to blob
    const response = await fetch(imageDataUrl);
    const blob = await response.blob();
    
    formData.append('file', blob);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'puffsnap-strips');
    
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!uploadResponse.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await uploadResponse.json();
    return data.secure_url;
  };

  const generateQRCode = async () => {
    try {
      setIsGeneratingQR(true);
      
      // Try to upload to Cloudinary first
      let qrData = stripData.stripImage;
      
      try {
        const cloudinaryUrl = await uploadToCloudinary(stripData.stripImage);
        qrData = cloudinaryUrl;
        console.log('Image uploaded to Cloudinary:', cloudinaryUrl);
      } catch (uploadError) {
        console.warn('Cloudinary upload failed, using data URL:', uploadError);
        // Fallback to data URL if Cloudinary fails
      }
      
      const qrCode = await QRCodeLib.toDataURL(qrData, {
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
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleDownload = () => {
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
                img { max-width: ${stripData.mode === 6 ? "4in" : "2in"}; }
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

  const handleShare = (platform: string) => {
    console.log(`Sharing to ${platform}`);
    onFinish();
  };

  const handleScheduleEmail = async (emailData: any) => {
    try {
      console.log('🚀 REAL EMAIL SENDING with EmailJS!');
      console.log('📧 Email data:', emailData);
      console.log('📸 Strip data:', stripData);
      
      const stripEmailData = {
        stripImage: stripData.stripImage,
        stripData: {
          mode: stripData.mode,
          frame: stripData.frame,
          hashtag: stripData.hashtag,
          customMessage: stripData.customMessage || ''
        }
      };
      
      // Use real EmailJS service
      const result = await EmailService.scheduleEmail(emailData, stripEmailData);
      
      if (result.success) {
        setEmailScheduled(true);
        setShowEmailScheduling(false);
        
        alert(`✅ EMAIL SENT SUCCESSFULLY!\n\n📧 Sent to: ${emailData.contacts.map((c: any) => c.email).join(', ')}\n📅 Scheduled for: ${new Date(`${emailData.scheduledDate}T${emailData.scheduledTime}`).toLocaleString()}\n\n🎉 Check your inbox (and spam folder) in a few minutes!`);
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error) {
      console.error('❌ Email sending failed:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('not configured')) {
        alert(`⚙️ EMAIL NOT CONFIGURED\n\n${errorMessage}\n\n📋 Setup steps:\n1. Go to emailjs.com\n2. Create account & service\n3. Add credentials to .env.local\n\nFor now, this is a demo simulation.`);
        
        // Fallback to simulation
        setEmailScheduled(true);
        setShowEmailScheduling(false);
      } else {
        alert(`❌ EMAIL SENDING FAILED\n\n${errorMessage}\n\n🔄 Please check your EmailJS configuration or try again later.`);
      }
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
    <div className="min-h-screen px-4 py-8 halftone">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={onBack}
            className="comic-button flex items-center gap-2 bg-muted px-4 py-2 text-muted-foreground"
          >
            <ArrowLeft className="h-5 w-5" />
            BACK
          </button>
          <h2 className="font-display text-2xl text-foreground">SHARE IT! 🚀</h2>
          <div className="w-20" />
        </div>

        {/* Strip preview */}
        <div className="mb-8 flex justify-center">
          <div className="comic-card-lg overflow-hidden bg-card p-4">
            <img
              src={stripData.stripImage}
              alt="Your PUFF SNAP strip"
              className="max-h-[400px] w-auto rounded-2xl object-contain border-4 border-foreground"
            />
          </div>
        </div>

        {/* Sharing options */}
        <div className="space-y-4">
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

          {/* Email Scheduling */}
          <button
            onClick={() => setShowEmailScheduling(true)}
            className="btn-primary-pop flex w-full items-center justify-center gap-3 text-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
          >
            {emailScheduled ? (
              <>
                <CheckCircle className="h-7 w-7" />
                EMAIL SCHEDULED! ✅
              </>
            ) : (
              <>
                <Mail className="h-7 w-7" />
                📧 SCHEDULE EMAIL
              </>
            )}
          </button>

          {/* QR Code */}
          <button
            onClick={() => setShowQR(!showQR)}
            className="comic-button flex w-full items-center justify-center gap-3 bg-accent text-accent-foreground text-xl px-6 py-4"
          >
            <QrCode className="h-7 w-7" />
            {showQR ? "HIDE QR" : "SCAN QR CODE"}
          </button>

          {/* QR Code Display */}
          {showQR && (
            <div className="comic-card bg-card flex flex-col items-center p-6 animate-scale-in">
              {qrCodeUrl ? (
                <div className="mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48" />
                  </div>
                </div>
              ) : (
                <div className="mb-4 h-48 w-48 rounded-2xl bg-foreground p-4 border-4 border-foreground animate-pulse">
                  <div className="flex h-full w-full items-center justify-center">
                    <QrCode className="h-12 w-12 text-card" />
                  </div>
                </div>
              )}
              <p className="text-center font-bold text-muted-foreground">
                {isGeneratingQR ? 'Generating QR code...' : 'Scan with your phone to download!'} 📱
              </p>
              {!qrCodeUrl && !isGeneratingQR && (
                <p className="text-xs text-center text-muted-foreground mt-2">
                  Note: Setup Cloudinary for better QR scanning
                </p>
              )}
            </div>
          )}

          {/* Social sharing */}
          <div className="comic-card bg-card p-6">
            <h3 className="mb-4 text-center font-display text-xl text-primary">
              SHARE ON SOCIALS! 📲
            </h3>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleShare("facebook")}
                className="comic-card flex h-16 w-16 items-center justify-center bg-[#1877F2] transition-transform hover:scale-105"
              >
                <Facebook className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={() => handleShare("instagram")}
                className="comic-card flex h-16 w-16 items-center justify-center bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] transition-transform hover:scale-105"
              >
                <Instagram className="h-8 w-8 text-white" />
              </button>
              <button
                onClick={() => handleShare("twitter")}
                className="comic-card flex h-16 w-16 items-center justify-center bg-foreground transition-transform hover:scale-105"
              >
                <Twitter className="h-8 w-8 text-card" />
              </button>
            </div>
          </div>

          {/* Skip button */}
          <button
            onClick={onFinish}
            className="comic-button w-full bg-muted py-3 text-center text-muted-foreground"
          >
            SKIP FOR NOW
          </button>
        </div>
      </div>
    </div>
  );
};

export default StripSharingScreen;
