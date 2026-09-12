import { Language } from '../i18n';

export interface VoiceQueryResult {
  transcript: string;
  response: string;
  actionIntent?: string;
  targetTab?: string;
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
    onError: (err: any) => void
  ) {
    if (!this.isSupported()) {
      onError('Speech recognition not supported in this browser. Please type your query.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;

    if (lang === 'mr') {
      this.recognition.lang = 'mr-IN';
    } else if (lang === 'hi') {
      this.recognition.lang = 'hi-IN';
    } else {
      this.recognition.lang = 'en-IN';
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      onError(event.error);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Voice start error:', e);
    }
  }

  public static stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  public static speak(text: string, lang: Language) {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      if (lang === 'mr') utterance.lang = 'mr-IN';
      else if (lang === 'hi') utterance.lang = 'hi-IN';
      else utterance.lang = 'en-IN';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  }

  // Natural Language Intent Matcher for Agricultural Voice Queries
  public static processQuery(query: string, lang: Language): VoiceQueryResult {
    const q = query.toLowerCase();

    // Market price inquiry
    if (q.includes('price') || q.includes('bhav') || q.includes('rate') || q.includes('भाव') || q.includes('दाम')) {
      if (q.includes('tomato') || q.includes('टोमॅटो') || q.includes('टमाटर')) {
        return {
          transcript: query,
          response: lang === 'mr'
            ? 'टोमॅटो आज चांगल्या भावात विकला जातोय — नाशिक बाजार समितीत २,४५० रुपये प्रति क्विंटल, आणि दर वाढत आहेत.'
            : lang === 'hi'
            ? 'टमाटर आज अच्छे भाव में बिक रहा है — नासिक मंडी में ₹2,450 प्रति क्विंटल, और भाव बढ़ रहे हैं।'
            : "Tomatoes are trading strong today — ₹2,450 per quintal at Nashik APMC, and prices are trending up. Here's the full market view.",
          targetTab: 'marketplace'
        };
      }
      return {
        transcript: query,
        response: lang === 'mr'
          ? 'नाशिक, लासलगाव आणि मुंबई येथील ताजे बाजारभाव पाहूया.'
          : lang === 'hi'
          ? 'नासिक, लासलगांव और मुंबई की ताज़ा मंडी दरें दिखाता हूँ।'
          : "Let's take a look at today's rates — here are live APMC prices across Nashik, Lasalgaon, and Mumbai.",
        targetTab: 'marketplace'
      };
    }

    // Disease / Leaf Health inquiry
    if (q.includes('disease') || q.includes('leaf') || q.includes('keed') || q.includes('rog') || q.includes('रोग') || q.includes('कीड') || q.includes('बीमारी')) {
      return {
        transcript: query,
        response: lang === 'mr'
          ? 'चला पानावरचा त्रास ओळखूया — पानाचा स्पष्ट फोटो अपलोड करा, मी लगेच AI निदान देतो.'
          : lang === 'hi'
          ? 'चलिए पत्ती की समस्या पहचानते हैं — प्रभावित पत्ती की एक साफ फोटो अपलोड करें, मैं तुरंत निदान बताऊँगा।'
          : "Let's figure out what's going on with your crop — upload a clear photo of the affected leaf and I'll run it through AI diagnosis right away.",
        targetTab: 'diseaseDetection'
      };
    }

    // Quality / Grading
    if (q.includes('quality') || q.includes('grade') || q.includes('grading') || q.includes('दर्जा') || q.includes('प्रतवारी') || q.includes('ग्रेड')) {
      return {
        transcript: query,
        response: lang === 'mr'
          ? 'चांगली बातमी — बॅच AGR-2026-TOM-00001 ला ग्रेड A मिळाला आहे, ९२% गुणवत्ता गुण. पूर्ण अहवाल उघडतोय.'
          : lang === 'hi'
          ? 'अच्छी खबर — बैच AGR-2026-TOM-00001 को ग्रेड A मिला है, 92% क्वालिटी स्कोर। पूरी रिपोर्ट खोल रहा हूँ।'
          : "Good news — batch AGR-2026-TOM-00001 came out Grade A with a 92% quality score. Let me pull up the full report for you.",
        targetTab: 'qualityGrading'
      };
    }

    // Harvest / Batch
    if (q.includes('harvest') || q.includes('batch') || q.includes('कापणी') || q.includes('कटाई')) {
      return {
        transcript: query,
        response: lang === 'mr'
          ? 'ठीक आहे, ही कापणी नोंदवूया — यातून तुम्हाला एक ट्रेस करता येणारा बॅच आयडी मिळेल.'
          : lang === 'hi'
          ? 'ठीक है, चलिए इस कटाई को दर्ज करते हैं — इससे आपको एक ट्रेस करने योग्य बैच आईडी मिलेगी।'
          : "Let's get this harvest registered — I'll take you to batch registration so it gets a traceable ID from here to sale.",
        targetTab: 'harvest'
      };
    }

    // Default friendly assistant response
    return {
      transcript: query,
      response: lang === 'mr'
        ? `"${query}" बद्दल मी मदत करू शकतो. पीक भाव, रोग निदान, गुणवत्ता तपासणी किंवा नवीन कापणी नोंदणी — यापैकी काय हवंय?`
        : lang === 'hi'
        ? `"${query}" के बारे में मैं मदद कर सकता हूँ। फसल के भाव, रोग निदान, गुणवत्ता जांच या नई कटाई दर्ज करना — क्या करना चाहेंगे?`
        : `I can help with that. Try asking about crop prices, disease diagnosis, quality grading, or registering a new harvest — what would you like to do?`,
      targetTab: 'dashboard'
    };
  }
}
