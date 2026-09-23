import { GoogleGenAI } from '@google/genai';
import {
  DiseaseDetectionResult,
  QualityReport,
  BestUtilizationDecision,
  ProduceGrade
} from './types';

let genAI: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
    try {
      genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    } catch (e) {
      console.warn('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return genAI;
}

// Clean base64 data string
function extractBase64(dataUrl: string): { mimeType: string; data: string } {
  if (dataUrl.startsWith('data:')) {
    const matches = dataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      return { mimeType: matches[1], data: matches[2] };
    }
  }
  return { mimeType: 'image/jpeg', data: dataUrl };
}

// Overridable so a deployment can move to a newer model without a code change.
const PRIMARY_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || 'gemini-2.5-flash-lite';

// Tries the newest model first; on any failure (e.g. transient 503 overload),
// retries once against the stable model before giving up to the caller's fallback data.
async function generateWithFallback(
  ai: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>
) {
  try {
    return await ai.models.generateContent({ ...params, model: PRIMARY_MODEL });
  } catch (err) {
    if (PRIMARY_MODEL === FALLBACK_MODEL) throw err;
    console.warn(
      `Gemini ${PRIMARY_MODEL} call failed, retrying with ${FALLBACK_MODEL}:`,
      err instanceof Error ? err.message : err
    );
    return await ai.models.generateContent({ ...params, model: FALLBACK_MODEL });
  }
}

