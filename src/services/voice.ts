import { Language } from '../i18n';
import { INDIA_CROPS, type IndiaCrop } from '../lib/india-crops';

export interface VoiceQueryResult {
  transcript: string;
  response: string;
  actionIntent?: string;
  targetTab?: string;
}

// Extra spoken names (Hindi / common Marathi spellings, romanized forms)
// that don't appear in the crop list's own "English (मराठी)" names.
const CROP_SYNONYMS: Record<string, string[]> = {
  Tomato: ['tamatar', 'टमाटर', 'टोमॅटो', 'टमाटो'],
  Onion: ['kanda', 'pyaz', 'pyaaz', 'प्याज', 'प्याज़', 'कांदा', 'कांदे'],
  Potato: ['aloo', 'alu', 'batata', 'आलू', 'बटाटा', 'बटाटे'],
  Brinjal: ['baingan', 'vangi', 'बैंगन', 'वांगी'],
  Cabbage: ['patta gobhi', 'पत्ता गोभी', 'पत्तागोभी'],
  Cauliflower: ['phool gobhi', 'gobhi', 'फूलगोभी', 'फूल गोभी', 'गोभी'],
  Chilli: ['mirchi', 'मिर्च', 'मिर्ची', 'मिरची'],
  Wheat: ['gehu', 'gahu', 'गेहूं', 'गेहूँ', 'गहू'],
  Rice: ['chawal', 'dhan', 'bhat', 'चावल', 'धान', 'भात'],
  Soybean: ['soyabean', 'सोयाबीन'],
  Cotton: ['kapas', 'kapus', 'कपास', 'कापूस'],
  Sugarcane: ['ganna', 'गन्ना', 'ऊस'],
  Grapes: ['angoor', 'draksha', 'अंगूर', 'द्राक्ष', 'द्राक्षे'],
  Pomegranate: ['anar', 'dalimb', 'अनार', 'डाळिंब'],
  Banana: ['kela', 'keli', 'केला', 'केळी', 'केळ'],
  Mango: ['aam', 'amba', 'आम', 'आंबा'],
  Garlic: ['lahsun', 'lasun', 'लहसुन', 'लसूण'],
  Maize: ['makka', 'maka', 'मक्का', 'मका'],
  Chickpea: ['chana', 'harbhara', 'चना', 'हरभरा'],
  Groundnut: ['mungfali', 'bhuimug', 'मूंगफली', 'शेंगदाणा', 'भुईमूग'],
};

function cropAliases(crop: IndiaCrop): string[] {
  const fromName = crop.name
    .split(/[()/]/)
    .map((s) => s.trim().toLowerCase())
    .filter((s) => s.length >= 2);
  return [crop.id.toLowerCase(), ...fromName, ...(CROP_SYNONYMS[crop.id] ?? []).map((s) => s.toLowerCase())];
}

export function findCropInQuery(query: string): IndiaCrop | undefined {
  const q = query.toLowerCase();
  let best: { crop: IndiaCrop; len: number } | undefined;
  for (const crop of INDIA_CROPS) {
    for (const alias of cropAliases(crop)) {
      // Latin aliases must be whole words ("til" shouldn't match "until").
      const hit = /[a-z]/.test(alias)
        ? new RegExp(`(^|[^a-z])${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(e?s)?([^a-z]|$)`).test(q)
        : q.includes(alias) || (alias.length >= 3 && q.includes(alias.replace(/[\u093E-\u094C]$/, '')));
      if (hit && (!best || alias.length > best.len)) best = { crop, len: alias.length };
    }
  }
  return best?.crop;
}

const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

function say(lang: Language, en: string, mr: string, hi: string) {
  return lang === 'mr' ? mr : lang === 'hi' ? hi : en;
}

function cropLabel(crop: IndiaCrop, lang: Language): string {
  const local = crop.name.match(/\(([^)]+)\)/)?.[1];
  const hindi = (CROP_SYNONYMS[crop.id] ?? []).find((s) => /[ऀ-ॿ]/.test(s));
  if (lang === 'mr') return local ?? crop.id;
  if (lang === 'hi') return hindi ?? local ?? crop.id;
  return crop.name.split(/[(/]/)[0].trim();
}

export class VoiceAssistant {
  private static recognition: any = null;
  private static isListening: boolean = false;

