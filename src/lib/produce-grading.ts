// On-device visual measurements of a produce photo. These are sent with every
// grading request: the server uses them to cross-check Gemini's answer and as
// the basis of the grade when the AI model is unavailable, so the result
// always reflects the actual photo instead of a canned sample.

export interface LocalProduceMetrics {
  sizeUniformity: number; // 0-100, higher = more uniform piece sizes
  colorVibrancy: number; // 0-100
  surfaceDefects: number; // % of produce surface that looks bruised / rotten
  firmnessIndex: number; // 0-100 freshness proxy
  produceCoverage: number; // % of the frame that looks like produce
  overallScore: number; // 0-100
  // Set when the photo clearly shows something that isn't produce (a person,
  // a laptop, ...). Such photos are "not for sale" and never get a grade.
  nonProduceSubject?: string;
  // Produce the object model recognised (apple, banana, orange, broccoli, carrot).
  detectedProduce?: string;
}

// COCO classes the detector knows that are produce, or that commonly appear
// next to produce (crates, bowls, tables) and must not trigger a rejection.
const PRODUCE_LABELS = new Set(["banana", "apple", "orange", "broccoli", "carrot"]);
const NEUTRAL_LABELS = new Set(["bowl", "dining table", "bed", "couch", "chair", "bench", "cup", "potted plant", "bottle", "vase", "knife", "spoon", "fork"]);

type Detectors = {
  objects: import("@mediapipe/tasks-vision").ObjectDetector;
  faces: import("@mediapipe/tasks-vision").FaceDetector;
};
let detectorsPromise: Promise<Detectors | null> | null = null;

// MediaPipe object + face detectors; wasm and models are served by our own
// server (server.ts, public/models) so this works without third-party CDNs.
function getDetectors(): Promise<Detectors | null> {
  if (!detectorsPromise) {
    detectorsPromise = (async () => {
      const { FilesetResolver, ObjectDetector, FaceDetector } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(`${window.location.origin}/mediapipe/wasm`);
      const [objects, faces] = await Promise.all([
        ObjectDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: "/models/efficientdet_lite0.tflite" },
          runningMode: "IMAGE",
          scoreThreshold: 0.35,
          maxResults: 10,
        }),
        FaceDetector.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: "/models/blaze_face_short_range.tflite" },
          runningMode: "IMAGE",
          minDetectionConfidence: 0.6,
        }),
      ]);
      return { objects, faces };
    })().catch((err) => {
      console.warn("Object/face detector unavailable:", err);
      detectorsPromise = null;
      return null;
    });
  }
  return detectorsPromise;
}

type Subject = { nonProduce?: string; produceLabel?: string };

// Decides whether a photo clearly shows something other than produce.
// Deliberately conservative: round red/orange fruit can look face-like to the
// face model (apples score ~0.6), so a face only counts when it is a
// confident, real face AND the object model sees no produce in the frame.
async function detectSubject(img: HTMLImageElement, produceCoverage: number): Promise<Subject> {
  const detectors = await getDetectors();
  if (!detectors) return {};
  const imgArea = img.naturalWidth * img.naturalHeight || 1;
  const areaPct = (box?: { width: number; height: number }) => (box ? (box.width * box.height * 100) / imgArea : 0);

  const objects = detectors.objects.detect(img).detections.map((d) => ({
    label: d.categories[0]?.categoryName ?? "",
    score: d.categories[0]?.score ?? 0,
    area: areaPct(d.boundingBox),
  }));
  const produce = objects.filter((o) => PRODUCE_LABELS.has(o.label) && o.score >= 0.35);
  const produceArea = produce.reduce((s, o) => s + o.area, 0);
  const produceLabel = produce.sort((a, b) => b.score - a.score)[0]?.label;
  if (produce.length) return { produceLabel };

  const person = objects.find((o) => o.label === "person" && o.score >= 0.6 && o.area >= 15);
  const faces = detectors.faces.detect(img).detections.filter(
    (d) => (d.categories[0]?.score ?? 0) >= 0.85 && areaPct(d.boundingBox) >= 2
  );
  // A selfie: a confident face together with a person, or a person filling the frame.
  if ((person && faces.length) || (person && person.area >= 40 && produceArea === 0)) return { nonProduce: "person" };

  const dominant = objects.find(
    (o) => !PRODUCE_LABELS.has(o.label) && !NEUTRAL_LABELS.has(o.label) && o.label !== "person" && o.score >= 0.6 && o.area >= 30
  );
  if (dominant && produceCoverage < 30) return { nonProduce: dominant.label };
  return {};
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image"));
    img.src = src;
  });
}

function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : d / max, max];
}

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