// 1. AI Leaf / Crop Disease Detection
export async function analyzeLeafDisease(
  imageDataUrl?: string | null,
  cropHint?: string,
  symptoms?: string[] | string
): Promise<DiseaseDetectionResult> {
  const disclaimer = 'AI-assisted preliminary analysis. Not for certified agricultural diagnosis.';
  const ai = getGenAI();
  const symptomsStr = Array.isArray(symptoms) ? symptoms.join(', ') : (symptoms || '');

  // Case A: Multimodal Vision Analysis (with image)
  if (ai && imageDataUrl && imageDataUrl.length > 50) {
    try {
      const { mimeType, data } = extractBase64(imageDataUrl);
      const prompt = `You are an expert agricultural plant pathologist and agronomist. Analyze this leaf/crop image for diseases.
Crop hint if provided: ${cropHint || 'Unknown'}.
Reported symptoms if any: ${symptomsStr || 'None specified'}.
Return ONLY valid JSON with exactly this structure:
{
  "cropDetected": "Crop name (e.g. Tomato)",
  "possibleDisease": "Disease name (e.g. Early Blight - Alternaria solani)",
  "visibleSymptoms": ["concentric ring spots", "yellowing margins", "stem lesion"],
  "confidenceScore": 92,
  "severity": "Mild" or "Moderate" or "Severe",
  "recommendedAction": "Immediate curative treatment and spray schedule",
  "preventiveGuidance": ["Maintain dry foliage", "Increase air circulation"],
  "organicRemedies": ["Neem seed kernel extract 5%", "Trichoderma viride foliar spray"]
}`;

      const response = await generateWithFallback(ai, {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          cropDetected: parsed.cropDetected || cropHint || 'Tomato',
          possibleDisease: parsed.possibleDisease || 'Early Blight (Alternaria solani)',
          visibleSymptoms: parsed.visibleSymptoms || ['Brown concentric spot lesions', 'Chlorotic halo around affected zones'],
          confidenceScore: parsed.confidenceScore || 91,
          severity: parsed.severity || 'Moderate',
          recommendedAction: parsed.recommendedAction || 'Apply certified copper oxychloride or bio-fungicide within 48 hours.',
          preventiveGuidance: parsed.preventiveGuidance || ['Avoid overhead sprinkler irrigation', 'Sanitize shears between prunings'],
          organicRemedies: parsed.organicRemedies || ['Neem oil (5ml/L water) emulsion', 'Pseudomonas fluorescens biological culture'],
          disclaimer,
          isSimulated: false
        };
      }
    } catch (err) {
      console.warn('Gemini vision disease detection failed or throttled, falling back to expert diagnostic database:', err);
    }
  }

  // Case B: Text / Symptom-Based Reasoning (when image upload is unchecked or not provided)
  if (ai && (!imageDataUrl || imageDataUrl.length <= 50)) {
    try {
      const prompt = `You are an expert agricultural plant pathologist and agronomist in Maharashtra, India.
Diagnose the crop disease based on reported crop and observed plant symptoms:
Crop: ${cropHint || 'Tomato'}
Observed Symptoms: ${symptomsStr || 'Leaf spots, yellowing, and wilting'}
Return ONLY valid JSON with exactly this structure:
{
  "cropDetected": "Crop name",
  "possibleDisease": "Disease name with scientific name",
  "visibleSymptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "confidenceScore": 90,
  "severity": "Mild" or "Moderate" or "Severe",
  "recommendedAction": "Immediate curative chemical/bio-treatment with exact spray dosage per liter",
  "preventiveGuidance": ["preventive cultural practice 1", "practice 2", "practice 3"],
  "organicRemedies": ["organic remedy 1", "organic remedy 2", "organic remedy 3"]
}`;

      const response = await generateWithFallback(ai, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text);
        return {
          cropDetected: parsed.cropDetected || cropHint || 'Tomato',
          possibleDisease: parsed.possibleDisease || 'Early Blight (Alternaria solani)',
          visibleSymptoms: parsed.visibleSymptoms || ['Reported foliage symptoms', 'Marginal chlorosis'],
          confidenceScore: parsed.confidenceScore || 89,
          severity: parsed.severity || 'Moderate',
          recommendedAction: parsed.recommendedAction || 'Apply systemic fungicide or neem extract as indicated.',
          preventiveGuidance: parsed.preventiveGuidance || ['Maintain dry canopy', 'Improve drainage'],
          organicRemedies: parsed.organicRemedies || ['Neem seed kernel extract 5%', 'Trichoderma viride'],
          disclaimer,
          isSimulated: false
        };
      }
    } catch (err) {
      console.warn('Gemini symptom disease diagnosis failed or throttled, falling back to database:', err);
    }
  }

  // Resilient High-Quality Agronomic Fallback calibrated for Indian crops
  const crop = (cropHint || 'Tomato').toLowerCase();
  if (crop.includes('onion')) {
    return {
      cropDetected: 'Onion (Allium cepa)',
      possibleDisease: 'Purple Blotch (Alternaria porri)',
      visibleSymptoms: [
        'Small, sunken whitish flecks with purple centers on leaves and seed stalks',
        'Large elliptical necrotic lesions with yellow chlorotic margins',
        'Leaves girdled and breaking over under severe infection'
      ],
      confidenceScore: 92,
      severity: 'Moderate',
      recommendedAction: 'Spray Mancozeb 75 WP @ 2.5g/L or Tebuconazole 25.9 EC @ 1ml/L with a wetting sticker agent.',
      preventiveGuidance: [
        'Avoid excessive late nitrogen fertilization during bulb formation',
        'Ensure raised bed drainage to prevent stagnant moisture around bulb collars',
        'Follow 2-year crop rotation with non-allium crops'
      ],
      organicRemedies: [
        'Trichoderma viride foliar drenching @ 5g/L at 10-day intervals',
        'Garlic and ginger extract spray (5%) for fungal spore inhibition',
        'Dashparni ark application (250ml in 15L water)'
      ],
      disclaimer,
      isSimulated: true
    };
  }

  if (crop.includes('soybean')) {
    return {
      cropDetected: 'Soybean (Glycine max)',
      possibleDisease: 'Frogeye Leaf Spot (Cercospora sojina)',
      visibleSymptoms: [
        'Small, circular to angular brown spots with dark reddish-brown margins',
        'Light tan to gray centers on upper leaf surface',
        'Premature defoliation during pod-filling stages'
      ],
      confidenceScore: 90,
      severity: 'Moderate',
      recommendedAction: 'Apply Pyraclostrobin 20% WG @ 1g/L or Hexaconazole 5% EC @ 2ml/L if leaf spotting exceeds 5% canopy.',
      preventiveGuidance: [
        'Use certified disease-resistant seed treated with Thiram + Carbendazim',
        'Practice 2-year rotation with sorghum or maize',
        'Deep summer plowing to bury infested plant debris'
      ],
      organicRemedies: [
        'Pseudomonas fluorescens foliar spray @ 5g/L',
        'Panchagavya foliar application @ 3%',
        'Agniastra bio-formulation foliar spray'
      ],
      disclaimer,
      isSimulated: true
    };
  }

  if (crop.includes('cotton')) {
    return {
      cropDetected: 'Cotton (Gossypium hirsutum)',
      possibleDisease: 'Cotton Leaf Curl Virus (CLCuV)',
      visibleSymptoms: [
        'Upward or downward curling of leaf margins with vein thickening',
        'Enation (leaf-like outgrowths) on leaf undersides',
        'Stunted plant growth and reduced boll formation'
      ],
      confidenceScore: 91,
      severity: 'Severe',
      recommendedAction: 'Control whitefly vector promptly using Diafenthiuron 50% WP @ 1.2g/L or Pyriproxyfen 10% EC @ 2ml/L. Rogue out severely infected plants.',
      preventiveGuidance: [
        'Install yellow sticky traps @ 10 traps/acre for continuous whitefly monitoring',
        'Avoid growing collateral host weeds (Parthenium, Abutilon) around field borders',
        'Maintain balanced potassium fertilization to enhance leaf thickness'
      ],
      organicRemedies: [
        'Spray 5% Neem Seed Kernel Extract (NSKE) at early vegetative stages',
        'Verticillium lecanii bio-insecticide @ 5g/L for whitefly control',
        'Cow urine (Gomutra) spray (10% dilution)'
      ],
      disclaimer,
      isSimulated: true
    };
  }

  if (crop.includes('grape')) {
    return {
      cropDetected: 'Grapes (Vitis vinifera)',
      possibleDisease: 'Downy Mildew (Plasmopara viticola)',
      visibleSymptoms: [
        'Yellowish oil-spot lesions on upper leaf surface',
        'Dense white downy fungal sporulation on corresponding leaf undersides',
        'Infected young bunches turn brown, wither, and drop'
      ],
      confidenceScore: 94,
      severity: 'Severe',
      recommendedAction: 'Spray Dimethomorph 50 WP @ 1g/L or Cymoxanil 8% + Mancozeb 64% WP @ 2g/L within 24 hours of rain or heavy dew.',
      preventiveGuidance: [
        'Canopy management: prune excess shoots to ensure sunlight penetration and aeration',
        'Apply Bordeaux mixture (1%) as a preventive prophylactic spray before rains',
        'Maintain proper drainage between vineyard rows'
      ],
      organicRemedies: [
        'Potassium bicarbonate spray @ 3g/L to inhibit mycelial growth',
        'Ampelomyces quisqualis or Trichoderma bio-agent spray',
        'Fermented butter-milk (chaas) spray (1:10 dilution)'
      ],
      disclaimer,
      isSimulated: true
    };
  }

  if (crop.includes('tomato') || !cropHint) {
    return {
      cropDetected: cropHint || 'Tomato (Solanum lycopersicum)',
      possibleDisease: 'Early Blight (Alternaria solani)',
      visibleSymptoms: [
        'Concentric circular brown lesions (target-board appearance) on lower mature leaves',
        'Marginal yellowing (chlorosis) spreading inwards from leaf tips',
        'Small dark sunken spots on petioles and lower stems'
      ],
      confidenceScore: 93,
      severity: 'Moderate',
      recommendedAction: 'Apply copper-based protective fungicide (Copper Oxychloride 50 WP @ 2.5g/L) or Chlorothalonil 75 WP @ 2g/L during morning hours. Remove and safely destroy infected lower foliage.',
      preventiveGuidance: [
        'Switch strictly to root-zone drip irrigation to keep canopy foliage dry',
        'Improve ridge-and-furrow drainage to avoid waterlogged root collars',
        'Maintain 60cm row spacing to allow adequate ventilation'
      ],
      organicRemedies: [
        'Foliar spray with 5% Neem Seed Kernel Extract (NSKE) with agricultural sticker',
        'Bio-control spray of Trichoderma harzianum @ 5g/L at 7-day intervals',
        'Fermented butter-milk (chaas) solution (1:10 ratio) for fungal spore inhibition'
      ],
      disclaimer,
      isSimulated: true
    };
  }

  // Generic, honest fallback for any crop without a hand-authored demo entry above
  // (rice, wheat, mango, spices, pulses, etc.) — deliberately does NOT assert a
  // specific disease name it can't actually back up, unlike naively defaulting
  // to the Tomato entry regardless of the real crop.
  return {
    cropDetected: cropHint,
    possibleDisease: 'Undetermined — general foliar stress or early-stage infection',
    visibleSymptoms: [
      'Discoloration, spotting, or wilting reported on foliage',
      'Exact pathogen could not be confirmed without a live AI vision check'
    ],
    confidenceScore: 52,
    severity: 'Moderate',
    recommendedAction: `The exact pathogen affecting your ${cropHint} could not be confirmed in offline/demo mode. As a precaution, apply a broad-spectrum protective fungicide (Copper Oxychloride 50 WP @ 2.5g/L or Mancozeb 75 WP @ 2.5g/L) and consult your nearest Krishi Vigyan Kendra (KVK) with a physical sample for a confirmed diagnosis.`,
    preventiveGuidance: [
      'Remove and destroy visibly infected plant parts to limit spread',
      'Avoid overhead irrigation; keep foliage as dry as possible',
      'Ensure balanced NPK fertilization — both deficiency and excess can mimic disease symptoms'
    ],
    organicRemedies: [
      'Neem Seed Kernel Extract (NSKE) 5% foliar spray',
      'Trichoderma viride or Pseudomonas fluorescens bio-fungicide drench'
    ],
    disclaimer: `${disclaimer} This is a generic fallback for ${cropHint}, not a crop-specific diagnosis — connect a live GEMINI_API_KEY for an accurate, photo-specific result.`,
    isSimulated: true
  };
}

