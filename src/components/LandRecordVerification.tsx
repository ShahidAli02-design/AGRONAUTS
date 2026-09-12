import * as React from "react";
import { FileCheck2, ScanLine, ShieldCheck, Upload, XCircle, RotateCw } from "lucide-react";
import { doesNameMatchDocument, isValidSatbaraDocument, runDocumentOcr } from "@/lib/ocr";

export type LandVerificationStatus = "idle" | "scanning" | "verified" | "failed";
type FailReason = "type" | "name" | null;

interface LandRecordVerificationProps {
  lang: string;
  fullName: string;
  status: LandVerificationStatus;
  onStatusChange: (status: LandVerificationStatus) => void;
}

export function LandRecordVerification({ lang, fullName, status, onStatusChange }: LandRecordVerificationProps) {
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [failReason, setFailReason] = React.useState<FailReason>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    onStatusChange("scanning");
    setFailReason(null);
    setProgress(0);
    try {
      const text = await runDocumentOcr(file, (p) => {
        if (p.status === "recognizing text") {
          setProgress(Math.round(p.progress * 100));
        }
      });

      if (!isValidSatbaraDocument(text)) {
        setFailReason("type");
        onStatusChange("failed");
        return;
      }

      if (!doesNameMatchDocument(fullName, text)) {
        setFailReason("name");
        onStatusChange("failed");
        return;
      }

      onStatusChange("verified");
    } catch (err) {
      console.warn("OCR scan failed:", err);
      setFailReason("type");
      onStatusChange("failed");
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
  };

  const reset = () => {
    onStatusChange("idle");
    setFileName(null);
    setProgress(0);
    setFailReason(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          {lang === "mr" ? "सात-बारा उतारा (७/१२) पडताळणी *" : "7/12 (सात-बारा) Land Extract Verification *"}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {lang === "mr"
          ? "शेतजमीन असल्याचे सिद्ध करण्यासाठी आपल्या ७/१२ उताऱ्याचा स्पष्ट फोटो अपलोड करा. दस्तऐवजावरील नाव आपण टाकलेल्या पूर्ण नावाशी जुळणे आवश्यक आहे. आमची ऑफलाइन OCR प्रणाली दस्तऐवज स्वयंचलितपणे तपासेल."
          : "Upload a clear photo/scan of your 7/12 land extract. The name on the document must match the full name you entered above. Our on-device OCR engine scans it automatically — no data leaves your browser."}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onChange}
        className="hidden"
        id="satbara-upload"
      />

      {status === "idle" && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 p-4 text-center transition-colors"
        >
          <Upload className="mx-auto size-5 text-muted-foreground mb-1.5" />
          <span className="text-xs font-semibold text-foreground block">
            {lang === "mr" ? "फोटो अपलोड करण्यासाठी क्लिक करा" : "Click to upload 7/12 document photo"}
          </span>
          <span className="text-[10px] text-muted-foreground">JPG, PNG, WEBP</span>
        </button>
      )}

      {status === "scanning" && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center space-y-2">
          <ScanLine className="mx-auto size-5 text-primary animate-pulse" />
          <p className="text-xs font-semibold text-foreground">
            {lang === "mr" ? "दस्तऐवज स्कॅन होत आहे..." : "Scanning document..."} {progress}%
          </p>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{fileName}</p>
        </div>
      )}

      {status === "verified" && (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck2 className="size-4 shrink-0 text-emerald-600" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {lang === "mr" ? "जमीन दस्तऐवज पडताळणी यशस्वी" : "Land document verified"}
              </p>
              <p className="text-[10px] text-muted-foreground truncate">{fileName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={reset}
            className="shrink-0 text-[11px] font-semibold text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <RotateCw className="size-3" />
            {lang === "mr" ? "बदला" : "Change"}
          </button>
        </div>
      )}

      {status === "failed" && (
        <div className="space-y-2">
          <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <XCircle className="size-4 shrink-0 mt-0.5 text-destructive" />
            <div>
              <p className="text-xs font-bold text-destructive">
                {failReason === "name"
                  ? lang === "mr"
                    ? "दस्तऐवजावरील नाव आपण टाकलेल्या नावाशी जुळत नाही"
                    : "The name on this document doesn't match the name you entered"
                  : lang === "mr"
                  ? "हा वैध ७/१२ उतारा असल्याचे सिद्ध झाले नाही"
                  : "Could not confirm this is a valid 7/12 extract"}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {failReason === "name"
                  ? lang === "mr"
                    ? "कृपया आपले पूर्ण नाव तपासा किंवा स्वतःच्या मालकीचा दस्तऐवज अपलोड करा."
                    : "Please check your Full Name above, or upload a document that's actually in your name."
                  : lang === "mr"
                  ? "कृपया स्पष्ट, पूर्ण दस्तऐवजाचा फोटो पुन्हा अपलोड करा."
                  : "Please retake or upload a clearer, complete photo of the document."}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent"
          >
            {lang === "mr" ? "पुन्हा प्रयत्न करा" : "Try another photo"}
          </button>
        </div>
      )}
    </div>
  );
}