export async function measureProduceImage(imageSrc: string): Promise<LocalProduceMetrics | null> {
  try {
    const img = await loadImage(imageSrc);
    const size = 192;
    const scale = Math.min(1, size / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.max(1, Math.round(img.naturalWidth * scale));
    const h = Math.max(1, Math.round(img.naturalHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    const { data } = ctx.getImageData(0, 0, w, h);

    const total = w * h;
    const mask = new Uint8Array(total); // 1 = healthy produce, 2 = blemish on produce
    const hsv = new Float32Array(total * 3);

    // Pass 1: classify each pixel.
    for (let i = 0; i < total; i++) {
      const [hue, s, v] = rgbToHsv(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]);
      hsv[i * 3] = hue;
      hsv[i * 3 + 1] = s;
      hsv[i * 3 + 2] = v;
      const deepRed = hue < 12 || hue > 335; // dark side of red fruit, not rot
      const isDarkSpot = v < 0.2 && s > 0.15 && !(deepRed && s > 0.5);
      const isBrown = !deepRed && hue >= 15 && hue <= 45 && s > 0.3 && s < 0.85 && v > 0.12 && v < 0.45;
      if (isDarkSpot || isBrown) mask[i] = 2;
      else if (s > 0.22 && v > 0.18) mask[i] = 1;
    }

    // Pass 2: a blemish must lie inside the fruit. Dark pixels that touch the
    // background are shadows between pieces or at the edges, not rot.
    const R = 3;
    for (let i = 0; i < total; i++) {
      if (mask[i] !== 2) continue;
      const x = i % w;
      const y = (i - x) / w;
      let bg = 0;
      let n = 0;
      for (let dy = -R; dy <= R; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          n++;
          if (mask[yy * w + xx] === 0) bg++;
        }
      }
      if (bg / n > 0.2) mask[i] = 3; // shadow / edge: ignore
    }

    let produce = 0;
    let defects = 0;
    let satSum = 0;
    let valSum = 0;
    let hueX = 0;
    let hueY = 0;
    for (let i = 0; i < total; i++) {
      if (mask[i] === 3) mask[i] = 0;
      if (mask[i] === 2) {
        produce++;
        defects++;
      } else if (mask[i] === 1) {
        produce++;
        const hue = hsv[i * 3];
        satSum += hsv[i * 3 + 1];
        valSum += hsv[i * 3 + 2];
        hueX += Math.cos((hue * Math.PI) / 180);
        hueY += Math.sin((hue * Math.PI) / 180);
      }
    }

    const healthy = Math.max(1, produce - defects);
    const produceCoverage = (produce / total) * 100;
    const meanSat = satSum / healthy;
    const meanVal = valSum / healthy;
    // Circular hue concentration: 1 = one consistent colour across the lot.
    const hueConsistency = Math.sqrt(hueX * hueX + hueY * hueY) / healthy;

    // Piece-size uniformity from connected produce blobs.
    const seen = new Uint8Array(total);
    const areas: number[] = [];
    const stack: number[] = [];
    for (let i = 0; i < total; i++) {
      if (!mask[i] || seen[i]) continue;
      let area = 0;
      let touchesEdge = false;
      stack.push(i);
      seen[i] = 1;
      while (stack.length) {
        const p = stack.pop()!;
        area++;
        const x = p % w;
        const y = (p - x) / w;
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) touchesEdge = true;
        const neighbours = [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1];
        for (const n of neighbours) {
          if (n >= 0 && mask[n] && !seen[n]) {
            seen[n] = 1;
            stack.push(n);
          }
        }
      }
      // Pieces cut off by the photo edge look smaller than they are — skip them.
      if (area >= total * 0.004 && !touchesEdge) areas.push(area);
    }
    let sizeUniformity = 85;
    if (areas.length >= 2) {
      const mean = areas.reduce((a, b) => a + b, 0) / areas.length;
      const sd = Math.sqrt(areas.reduce((a, b) => a + (b - mean) ** 2, 0) / areas.length);
      sizeUniformity = clamp(100 - (sd / mean) * 45, 40, 98);
    }

    const surfaceDefects = clamp((defects / Math.max(1, produce)) * 100);
    const colorVibrancy = clamp(meanSat * 85 + meanVal * 25 + hueConsistency * 10 - 10);
    const firmnessIndex = clamp(meanVal * 60 + meanSat * 30 + 20 - surfaceDefects * 0.8);
    const overallScore = clamp(
      sizeUniformity * 0.2 + colorVibrancy * 0.3 + clamp(100 - surfaceDefects * 3) * 0.35 + firmnessIndex * 0.15
    );

    const subject = await detectSubject(img, produceCoverage).catch((): Subject => ({}));

    return {
      nonProduceSubject: subject.nonProduce,
      detectedProduce: subject.produceLabel,
      sizeUniformity: Math.round(sizeUniformity),
      colorVibrancy: Math.round(colorVibrancy),
      surfaceDefects: Math.round(surfaceDefects),
      firmnessIndex: Math.round(firmnessIndex),
      produceCoverage: Math.round(produceCoverage),
      overallScore: Math.round(overallScore),
    };
  } catch (err) {
    console.warn("Local produce image analysis failed:", err);
    return null;
  }
}