// 2. AI Produce Quality Grading

// Measurements computed in the browser from the photo's pixels
// (src/lib/produce-grading.ts).
export interface LocalProduceMetrics {
  sizeUniformity: number;
  colorVibrancy: number;
  surfaceDefects: number;
  firmnessIndex: number;
  produceCoverage: number;
  overallScore: number;
  nonProduceSubject?: string;
  detectedProduce?: string;
}

export class GradingInputError extends Error {
  // True when the photo isn't produce at all (selfie, object, document):
  // such a lot is "Not for sale" rather than a low grade.
  constructor(message: string, public notForSale = false, public detected?: string) {
    super(message);
  }
}

function notForSale(detected: string | undefined, cropName: string): GradingInputError {
  const what = detected === 'person' ? 'a person' : detected ? `"${detected}"` : 'something other than produce';
  return new GradingInputError(
    `NOT FOR SALE — this photo shows ${what}, not harvested ${cropName}. Only photos of the actual produce lot can be graded and listed.`,
    true,
    detected
  );
}

const GRADE_BANDS: { grade: ProduceGrade; min: number; center: number }[] = [
  { grade: 'Grade A', min: 90, center: 95 },
  { grade: 'Grade B', min: 75, center: 82 },
  { grade: 'Grade C', min: 60, center: 67 },
  { grade: 'Grade D', min: 45, center: 52 },
  { grade: 'Grade E', min: 30, center: 37 },
  { grade: 'Grade F', min: 0, center: 15 },
];