  public static isSupported(): boolean {
    return typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);
  }

  public static startListening(
    lang: Language,
    onResult: (text: string) => void,
    onError: (err: any) => void,
    onEnd?: () => void
  ) {
    if (!this.isSupported()) {
      onError('not-supported');
      return;
    }
    this.stopListening();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    this.recognition = recognition;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.lang = lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';

    let gotResult = false;
    recognition.onstart = () => {
      this.isListening = true;
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        gotResult = true;
        onResult(transcript);
      }
    };
    recognition.onerror = (event: any) => {
      this.isListening = false;
      if (event.error !== 'aborted') onError(event.error);
    };
    recognition.onend = () => {
      this.isListening = false;
      // Chrome ends silently when nothing was said; treat it like "no-speech"
      // so the UI never stays stuck on "Listening...".
      if (!gotResult) onEnd?.();
    };

    try {
      recognition.start();
    } catch (e) {
      console.warn('Voice start error:', e);
      onError('start-failed');
    }
  }

  public static stopListening() {
    if (this.recognition) {
      // Stopped on purpose (typed query, modal closed): don't report it as
      // "didn't hear anything".
      this.recognition.onresult = null;
      this.recognition.onerror = null;
      this.recognition.onend = null;
      try {
        this.recognition.abort();
      } catch {
        // already stopped
      }
      this.recognition = null;
      this.isListening = false;
    }
  }

  // Many devices have no Marathi voice; Hindi voices read Devanagari text
  // correctly, so fall back to one instead of speaking nothing.
  private static pickVoice(lang: Language): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();
    const prefs = lang === 'mr' ? ['mr-IN', 'mr', 'hi-IN', 'hi'] : lang === 'hi' ? ['hi-IN', 'hi'] : ['en-IN', 'en-GB', 'en-US', 'en'];
    for (const p of prefs) {
      const v = voices.find((voice) => voice.lang.replace('_', '-').toLowerCase().startsWith(p.toLowerCase()));
      if (v) return v;
    }
    return undefined;
  }

  public static speak(text: string, lang: Language) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();
    const run = () => {
      const utterance = new SpeechSynthesisUtterance(text);
      const voice = this.pickVoice(lang);
      if (voice) utterance.voice = voice;
      utterance.lang = voice?.lang ?? (lang === 'mr' ? 'mr-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN');
      utterance.rate = 0.95;
      synth.speak(utterance);
    };
    // Voices load asynchronously on first use in Chrome.
    if (synth.getVoices().length) run();
    else {
      let done = false;
      const once = () => {
        if (done) return;
        done = true;
        run();
      };
      synth.addEventListener('voiceschanged', once, { once: true });
      setTimeout(once, 600);
    }
  }

  public static stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // Asks the server (Gemini) first for a natural answer; falls back to the
  // built-in intent matcher when the AI is unavailable.
  public static async ask(query: string, lang: Language): Promise<VoiceQueryResult> {
    const local = this.processQuery(query, lang);
    try {
      const res = await fetch('/api/voice/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, lang }),
        signal: AbortSignal.timeout(12000),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.success && typeof data.response === 'string' && data.response.trim()) {
          return { transcript: query, response: data.response, targetTab: data.targetTab || local.targetTab };
        }
      }
    } catch {
      // offline / AI unavailable — use the local answer
    }
    return local;
  }

  // Natural Language Intent Matcher for Agricultural Voice Queries
  public static processQuery(query: string, lang: Language): VoiceQueryResult {
    const q = query.toLowerCase();
    const crop = findCropInQuery(q);
    const r = (response: string, targetTab: string): VoiceQueryResult => ({ transcript: query, response, targetTab });

    // Register a new harvest / batch
    if (has(q, ['harvest', 'batch', 'register', 'new lot', 'कापणी', 'नोंद', 'कटाई', 'फसल दर्ज', 'बॅच', 'बैच'])) {
      return r(
        say(
          lang,
          `Let's register your ${crop ? cropLabel(crop, lang) + ' ' : ''}harvest — you'll get a traceable batch ID that follows it all the way to sale.`,
          `चला, ${crop ? cropLabel(crop, lang) + 'ची ' : ''}कापणी नोंदवूया — तुम्हाला विक्रीपर्यंत ट्रेस करता येणारा बॅच आयडी मिळेल.`,
          `चलिए, ${crop ? cropLabel(crop, lang) + ' की ' : ''}कटाई दर्ज करते हैं — आपको बिक्री तक ट्रेस होने वाली बैच आईडी मिलेगी।`
        ),
        'harvest'
      );
    }

    // Market price inquiry
    if (has(q, ['price', 'bhav', 'rate', 'market', 'mandi', 'भाव', 'दाम', 'दर', 'किंमत', 'कीमत', 'बाजार', 'मंडी'])) {
      if (crop) {
        const perQuintal = (crop.pricePerKg * 100).toLocaleString('en-IN');
        return r(
          say(
            lang,
            `${cropLabel(crop, lang)} is around ₹${crop.pricePerKg} per kg (about ₹${perQuintal} per quintal) at the farm gate. Open the marketplace to see live listings and buyers.`,
            `${cropLabel(crop, lang)} सध्या सुमारे ₹${crop.pricePerKg} प्रति किलो (सुमारे ₹${perQuintal} प्रति क्विंटल) आहे. खरेदीदार व लिस्टिंग पाहण्यासाठी बाजारपेठ उघडा.`,
            `${cropLabel(crop, lang)} अभी लगभग ₹${crop.pricePerKg} प्रति किलो (लगभग ₹${perQuintal} प्रति क्विंटल) है। खरीदार और लिस्टिंग देखने के लिए बाज़ार खोलें।`
          ),
          'marketplace'
        );
      }
      return r(
        say(
          lang,
          'Tell me the crop name for its price — for example "onion price". Or open the marketplace to see all listings.',
          'भावासाठी पिकाचे नाव सांगा — उदा. "कांद्याचा भाव". किंवा सर्व लिस्टिंग पाहण्यासाठी बाजारपेठ उघडा.',
          'भाव के लिए फसल का नाम बताइए — जैसे "प्याज का भाव"। या सभी लिस्टिंग देखने के लिए बाज़ार खोलें।'
        ),
        'marketplace'
      );
    }

    // Disease / Leaf Health inquiry
    if (has(q, ['disease', 'leaf', 'pest', 'keed', 'rog', 'insect', 'fungus', 'रोग', 'कीड', 'कीट', 'बीमारी', 'पाने', 'पत्ती', 'करपा'])) {
      return r(
        say(
          lang,
          `Upload a clear photo of the affected ${crop ? cropLabel(crop, lang) + ' ' : ''}leaf in AI Crop Doctor and I'll diagnose it with treatment advice.`,
          `एआय क्रॉप डॉक्टरमध्ये ${crop ? cropLabel(crop, lang) + 'च्या ' : ''}खराब पानाचा स्पष्ट फोटो अपलोड करा, मी रोग व उपाय सांगतो.`,
          `एआई फसल डॉक्टर में ${crop ? cropLabel(crop, lang) + ' की ' : ''}प्रभावित पत्ती की साफ फोटो अपलोड करें, मैं रोग और इलाज बताऊँगा।`
        ),
        'diseaseDetection'
      );
    }

    // Quality / Grading
    if (has(q, ['quality', 'grade', 'grading', 'दर्जा', 'प्रतवारी', 'ग्रेड', 'गुणवत्ता'])) {
      return r(
        say(
          lang,
          'Open the AI Quality Detector and take a photo of your produce lot — you will get a grade from A to F and the best way to sell it.',
          'एआय गुणवत्ता तपासणी उघडा आणि शेतमालाचा फोटो घ्या — तुम्हाला A ते F ग्रेड आणि विक्रीचा उत्तम मार्ग मिळेल.',
          'एआई गुणवत्ता जांच खोलें और अपनी उपज की फोटो लें — आपको A से F ग्रेड और बेचने का सबसे अच्छा तरीका मिलेगा।'
        ),
        'qualityGrading'
      );
    }

    // Soil / fertilizer
    if (has(q, ['soil', 'fertilizer', 'fertiliser', 'npk', 'urea', 'माती', 'मिट्टी', 'खत', 'खाद', 'उर्वरक'])) {
      return r(
        say(
          lang,
          'Enter your soil test values in Soil Health & NPK and I will calculate the fertilizer dose for your crop.',
          'माती आरोग्य व NPK मध्ये माती परीक्षणाचे आकडे टाका, मी तुमच्या पिकासाठी खताची मात्रा काढून देतो.',
          'मृदा स्वास्थ्य व NPK में मिट्टी जांच के आंकड़े डालें, मैं आपकी फसल के लिए खाद की मात्रा बताऊँगा।'
        ),
        'soilHealth'
      );
    }

    // Yield
    if (has(q, ['yield', 'production', 'utpadan', 'उत्पादन', 'उपज', 'पैदावार'])) {
      const extra = crop
        ? say(
            lang,
            ` Typical ${cropLabel(crop, lang)} yield is about ${crop.avgYieldQuintalsPerAcre} quintals per acre in ${crop.maturityDays} days.`,
            ` ${cropLabel(crop, lang)}चे सरासरी उत्पादन सुमारे ${crop.avgYieldQuintalsPerAcre} क्विंटल प्रति एकर (${crop.maturityDays} दिवस) असते.`,
            ` ${cropLabel(crop, lang)} की औसत उपज लगभग ${crop.avgYieldQuintalsPerAcre} क्विंटल प्रति एकड़ (${crop.maturityDays} दिन) होती है।`
          )
        : '';
      return r(
        say(lang, 'Let me open the Yield Predictor for your field.', 'तुमच्या शेतासाठी उत्पादन अंदाज उघडतो.', 'आपके खेत के लिए उपज अनुमान खोलता हूँ।') + extra,
        'yieldPrediction'
      );
    }

    // Storage
    if (has(q, ['storage', 'cold', 'godown', 'warehouse', 'शीतगृह', 'गोदाम', 'साठवण', 'भंडारण', 'कोल्ड'])) {
      return r(
        say(lang, 'Here are nearby cold storage and warehouse options with rates.', 'जवळची शीतगृहे व गोदामे त्यांच्या दरांसह दाखवतो.', 'पास के कोल्ड स्टोरेज और गोदाम उनकी दरों के साथ दिखाता हूँ।'),
        'coldStorage'
      );
    }

    // Schemes / loans / rentals
    if (has(q, ['scheme', 'yojana', 'subsidy', 'loan', 'insurance', 'tractor', 'rent', 'योजना', 'अनुदान', 'कर्ज', 'लोन', 'विमा', 'बीमा', 'ट्रॅक्टर', 'ट्रैक्टर'])) {
      return r(
        say(lang, 'Opening government schemes, insurance and equipment rentals for you.', 'सरकारी योजना, पीक विमा व अवजारे भाड्याने — ही माहिती उघडतो.', 'सरकारी योजनाएँ, फसल बीमा और उपकरण किराया — जानकारी खोलता हूँ।'),
        'schemes'
      );
    }

    // Orders
    if (has(q, ['order', 'delivery', 'ऑर्डर', 'डिलिव्हरी', 'डिलीवरी'])) {
      return r(say(lang, 'Opening your orders and deliveries.', 'तुमच्या ऑर्डर्स व डिलिव्हरी उघडतो.', 'आपके ऑर्डर और डिलीवरी खोलता हूँ।'), 'orders');
    }

    // Dashboard / home
    if (has(q, ['dashboard', 'home', 'डॅशबोर्ड', 'डैशबोर्ड', 'मुख्य'])) {
      return r(say(lang, 'Opening your dashboard.', 'तुमचा डॅशबोर्ड उघडतो.', 'आपका डैशबोर्ड खोलता हूँ।'), 'dashboard');
    }

    if (crop) {
      return r(
        say(
          lang,
          `${cropLabel(crop, lang)}: about ₹${crop.pricePerKg}/kg, ${crop.avgYieldQuintalsPerAcre} quintals/acre, ready in about ${crop.maturityDays} days. Ask me about its price, diseases or quality grading.`,
          `${cropLabel(crop, lang)}: सुमारे ₹${crop.pricePerKg}/किलो, ${crop.avgYieldQuintalsPerAcre} क्विंटल/एकर, सुमारे ${crop.maturityDays} दिवसांत तयार. भाव, रोग किंवा गुणवत्तेबद्दल विचारा.`,
          `${cropLabel(crop, lang)}: लगभग ₹${crop.pricePerKg}/किलो, ${crop.avgYieldQuintalsPerAcre} क्विंटल/एकड़, लगभग ${crop.maturityDays} दिन में तैयार। भाव, रोग या गुणवत्ता के बारे में पूछें।`
        ),
        'marketplace'
      );
    }

    // Default friendly assistant response
    return r(
      say(
        lang,
        'I can help with crop prices, disease diagnosis, quality grading, soil & fertilizer, yield, cold storage, schemes, orders or registering a new harvest — what would you like?',
        'मी पीक भाव, रोग निदान, गुणवत्ता तपासणी, माती व खत, उत्पादन अंदाज, शीतगृह, योजना, ऑर्डर्स किंवा नवीन कापणी नोंदणीमध्ये मदत करू शकतो — काय हवंय?',
        'मैं फसल भाव, रोग निदान, गुणवत्ता जांच, मिट्टी व खाद, उपज अनुमान, कोल्ड स्टोरेज, योजनाएँ, ऑर्डर या नई कटाई दर्ज करने में मदद कर सकता हूँ — क्या चाहिए?'
      ),
      'dashboard'
    );
  }
}
