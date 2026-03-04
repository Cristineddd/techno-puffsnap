import { useState } from "react";
import WelcomeScreen from "@/components/photobooth/WelcomeScreen";
import ModeSelectionScreen, { PhotoMode } from "@/components/photobooth/ModeSelectionScreen";
import CameraSetupScreen from "@/components/photobooth/CameraSetupScreen";
import MultiCameraScreen from "@/components/photobooth/MultiCameraScreen";
import StripCustomizationScreen, { StripData } from "@/components/photobooth/StripCustomizationScreen";
import StripSharingScreen from "@/components/photobooth/StripSharingScreen";
import ThankYouScreen from "@/components/photobooth/ThankYouScreen";

type Screen = "welcome" | "mode" | "setup" | "camera" | "customize" | "share" | "thankyou";

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [selectedMode, setSelectedMode] = useState<PhotoMode>(3);
  const [cameraSettings, setCameraSettings] = useState<{ timer: number; orientation: "landscape" | "portrait" }>({ timer: 3, orientation: "landscape" });
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stripData, setStripData] = useState<StripData | null>(null);

  const handleModeSelect = (mode: PhotoMode) => {
    setSelectedMode(mode);
    setCurrentScreen("setup");
  };

  const handleCameraSetup = (settings: { timer: number; orientation: "landscape" | "portrait" }) => {
    setCameraSettings(settings);
    setCurrentScreen("camera");
  };

  const handlePhotosComplete = (images: string[]) => {
    setCapturedImages(images);
    setCurrentScreen("customize");
  };

  const handleCustomizationComplete = (data: StripData) => {
    setStripData(data);
    setCurrentScreen("share");
  };

  const handleRestart = () => {
    setCapturedImages([]);
    setStripData(null);
    setCameraSettings({ timer: 3, orientation: "landscape" });
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
          onComplete={handlePhotosComplete}
          onBack={() => setCurrentScreen("setup")}
        />
      )}
      
      {currentScreen === "customize" && capturedImages.length > 0 && (
        <StripCustomizationScreen
          images={capturedImages}
          mode={selectedMode}
          orientation={cameraSettings.orientation}
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