const clampPct = (v: unknown, fallback: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(Math.max(0, Math.min(100, n))) : fallback;
};

export function gradeFromScore(score: number): ProduceGrade {
  return (GRADE_BANDS.find((b) => score >= b.min) ?? GRADE_BANDS[GRADE_BANDS.length - 1]).grade;
}

// Estimated share of the lot in each grade, centred on the overall score.
function breakdownFromScore(score: number): QualityReport['breakdown'] {
  const weights = GRADE_BANDS.map((b) => Math.max(0, 1 - Math.abs(score - b.center) / 22));
  const sum = weights.reduce((a, b) => a + b, 0) || 1;
  const pct = weights.map((w) => Math.round((w / sum) * 100));
  const top = pct.indexOf(Math.max(...pct));
  pct[top] += 100 - pct.reduce((a, b) => a + b, 0);
  return { gradeA: pct[0], gradeB: pct[1], gradeC: pct[2], gradeD: pct[3], gradeE: pct[4], gradeF: pct[5] };
}

function normalizeBreakdown(raw: any, score: number): QualityReport['breakdown'] {
  const keys = ['gradeA', 'gradeB', 'gradeC', 'gradeD', 'gradeE', 'gradeF'] as const;
  if (!raw || typeof raw !== 'object') return breakdownFromScore(score);
  const vals = keys.map((k) => Math.max(0, Number(raw[k]) || 0));
  const sum = vals.reduce((a, b) => a + b, 0);
  if (sum <= 0) return breakdownFromScore(score);
  const pct = vals.map((v) => Math.round((v / sum) * 100));
  const top = pct.indexOf(Math.max(...pct));
  pct[top] += 100 - pct.reduce((a, b) => a + b, 0);
  return { gradeA: pct[0], gradeB: pct[1], gradeC: pct[2], gradeD: pct[3], gradeE: pct[4], gradeF: pct[5] };
}

