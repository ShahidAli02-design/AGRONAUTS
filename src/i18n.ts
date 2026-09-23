export type Language = 'en' | 'mr' | 'hi';

export const translations = {
  en: {
    appName: 'AGRONAUTS',
    tagline: 'From Pre-Harvesting to Sale — End-to-End Smart Agriculture Solution',
    dashboard: 'Dashboard',
    cropPlanning: 'Crop Planning',
    cropMonitoring: 'Crop Monitoring',
    diseaseDetection: 'Disease Detection',
    yieldPrediction: 'Yield Prediction',
    harvest: 'Harvest & Batch',
    qualityGrading: 'AI Quality Grading',
    zeroWaste: 'Zero-Waste Engine',
    inventory: 'Produce Inventory',
    storage: 'Storage Management',
    marketplace: 'Marketplace',
    orders: 'Orders & Tracking',
    traceability: 'Batch Traceability',
    soilHealth: 'Soil Health',
    analytics: 'Farmer Value & Score',
    ancillary: 'Schemes & Rentals',
    community: 'Farmer Community',
    profile: 'Farmer Profile',
    roles: {
      FARMER: 'Farmer',
      BUYER: 'Wholesale Buyer',
      PROCESSOR: 'Food Processor',
      ADMIN: 'System Admin'
    },
    quickActions: {
      addCrop: 'Add Crop',
      registerHarvest: 'Register Harvest',
      checkQuality: 'Check Quality (AI)',
      listProduce: 'List on Market',
      findBuyer: 'Match Buyers'
    },
    status: {
      available: 'Available',
      reserved: 'Reserved',
      stored: 'Stored',
      processing: 'Processing',
      sold: 'Sold',
      delivered: 'Delivered'
    },
    voicePrompt: 'Speak in English, Marathi or Hindi (e.g. "Tomato market price" or "Check quality")...',
    disclaimers: {
      disease: 'AI-assisted preliminary analysis. Not for certified agricultural diagnosis.',
      grading: 'AI-based provisional visual grading. Not for food safety certification.',
      creditScore: 'Internal platform activity score (not an official banking credit score).'
    }
  },
  mr: {
    appName: 'एग्रोनॉट्स (AGRONAUTS)',
    tagline: 'पेरणीपूर्व नियोजनापासून ते थेट विक्रीपर्यंत — संपूर्ण स्मार्ट कृषी परिसंस्था',
    dashboard: 'मुख्य डॅशबोर्ड',
    cropPlanning: 'पीक नियोजन',
    cropMonitoring: 'पीक देखरेख',
    diseaseDetection: 'रोग निदान (AI)',
    yieldPrediction: 'उत्पादन अंदाज',
    harvest: 'कापणी व बॅच',
    qualityGrading: 'गुणवत्ता प्रतवारी (AI)',
    zeroWaste: 'शून्य-नासाडी इंजिन',
    inventory: 'शेतमाल साठा',
    storage: 'गोदाम व्यवस्थापन',
    marketplace: 'कृषी बाजारपेठ',
    orders: 'ऑर्डर्स व ट्रॅकिंग',
    traceability: 'बॅच माग काढणे',
    soilHealth: 'माती आरोग्य तपासणी',
    analytics: 'शेतकरी नफा व स्कोअर',
    ancillary: 'योजना व ट्रॅक्टर भाडे',
    community: 'शेतकरी चर्चा मंच',
    profile: 'शेतकरी प्रोफाइल',
    roles: {
      FARMER: 'शेतकरी बंधू',
      BUYER: 'घाऊक खरेदीदार',
      PROCESSOR: 'अन्न प्रक्रिया उद्योग',
      ADMIN: 'प्रशासक'
    },
    quickActions: {
      addCrop: 'नवीन पीक जोडा',
      registerHarvest: 'कापणी नोंदवा',
      checkQuality: 'गुणवत्ता तपासा',
      listProduce: 'बाजारात विका',
      findBuyer: 'खरेदीदार शोधा'
    },
    status: {
      available: 'उपलब्ध',
      reserved: 'राखीव',
      stored: 'गोदामात',
      processing: 'प्रक्रियेत',
      sold: 'विक्री झाले',
      delivered: 'पोहोचले'
    },
    voicePrompt: 'मराठी, हिंदी किंवा इंग्रजीत बोला (उदा. "टोमॅटो बाजारभाव" किंवा "पीक आरोग्य")...',
    disclaimers: {
      disease: 'कृत्रिम बुद्धिमत्ता-आधारित प्राथमिक विश्लेषण. हे प्रमाणित निदान नाही.',
      grading: 'AI-आधारित प्राथमिक गुणवत्ता प्रतवारी. अन्न सुरक्षा प्रमाणपत्र नाही.',
      creditScore: 'प्लॅटफॉर्म अंतर्गत कृषी व्यवहार गुण (अधिकृत बँक सिबिल स्कोअर नाही).'
    }
  },
  hi: {
    appName: 'एग्रोनॉट्स (AGRONAUTS)',
    tagline: 'फसल योजना से लेकर अंतिम बिक्री तक — सम्पूर्ण स्मार्ट कृषि समाधान',
    dashboard: 'डैशबोर्ड',
    cropPlanning: 'फसल योजना',
    cropMonitoring: 'फसल निगरानी',
    diseaseDetection: 'रोग पहचान (AI)',
    yieldPrediction: 'उपज अनुमान',
    harvest: 'कटाई और बैच',
    qualityGrading: 'गुणवत्ता ग्रेडिंग (AI)',
    zeroWaste: 'शून्य-अपव्यय इंजन',
    inventory: 'उत्पाद इन्वेंटरी',
    storage: 'भंडारण प्रबंधन',
    marketplace: 'कृषि बाज़ार',
    orders: 'ऑर्डर्स व ट्रैकिंग',
    traceability: 'बैच ट्रैसेबिलिटी',
    soilHealth: 'मृदा स्वास्थ्य',
    analytics: 'किसान लाभ व क्रेडिट स्कोर',
    ancillary: 'सरकारी योजनाएं व ट्रैक्टर किराया',
    community: 'किसान समुदाय',
    profile: 'किसान प्रोफ़ाइल',
    roles: {
      FARMER: 'किसान',
      BUYER: 'थोक खरीदार',
      PROCESSOR: 'खाद्य प्रसंस्करणकर्ता',
      ADMIN: 'प्रशासक'
    },
    quickActions: {
      addCrop: 'फसल जोड़ें',
      registerHarvest: 'कटाई दर्ज करें',
      checkQuality: 'गुणवत्ता जांचें',
      listProduce: 'बाजार में बेचें',
      findBuyer: 'खरीदार खोजें'
    },
    status: {
      available: 'उपलब्ध',
      reserved: 'आरक्षित',
      stored: 'भंडारित',
      processing: 'प्रसंस्करण में',
      sold: 'बिक गया',
      delivered: 'डिलीवर हुआ'
    },
    voicePrompt: 'हिंदी, मराठी या अंग्रेजी में बोलें (जैसे: "टमाटर का आज का भाव" या "रोग की पहचान")...',
    disclaimers: {
      disease: 'AI-सहायक प्रारंभिक विश्लेषण। यह प्रमाणित कृषि प्रयोगशाला निदान नहीं है।',
      grading: 'AI-आधारित अनंतिम दृश्य ग्रेडिंग। खाद्य सुरक्षा प्रमाण पत्र नहीं है।',
      creditScore: 'आंतरिक प्लेटफॉर्म गतिविधि स्कोर (आधिकारिक बैंक क्रेडिट स्कोर नहीं है)।'
    }
  }
};
