import * as React from "react";
import { Camera, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProduceCameraCaptureProps {
  capturedImage: string | null;
  onCapture: (dataUrl: string) => void;
  onClear: () => void;
  lang?: string;
}

export function ProduceCameraCapture({ capturedImage, onCapture, onClear, lang }: ProduceCameraCaptureProps) {
  const [mode, setMode] = React.useState<"camera" | "upload">("camera");
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);

  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const startCamera = React.useCallback(async () => {
    setCameraError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraError(
          lang === "mr"
            ? "कॅमेरा उपलब्ध नाही. कृपया फोटो अपलोड करा."
            : "Camera isn't available here. Please use photo upload instead."
        );
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
      }
    } catch (err) {
      console.warn("Camera init error:", err);
      setCameraError(
        lang === "mr"
          ? "कॅमेरा सुरू करता आला नाही. कृपया परवानगी द्या किंवा फोटो अपलोड करा."
          : "Couldn't access the camera. Grant permission or use photo upload instead."
      );
      setIsCameraActive(false);
    }
  }, [lang]);

  React.useEffect(() => {
    if (mode === "camera" && !capturedImage) {
      void startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, capturedImage]);

  const captureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      onCapture(canvas.toDataURL("image/jpeg", 0.9));
      stopCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onCapture(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-2.5">
      <canvas ref={canvasRef} className="hidden" />
      <div className="flex rounded-lg border border-border bg-background p-0.5 text-[11px] font-semibold w-fit">
        <button
          type="button"
          onClick={() => setMode("camera")}
          className={`px-2.5 py-1 rounded-md transition-all ${mode === "camera" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {lang === "mr" ? "कॅमेरा" : "Live Camera"}
        </button>
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`px-2.5 py-1 rounded-md transition-all ${mode === "upload" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          {lang === "mr" ? "अपलोड" : "Upload"}
        </button>
      </div>

      {capturedImage ? (
        <div className="space-y-2">
          <div className="relative aspect-4/3 w-full max-w-sm overflow-hidden rounded-xl border-2 border-primary/50 bg-black">
            <img src={capturedImage} alt="Captured produce" className="size-full object-cover" />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={onClear} className="h-8 text-xs font-semibold gap-1.5">
            <Trash2 className="size-3.5" />
            {lang === "mr" ? "फोटो काढा" : "Remove photo"}
          </Button>
        </div>
      ) : mode === "camera" ? (
        <div className="space-y-2">
          <div className="relative aspect-4/3 w-full max-w-sm overflow-hidden rounded-xl border-2 border-dashed border-primary/50 bg-black flex items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="size-full object-cover" />
            {cameraError && (
              <div className="absolute inset-0 bg-background/95 p-3 flex flex-col items-center justify-center text-center gap-2">
                <p className="text-xs font-semibold text-foreground">{cameraError}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => void startCamera()} className="h-7 text-xs">
                    Retry
                  </Button>
                  <Button size="sm" onClick={() => setMode("upload")} className="h-7 text-xs">
                    Switch to Upload
                  </Button>
                </div>
              </div>
            )}
          </div>
          <Button
            type="button"
            onClick={captureSnapshot}
            disabled={!isCameraActive}
            className="h-10 rounded-full gap-2 text-xs font-bold"
          >
            <Camera className="size-4" />
            {lang === "mr" ? "फोटो कॅप्चर करा" : "Capture Produce Photo"}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-sm rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 p-6 text-center cursor-pointer transition-colors"
          >
            <Upload className="mx-auto size-6 text-muted-foreground mb-1.5" />
            <p className="text-xs font-semibold text-foreground">
              {lang === "mr" ? "फोटो अपलोड करण्यासाठी क्लिक करा" : "Click to upload a produce photo"}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">JPG, PNG, WEBP</p>
          </div>
        </div>
      )}
    </div>
  );
}