function utilizationForGrade(grade: ProduceGrade): QualityReport['recommendedUtilization'] {
  if (grade === 'Grade A' || grade === 'Grade B') return 'Direct Premium Sale';
  if (grade === 'Grade C') return 'Industrial Food Processing';
  if (grade === 'Grade D' || grade === 'Grade E') return 'Dehydration / Puree / Animal Feed';
  return 'Compost / Biogas / Livestock Feed Only';
}

function describeFromMetrics(m: QualityReport['metrics']): { defects: string[]; freshness: string } {
  const defects: string[] = [];
  if (m.surfaceDefects >= 20) defects.push(`Heavy dark / brown patches on about ${m.surfaceDefects}% of the visible surface (possible rot or bruising)`);
  else if (m.surfaceDefects >= 8) defects.push(`Noticeable blemishes or bruising on about ${m.surfaceDefects}% of the visible surface`);
  else defects.push(`Minimal visible blemishes (about ${m.surfaceDefects}% of surface)`);
  if (m.colorVibrancy < 55) defects.push('Dull or uneven colour — possible over-ripening, sun-scald or poor storage');
  else if (m.colorVibrancy >= 80) defects.push('Bright, even colour across the lot');
  if (m.sizeUniformity < 65) defects.push('Mixed piece sizes — sorting recommended before sale');
  const freshness =
    m.firmnessIndex >= 80
      ? 'Looks fresh and firm'
      : m.firmnessIndex >= 60
        ? 'Moderately fresh — sell or store soon'
        : 'Looks stale or softening — use quickly';
  return { defects, freshness };
}

