import { useState } from "react";
import WelcomeScreen from "@/components/photobooth/WelcomeScreen";
import ModeSelectionScreen, { PhotoMode, StripLayoutType } from "@/components/photobooth/ModeSelectionScreen";
import CameraSetupScreen from "@/components/photobooth/CameraSetupScreen";
import MultiCameraScreen from "@/components/photobooth/MultiCameraScreen";
import PhotoReviewScreen from "@/components/photobooth/PhotoReviewScreen";
import StripCustomizationScreen, { StripData } from "@/components/photobooth/StripCustomizationScreen";
import StripSharingScreen from "@/components/photobooth/StripSharingScreen";
import ThankYouScreen from "@/components/photobooth/ThankYouScreen";

type Screen = "welcome" | "mode" | "setup" | "camera" | "review" | "customize" | "share" | "thankyou";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedMode, setSelectedMode] = useState<PhotoMode>(3);
  const [cameraSettings, setCameraSettings] = useState<{
    timer: number;
    orientation: "landscape" | "portrait";
    layoutType: StripLayoutType;
    printSize: string;
  }>({ timer: 3, orientation: "landscape", layoutType: "classic-strip", printSize: "2x6" });
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [retakeIndices, setRetakeIndices] = useState<number[] | undefined>(undefined);
  const [stripData, setStripData] = useState<StripData | null>(null);

  const handleModeSelect = (mode: PhotoMode) => {
    setSelectedMode(mode);
    setCurrentScreen("setup");
  };

  const handleCameraSetup = (settings: { timer: number; orientation: "landscape" | "portrait"; layoutType: StripLayoutType; printSize: string }) => {
    setCameraSettings(settings);
    setCurrentScreen("camera");
  };

  const handlePhotosComplete = (images: string[]) => {
    setCapturedImages(images);
    setCurrentScreen("review"); // → review muna bago customize
  };

  const handleCustomizationComplete = (data: StripData) => {
    setStripData(data);
    setCurrentScreen("share");
  };

  const handleRestart = () => {
    setCapturedImages([]);
    setStripData(null);
    setCameraSettings({ timer: 3, orientation: "landscape", layoutType: "classic-strip", printSize: "2x6" });
    setCurrentScreen("welcome");
  };

  return (
    <div className="min-h-screen">
      {currentScreen === "welcome" && (
        <WelcomeScreen 
          onStart={() => setCurrentScreen("mode")}
        />
      )}
      
      {currentScreen === "mode" && (
        <ModeSelectionScreen
          onSelectMode={handleModeSelect}
          onBack={() => setCurrentScreen("welcome")}
        />
      )}
      
      {currentScreen === "setup" && (
        <CameraSetupScreen
          mode={selectedMode}
          onBack={() => setCurrentScreen("mode")}
          onNext={handleCameraSetup}
        />
      )}
      
      {currentScreen === "camera" && (
        <MultiCameraScreen
          mode={selectedMode}
          timer={cameraSettings.timer}
          existingImages={retakeIndices ? capturedImages : undefined}
          retakeIndices={retakeIndices}
          onComplete={(images) => {
            setCapturedImages(images);
            setRetakeIndices(undefined);
            setCurrentScreen("review");
          }}
          onBack={() => {
            setRetakeIndices(undefined);
            setCurrentScreen(capturedImages.length > 0 ? "review" : "setup");
          }}
        />
      )}

      {currentScreen === "review" && capturedImages.length > 0 && (
        <PhotoReviewScreen
          images={capturedImages}
          onProceed={() => setCurrentScreen("customize")}
          onRetakeAll={() => {
            setCapturedImages([]);
            setRetakeIndices(undefined);
            setCurrentScreen("camera");
          }}
          onRetakeSelected={(indices) => {
            setRetakeIndices(indices);
            setCurrentScreen("camera");
          }}
        />
      )}

      {currentScreen === "customize" && capturedImages.length > 0 && (
        <StripCustomizationScreen
          images={capturedImages}
          mode={selectedMode}
          orientation={cameraSettings.orientation}
          layoutType={cameraSettings.layoutType}
          onComplete={handleCustomizationComplete}
          onRetake={() => setCurrentScreen("camera")}
        />
      )}
      
      {currentScreen === "share" && stripData && (
        <StripSharingScreen
          stripData={stripData}
          onBack={() => setCurrentScreen("customize")}
          onFinish={() => setCurrentScreen("thankyou")}
        />
      )}
      
      {currentScreen === "thankyou" && (
        <ThankYouScreen onRestart={handleRestart} />
      )}
    </div>
  );
};

export default Index;
