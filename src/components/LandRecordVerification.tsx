import * as React from "react";
import { FileCheck2, ScanLine, ShieldCheck, Upload, XCircle, RotateCw } from "lucide-react";
import { OcrInputError, isValidSatbaraDocument, matchNameOnDocument, runDocumentOcr } from "@/lib/ocr";

export type LandVerificationStatus = "idle" | "scanning" | "verified" | "failed";
type FailReason = "type" | "name" | "read" | null;

interface LandRecordVerificationProps {
  lang: string;
  fullName: string;
  status: LandVerificationStatus;
  onStatusChange: (status: LandVerificationStatus) => void;
}

// The name must have at least a first name and a surname so it can be matched
// against the landholder name printed on the 7/12.
export function hasFullNameForLandCheck(fullName: string): boolean {
  return fullName.trim().split(/\s+/).filter((w) => w.length >= 2).length >= 2;
}

export function LandRecordVerification({ lang, fullName, status, onStatusChange }: LandRecordVerificationProps) {
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [phase, setPhase] = React.useState<"loading" | "reading">("loading");
  const [failReason, setFailReason] = React.useState<FailReason>(null);
  const [ocrText, setOcrText] = React.useState<string | null>(null);
  const [missingTokens, setMissingTokens] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const L = (en: string, mr: string, hi: string) => (lang === "mr" ? mr : lang === "hi" ? hi : en);
  const nameReady = hasFullNameForLandCheck(fullName);

  // Re-check the scanned document whenever the typed name changes, so editing
  // the name after a successful scan can't keep a stale "verified" state.
  React.useEffect(() => {
    if (ocrText === null) return;
    if (!isValidSatbaraDocument(ocrText)) {
      setFailReason("type");
      onStatusChange("failed");
      return;
    }
    const result = nameReady ? matchNameOnDocument(fullName, ocrText) : null;
    if (result?.matched) {
      setFailReason(null);
      setMissingTokens([]);
      onStatusChange("verified");
    } else {
      setFailReason("name");
      setMissingTokens(result?.missingTokens ?? []);
      onStatusChange("failed");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ocrText, fullName, nameReady]);

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setOcrText(null);
    setFailReason(null);
    setMissingTokens([]);
    setProgress(0);
    setPhase("loading");
    onStatusChange("scanning");
    try {
      const text = await runDocumentOcr(file, (p) => {
        if (p.status === "recognizing text") {
          setPhase("reading");
          setProgress(Math.round(p.progress * 100));
        } else {
          setPhase("loading");
        }
      });
      setOcrText(text);
    } catch (err) {
      console.warn("OCR scan failed:", err);
      setFailReason(err instanceof OcrInputError ? "type" : "read");
      onStatusChange("failed");
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) void handleFile(file);
    e.target.value = "";
  };

  const reset = () => {
    onStatusChange("idle");
    setFileName(null);
    setOcrText(null);
    setProgress(0);
    setFailReason(null);
    setMissingTokens([]);
  };

  const failTitle =
    failReason === "name"
      ? nameReady
        ? L(
            "The name on this 7/12 doesn't match the name you entered",
            "७/१२ वरील नाव आपण टाकलेल्या नावाशी जुळत नाही",
            "7/12 पर लिखा नाम आपके दर्ज किए गए नाम से मेल नहीं खाता"
          )
        : L(
            "Enter your full name (first name and surname) as printed on the 7/12",
            "७/१२ वर छापल्याप्रमाणे आपले पूर्ण नाव (नाव व आडनाव) टाका",
            "7/12 पर छपे अनुसार अपना पूरा नाम (नाम और उपनाम) दर्ज करें"
          )
      : failReason === "read"
      ? L(
          "Could not run the document scanner",
          "दस्तऐवज स्कॅनर सुरू करता आला नाही",
          "दस्तावेज़ स्कैनर शुरू नहीं हो सका"
        )
      : L(
          "Could not confirm this is a valid 7/12 extract",
          "हा वैध ७/१२ उतारा असल्याचे सिद्ध झाले नाही",
          "यह वैध 7/12 उतारा होने की पुष्टि नहीं हो सकी"
        );

  const failHint =
    failReason === "name"
      ? nameReady
        ? L(
            `Not found on the document: ${missingTokens.join(", ") || fullName}. Check the spelling of your Full Name above, or upload a 7/12 that's in your name.`,
            `दस्तऐवजावर आढळले नाही: ${missingTokens.join(", ") || fullName}. वरील पूर्ण नावाचे स्पेलिंग तपासा किंवा आपल्या नावावरील ७/१२ अपलोड करा.`,
            `दस्तावेज़ पर नहीं मिला: ${missingTokens.join(", ") || fullName}. ऊपर पूरे नाम की वर्तनी जांचें या अपने नाम का 7/12 अपलोड करें।`
          )
        : L(
            "Your name is checked against the landholder name on the document.",
            "आपले नाव दस्तऐवजावरील खातेदाराच्या नावाशी तपासले जाते.",
            "आपका नाम दस्तावेज़ पर भूधारक के नाम से जांचा जाता है।"
          )
      : failReason === "read"
      ? L(
          "Check your internet connection and try again.",
          "इंटरनेट कनेक्शन तपासा आणि पुन्हा प्रयत्न करा.",
          "इंटरनेट कनेक्शन जांचें और फिर से प्रयास करें।"
        )
      : L(
          "Please upload a clearer, complete photo or the PDF of the 7/12.",
          "कृपया ७/१२ चा स्पष्ट, पूर्ण फोटो किंवा PDF पुन्हा अपलोड करा.",
          "कृपया 7/12 की साफ़, पूरी फ़ोटो या PDF फिर से अपलोड करें।"
        );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <ShieldCheck className="size-3.5 text-primary" />
          {L("7/12 (सात-बारा) Land Extract Verification *", "सात-बारा उतारा (७/१२) पडताळणी *", "7/12 (सात-बारा) भूमि अभिलेख सत्यापन *")}
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        {L(
          "Upload a clear photo/scan or the PDF of your 7/12 land extract. The landholder name on the document must match the full name you entered above. The scan runs in your browser — no data leaves your device.",
          "शेतजमीन असल्याचे सिद्ध करण्यासाठी आपल्या ७/१२ उताऱ्याचा स्पष्ट फोटो किंवा PDF अपलोड करा. दस्तऐवजावरील खातेदाराचे नाव आपण टाकलेल्या पूर्ण नावाशी जुळणे आवश्यक आहे.",
          "अपने 7/12 भूमि उतारे की साफ़ फ़ोटो या PDF अपलोड करें। दस्तावेज़ पर भूधारक का नाम ऊपर दर्ज किए गए पूरे नाम से मेल खाना चाहिए।"
        )}
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,application/pdf,.pdf"
        onChange={onChange}
        className="hidden"
        id="satbara-upload"
      />

      {status === "idle" && (
        <>
          <button
            type="button"
            disabled={!nameReady}
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/30 p-4 text-center transition-colors disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-border"
          >
            <Upload className="mx-auto size-5 text-muted-foreground mb-1.5" />
            <span className="text-xs font-semibold text-foreground block">
              {L("Click to upload 7/12 document", "७/१२ दस्तऐवज अपलोड करण्यासाठी क्लिक करा", "7/12 दस्तावेज़ अपलोड करने के लिए क्लिक करें")}
            </span>
            <span className="text-[10px] text-muted-foreground">JPG, PNG, WEBP, PDF</span>
          </button>
          {!nameReady && (
            <p className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
              {L(
                "First enter your full name (first name and surname) exactly as it appears on your 7/12.",
                "आधी आपले पूर्ण नाव (नाव व आडनाव) ७/१२ वर आहे तसेच टाका.",
                "पहले अपना पूरा नाम (नाम और उपनाम) ठीक वैसे ही दर्ज करें जैसा 7/12 पर है।"
              )}
            </p>
          )}
        </>
      )}

      {status === "scanning" && (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 text-center space-y-2">
          <ScanLine className="mx-auto size-5 text-primary animate-pulse" />
          <p className="text-xs font-semibold text-foreground">
            {phase === "loading"
              ? L("Loading OCR engine (first time can take ~30s)...", "OCR इंजिन लोड होत आहे (पहिल्यांदा ~३० सेकंद)...", "OCR इंजन लोड हो रहा है (पहली बार ~30 सेकंड)...")
              : `${L("Scanning document...", "दस्तऐवज स्कॅन होत आहे...", "दस्तावेज़ स्कैन हो रहा है...")} ${progress}%`}
          </p>
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${phase === "loading" ? 5 : progress}%` }} />
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
                {L("Land document verified — name matches", "जमीन दस्तऐवज पडताळणी यशस्वी — नाव जुळले", "भूमि दस्तावेज़ सत्यापित — नाम मेल खाता है")}
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
            {L("Change", "बदला", "बदलें")}
          </button>
        </div>
      )}

      {status === "failed" && (
        <div className="space-y-2">
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
            <XCircle className="size-4 shrink-0 mt-0.5 text-destructive" />
            <div>
              <p className="text-xs font-bold text-destructive">{failTitle}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{failHint}</p>
            </div>
          </div>
          <button
            type="button"
            disabled={!nameReady}
            onClick={() => inputRef.current?.click()}
            className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-accent disabled:opacity-60"
          >
            {L("Upload another document", "दुसरा दस्तऐवज अपलोड करा", "दूसरा दस्तावेज़ अपलोड करें")}
          </button>
        </div>
      )}
    </div>
  );
}