export async function analyzeProduceQuality(
  batchId: string,
  imageDataUrl: string,
  cropName: string,
  quantityTons: number,
  localMetrics?: LocalProduceMetrics | null
): Promise<QualityReport> {
  const disclaimer = 'AI-based provisional visual grading. Not for food safety certification.';
  const ai = getGenAI();
  const hasImage = Boolean(imageDataUrl && imageDataUrl.length > 50);

  if (ai && hasImage) {
    let parsed: any = null;
    try {
      const { mimeType, data } = extractBase64(imageDataUrl);
      const prompt = `You are a certified post-harvest agricultural grading and quality inspection AI for Indian mandis (APMC).
The farmer says this photo shows harvested ${cropName}.
First decide whether the photo actually shows harvested fruit / vegetables / grain. A selfie, a person, an animal, a document, a screen or any other object is NOT produce (isProduce=false), even if its colours look like produce. Then grade what you actually see — do not assume good quality.
Evaluate:
- sizeUniformity: 0-100, how uniform the piece sizes are (100 = perfectly uniform)
- colorVibrancy: 0-100, colour and ripeness appropriate for the crop (100 = ideal)
- surfaceDefects: 0-100, PERCENT OF VISIBLE SURFACE with bruises, rot, cracks, spots, pest damage or mould (0 = no defects)
- firmnessIndex: 0-100, visual freshness / turgidity (100 = fresh and firm)

Compute overallScore (0-100) and assign a grade using these bands:
Grade A: 90-100 (export / premium retail), Grade B: 75-89 (retail / minor blemish),
Grade C: 60-74 (processing grade), Grade D: 45-59 (heavy processing / discounted),
Grade E: 30-44 (industrial reprocessing / animal feed only), Grade F: 0-29 (rotten / unfit for direct sale — compost/biogas/feed only).

Return ONLY valid JSON with this exact schema:
{
  "isProduce": true,
  "detectedItem": "what the photo actually shows, e.g. Tomato",
  "matchesExpectedCrop": true,
  "overallScore": 0-100,
  "assignedGrade": "Grade A" | "Grade B" | "Grade C" | "Grade D" | "Grade E" | "Grade F",
  "breakdown": { "gradeA": %, "gradeB": %, "gradeC": %, "gradeD": %, "gradeE": %, "gradeF": % },
  "metrics": { "sizeUniformity": 0-100, "colorVibrancy": 0-100, "surfaceDefects": 0-100, "firmnessIndex": 0-100 },
  "visibleDefects": ["specific observations about THIS photo"],
  "freshnessStatus": "short freshness description",
  "confidenceScore": 0-100,
  "aiExplanation": "1-2 sentences explaining the grade from what is visible"
}`;

      const response = await generateWithFallback(ai, {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data } }
            ]
          }
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1
        }
      });
      if (response.text) parsed = JSON.parse(response.text);
    } catch (err) {
      console.warn('Gemini quality grading failed, using on-device image measurements:', err);
    }

    if (parsed) {
      if (parsed.isProduce === false) {
        throw notForSale(parsed.detectedItem ? String(parsed.detectedItem) : localMetrics?.nonProduceSubject, cropName);
      }
      const metrics = {
        sizeUniformity: clampPct(parsed.metrics?.sizeUniformity, localMetrics?.sizeUniformity ?? 75),
        colorVibrancy: clampPct(parsed.metrics?.colorVibrancy, localMetrics?.colorVibrancy ?? 75),
        surfaceDefects: clampPct(parsed.metrics?.surfaceDefects, localMetrics?.surfaceDefects ?? 10),
        firmnessIndex: clampPct(parsed.metrics?.firmnessIndex, localMetrics?.firmnessIndex ?? 75),
      };
      const derivedScore = Math.round(
        metrics.sizeUniformity * 0.2 +
          metrics.colorVibrancy * 0.3 +
          Math.max(0, 100 - metrics.surfaceDefects * 3) * 0.35 +
          metrics.firmnessIndex * 0.15
      );
      const overallScore = clampPct(parsed.overallScore, derivedScore);
      // The grade always follows the score bands so the two never disagree.
      const assignedGrade = gradeFromScore(overallScore);
      const described = describeFromMetrics(metrics);
      const mismatch =
        parsed.matchesExpectedCrop === false && parsed.detectedItem
          ? ` Note: the photo looks like ${parsed.detectedItem}, not ${cropName}.`
          : '';
      return {
        id: 'qr_' + Date.now(),
        batchId,
        analyzedAt: new Date().toISOString(),
        overallScore,
        assignedGrade,
        breakdown: normalizeBreakdown(parsed.breakdown, overallScore),
        metrics,
        visibleDefects:
          Array.isArray(parsed.visibleDefects) && parsed.visibleDefects.length
            ? parsed.visibleDefects.map(String).slice(0, 6)
            : described.defects,
        freshnessStatus: typeof parsed.freshnessStatus === 'string' && parsed.freshnessStatus ? parsed.freshnessStatus : described.freshness,
        confidenceScore: clampPct(parsed.confidenceScore, 80),
        aiExplanation: `${parsed.aiExplanation || 'Grade based on visible size, colour, defects and freshness.'}${mismatch} ${disclaimer}`,
        recommendedUtilization: utilizationForGrade(assignedGrade),
        isSimulated: false
      };
    }
  }

  // No AI available (or it failed): grade from the on-device pixel measurements
  // of this exact photo rather than returning a fixed sample result.
  if (localMetrics) {
    if (localMetrics.nonProduceSubject) throw notForSale(localMetrics.nonProduceSubject, cropName);
    if (localMetrics.produceCoverage < 5) {
      throw new GradingInputError(
        `Couldn't find produce in this photo. Please take a clear, well-lit photo of the ${cropName} lot filling most of the frame.`
      );
    }
    const metrics = {
      sizeUniformity: clampPct(localMetrics.sizeUniformity, 75),
      colorVibrancy: clampPct(localMetrics.colorVibrancy, 75),
      surfaceDefects: clampPct(localMetrics.surfaceDefects, 10),
      firmnessIndex: clampPct(localMetrics.firmnessIndex, 75),
    };
    const overallScore = clampPct(localMetrics.overallScore, 70);
    const assignedGrade = gradeFromScore(overallScore);
    const described = describeFromMetrics(metrics);
    return {
      id: 'qr_' + Date.now(),
      batchId,
      analyzedAt: new Date().toISOString(),
      overallScore,
      assignedGrade,
      breakdown: breakdownFromScore(overallScore),
      metrics,
      visibleDefects: described.defects,
      freshnessStatus: described.freshness,
      confidenceScore: 60,
      aiExplanation: `Offline estimate from colour, blemish and size analysis of your photo (AI vision model not connected).${
        localMetrics.detectedProduce && !cropName.toLowerCase().includes(localMetrics.detectedProduce.toLowerCase())
          ? ` Note: the photo looks like ${localMetrics.detectedProduce}, but ${cropName} is selected — choose the right crop for an accurate grade.`
          : ''
      } ${disclaimer}`,
      recommendedUtilization: utilizationForGrade(assignedGrade),
      isSimulated: true
    };
  }

  throw new GradingInputError(
    hasImage
      ? 'AI grading is unavailable right now. Please try again in a moment.'
      : 'Please capture or upload a photo of the produce to grade it.'
  );
}

