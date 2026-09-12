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

const PRIMARY_MODEL = 'gemini-3.8-flash';
const FALLBACK_MODEL = 'gemini-2.5-flash';

// Tries the newest model first; on any failure (e.g. transient 503 overload),
// retries once against the stable model before giving up to the caller's fallback data.
async function generateWithFallback(
  ai: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>
) {
  try {
    return await ai.models.generateContent({ ...params, model: PRIMARY_MODEL });
  } catch (err) {
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
export async function analyzeProduceQuality(
  batchId: string,
  imageDataUrl: string,
  cropName: string,
  quantityTons: number
): Promise<QualityReport> {
  const disclaimer = 'AI-based provisional visual grading. Not for food safety certification.';
  const ai = getGenAI();

  if (ai && imageDataUrl && imageDataUrl.length > 50) {
    try {
      const { mimeType, data } = extractBase64(imageDataUrl);
      const prompt = `You are a certified post-harvest agricultural grading and quality inspection AI.
Analyze this harvested ${cropName} produce image for visible grading standards.
Parameters to evaluate:
- Size uniformity (scale 0-100)
- Color vibrancy and ripeness (scale 0-100)
- Surface defects or bruising (scale 0-100 where higher means fewer defects)
- Firmness and visual freshness index (scale 0-100)

Compute an overallScore (0-100) and assign a grade using these bands:
Grade A: 90-100 (export / premium retail), Grade B: 75-89 (retail / minor blemish),
Grade C: 60-74 (processing grade), Grade D: 45-59 (heavy processing / discounted),
Grade E: 30-44 (industrial reprocessing / animal feed only), Grade F: 0-29 (unfit for direct sale — compost/biogas/feed only).

Return ONLY valid JSON with this exact schema:
{
  "overallScore": 88,
  "assignedGrade": "Grade A" or "Grade B" or "Grade C" or "Grade D" or "Grade E" or "Grade F",
  "breakdown": {
    "gradeA": 65,
    "gradeB": 25,
    "gradeC": 10,
    "gradeD": 0,
    "gradeE": 0,
    "gradeF": 0
  },
  "metrics": {
    "sizeUniformity": 90,
    "colorVibrancy": 92,
    "surfaceDefects": 5,
    "firmnessIndex": 88
  },
  "visibleDefects": ["Minor calyx browning", "Uniform red color across 90% of fruit"],
  "freshnessStatus": "Freshly harvested field condition",
  "confidenceScore": 94,
  "aiExplanation": "Uniform fruit sizing and brilliant color with minimal dermal friction marks.",
  "recommendedUtilization": "Direct Premium Sale" or "Industrial Food Processing" or "Dehydration / Puree / Animal Feed" or "Compost / Biogas / Livestock Feed Only"
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
          id: 'qr_' + Date.now(),
          batchId,
          analyzedAt: new Date().toISOString(),
          overallScore: parsed.overallScore || 88,
          assignedGrade: parsed.assignedGrade || 'Grade A',
          breakdown: parsed.breakdown || { gradeA: 65, gradeB: 25, gradeC: 10, gradeD: 0, gradeE: 0, gradeF: 0 },
          metrics: parsed.metrics || { sizeUniformity: 88, colorVibrancy: 90, surfaceDefects: 6, firmnessIndex: 86 },
          visibleDefects: parsed.visibleDefects || ['No major puncture or fungal rot', 'Slight size variability under 10%'],
          freshnessStatus: parsed.freshnessStatus || 'Turgid, high sheen, ready for market dispatch',
          confidenceScore: parsed.confidenceScore || 94,
          aiExplanation: `${parsed.aiExplanation || 'Good color depth and visual uniformity.'} ${disclaimer}`,
          recommendedUtilization: parsed.recommendedUtilization || 'Direct Premium Sale',
          isSimulated: false
        };
      }
    } catch (err) {
      console.warn('Gemini quality grading fallback:', err);
    }
  }

  // Fallback Quality Report with realistic agricultural metrics
  return {
    id: 'qr_' + Date.now(),
    batchId,
    analyzedAt: new Date().toISOString(),
    overallScore: 89,
    assignedGrade: 'Grade A',
    breakdown: {
      gradeA: 65,
      gradeB: 27,
      gradeC: 8,
      gradeD: 0,
      gradeE: 0,
      gradeF: 0
    },
    metrics: {
      sizeUniformity: 92,
      colorVibrancy: 91,
      surfaceDefects: 5,
      firmnessIndex: 89
    },
    visibleDefects: [
      'Clean epidermal skin with minimal sunscald (<3%)',
      'Optimal sugar-to-acid visual blush with firm calyx attachment',
      'Zero deep bruising or mold contamination'
    ],
    freshnessStatus: 'High turgidity, harvested at optimal breaker maturity',
    confidenceScore: 95,
    aiExplanation: `Produce demonstrates high commercial uniformity and vibrant pigmentation suitable for tier-1 wholesale distribution. ${disclaimer}`,
    recommendedUtilization: 'Direct Premium Sale',
    isSimulated: true
  };
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