// 3. Best Utilization / Zero-Waste Decision Engine
export function computeZeroWasteDecision(
  batchId: string,
  crop: string,
  grade: ProduceGrade,
  quantityTons: number,
  basePricePerTon: number
): BestUtilizationDecision {
  const directValue = Math.round(quantityTons * basePricePerTon);

  if (grade === 'Grade A') {
    const processingVal = Math.round(directValue * 1.12);
    const addedVal = processingVal - directValue;
    return {
      batchId,
      bestAction: 'SELL DIRECT',
      actionTitle: 'Sell Grade A Fresh to Premium Wholesalers / Supermarkets',
      reasoning: `Grade A ${crop} commands premium direct price (₹${(basePricePerTon / 1000).toFixed(1)}/kg). Direct sale yields immediate cash liquidity with lowest holding risk.`,
      estimatedDirectSaleValue: directValue,
      estimatedProcessingValue: processingVal,
      potentialAdditionalValue: addedVal,
      recommendedProcessType: 'Optional: Specialized blast-freeze or aseptic packaging',
      shelfLifeRemainingDays: 12,
      storageRecommendation: 'Immediate dispatch or temp controlled storage at 10-12°C'
    };
  } else if (grade === 'Grade B') {
    const processingVal = Math.round(directValue * 1.32);
    const addedVal = processingVal - directValue;
    return {
      batchId,
      bestAction: 'PROCESS',
      actionTitle: `Channel to Industrial Food Processing (${crop === 'Tomato' ? 'Puree / Paste' : crop === 'Mango' ? 'Aseptic Pulp' : crop === 'Onion' ? 'Dehydrated Flakes' : 'Value-Added Processing'})`,
      reasoning: `Grade B produce suffers 25-35% price discount in fresh mandis due to cosmetic size irregularity. Diverting to verified food processing plants unlocks ₹${addedVal.toLocaleString('en-IN')} in additional value, completely eliminating dump loss.`,
      estimatedDirectSaleValue: directValue,
      estimatedProcessingValue: processingVal,
      potentialAdditionalValue: addedVal,
      recommendedProcessType: crop === 'Tomato' ? 'Tomato Paste / Ketchup Contract' : crop === 'Mango' ? 'Canned Mango Pulp & Puree' : crop === 'Onion' ? 'Vacuum Dehydrated Flakes & Powder' : 'Extrusion / Pureeing',
      shelfLifeRemainingDays: 8,
      storageRecommendation: 'Transport within 48 hours to nearest processing partner'
    };
  } else if (grade === 'Grade C') {
    const processingVal = Math.round(directValue * 1.45);
    const addedVal = processingVal - directValue;
    return {
      batchId,
      bestAction: 'PROCESS',
      actionTitle: 'Zero-Waste Conversion: Solar Dehydration / Bio-Enzyme / Pelletizing',
      reasoning: `Grade C produce cannot compete in open wholesale mandis and risks 100% loss if unsold. Converting into sun-dried shreds, organic bio-fertilizer, or livestock feed pellets extracts ₹${processingVal.toLocaleString('en-IN')} in recovered revenue.`,
      estimatedDirectSaleValue: directValue,
      estimatedProcessingValue: processingVal,
      potentialAdditionalValue: addedVal,
      recommendedProcessType: 'Solar Dryer Dehydration & High-Nutrient Cattle Mash',
      shelfLifeRemainingDays: 5,
      storageRecommendation: 'Keep in ventilated crates, avoid stacking beyond 3 layers'
    };
  } else if (grade === 'Grade D' || grade === 'Grade E') {
    const directDiscounted = Math.round(directValue * 0.35);
    const processingVal = Math.round(directValue * 0.7);
    const addedVal = processingVal - directDiscounted;
    return {
      batchId,
      bestAction: 'PROCESS',
      actionTitle: grade === 'Grade D'
        ? 'Divert to Industrial Reprocessing (Low-Grade Pulp / Starch Extraction)'
        : 'Divert to Animal Feed / Industrial Reprocessing Only',
      reasoning: `${grade} produce shows significant defects and would fetch near-zero price in fresh mandis. Routing to low-grade industrial reprocessing or verified animal feed buyers recovers ₹${processingVal.toLocaleString('en-IN')}, well above the ₹${directDiscounted.toLocaleString('en-IN')} realistic fresh-sale salvage value.`,
      estimatedDirectSaleValue: directDiscounted,
      estimatedProcessingValue: processingVal,
      potentialAdditionalValue: Math.max(addedVal, 0),
      recommendedProcessType: grade === 'Grade D' ? 'Low-Grade Pulp / Starch / Silage Extraction' : 'Certified Animal Feed Pelletizing',
      shelfLifeRemainingDays: 3,
      storageRecommendation: 'Dispatch to processing/feed buyer within 24 hours to avoid total spoilage'
    };
  } else {
    // Grade F
    const directDiscounted = 0;
    const processingVal = Math.round(directValue * 0.25);
    return {
      batchId,
      bestAction: 'PROCESS',
      actionTitle: 'Zero-Waste Salvage Only: Compost / Biogas / Livestock Feed',
      reasoning: `Grade F produce is unfit for the human food chain and has no viable fresh-sale value. The only recovery path is composting, biogas feedstock, or raw livestock feed, salvaging ₹${processingVal.toLocaleString('en-IN')} instead of a total write-off.`,
      estimatedDirectSaleValue: directDiscounted,
      estimatedProcessingValue: processingVal,
      potentialAdditionalValue: processingVal,
      recommendedProcessType: 'Composting / Biogas Feedstock / Raw Livestock Feed (Not for human consumption)',
      shelfLifeRemainingDays: 1,
      storageRecommendation: 'Segregate immediately and dispatch to compost/biogas unit — do not co-store with sellable lots'
    };
  }
}
