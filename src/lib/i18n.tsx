import * as React from "react";

export type Lang = "en" | "mr" | "hi";

type Dict = Record<string, string>;

// Universal dictionary for common terms and keys
const en: Dict = {
  appName: "AGRONAUTS",
  tagline: "From harvest to sale, one batch ID all the way",
  heroBody:
    "Record your harvest, get a provisional quality grade, store it, sell it and let buyers trace it back to your field.",
  getStarted: "Get started",
  signIn: "Sign in",
  signOut: "Sign out",
  signUp: "Create account",
  email: "Email address",
  password: "Password",
  fullName: "Full name",
  phone: "Mobile number",
  village: "Village",
  district: "District",
  role: "User role",
  farmer: "Farmer (शेतकरी)",
  buyer: "Buyer / Trader (खरेदीदार)",
  processor: "Food Processor (प्रक्रियादार)",
  admin: "APMC Admin / Agronomist (प्रशासक)",
  dashboard: "Dashboard",
  marketplace: "Marketplace",
  orders: "Orders",
  newBatch: "New harvest batch",
  batches: "My batches",
  crop: "Crop name",
  variety: "Crop variety",
  quantity: "Quantity (kg)",
  harvestDate: "Harvest date",
  notes: "Notes & observations",
  save: "Save",
  saving: "Saving...",
  loading: "Loading...",
  grade: "Quality grade",
  runGrading: "Run AI quality check",
  storage: "Storage",
  utilization: "Utilization decision",
  listForSale: "List for sale",
  pricePerKg: "Price per kg (₹)",
  traceability: "Traceability",
  earnings: "Total earnings",
  buyNow: "Place order",
  language: "Language",
  noBatches: "No batches yet. Record your first harvest.",
  noOrders: "No orders yet.",
  demoNotice: "Verified Farm Lot",
  required: "This field is required",
  errorGeneric: "Something went wrong. Please try again.",
  weather: "Weather forecast",
  marketPrices: "Live Mandi prices",
  cropDoctor: "AI Crop Doctor",
  qualityDetector: "AI Quality Detector",
  soilHealth: "Soil Health & NPK",
  yieldPredictor: "Yield Predictor",
  coldStorage: "Cold Storage",
  schemes: "Schemes & Rentals",
  voiceAssistant: "Voice AI Assistant",

  // Traceability Details
  batchDetails: "Harvest & Produce Details",
  journey: "Field-to-Fork Journey & Timeline",
  origin: "Origin & Farm Location",
  provisionalGrade: "Quality Grade & Score",
  notGradedYet: "Pending grading inspection",
  storageLocation: "Storage facility",
  notRecorded: "On-farm storage",
  utilizationDecision: "Utilization route",
  notDecided: "Fresh market listing",
  gradingNote: "Quality inspection reason",
  registeredFarmer: "Verified Maharashtra Farmer",
  verifiedAuthentic: "100% Traceable & QR Verified",
  downloadQr: "Download QR Certificate",
  shareBatch: "Share Produce Trace",
  certificateTitle: "Agri-Traceability Quality Certificate",
  harvestedOn: "Harvested date",
  farmerDetails: "Farmer profile",
  status_harvested: "Harvested",
  status_graded: "AI Graded",
  status_stored: "Cold Stored",
  status_listed: "Listed for Sale",
  status_sold: "Sold to Buyer",
  status_delivered: "Delivered",
  noTimelineEvents: "No timeline events recorded yet.",
  moistureLevel: "Moisture Content",
  defectRate: "Defect Ratio",
  shelfLife: "Est. Shelf Life",
  days: "days",
  inspectionAudit: "AI Quality Audit Checklist",
  verifiedByApmc: "Verified according to Maharashtra APMC Standards",
  
  // 4 Roles Dashboard specific
  farmerDashboard: "Farmer Field & Harvest Dashboard",
  buyerDashboard: "Buyer Procurement & Quality Hub",
  processorDashboard: "Food Processing & Secondary Lot Hub",
  adminDashboard: "APMC Command & Agronomy Supervision",
  welcomeBack: "Welcome back",
  roleSpecificBadge: "Role Workspace",
  demoLoginNotice: "Quick Login (Select a Role):",
  phone10DigitError: "Please enter a valid 10-digit mobile number.",
  emailValidError: "Please enter a valid email address.",
  loginSuccess: "Signed in successfully!",
  signupSuccess: "Account created successfully! Welcome to Agronauts.",
  invalidCredentials: "Invalid email or password. Please try demo accounts or verify credentials.",
};

const mr: Dict = {
  appName: "अ‍ॅग्रोनॉट्स",
  tagline: "कापणीपासून विक्रीपर्यंत, एकच बॅच क्रमांक",
  heroBody:
    "तुमची कापणी नोंदवा, प्राथमिक दर्जा तपासा, साठवा, विका आणि खरेदीदारांना शेतापर्यंत थेट पारदर्शक माग काढू द्या.",
  getStarted: "सुरू करा",
  signIn: "लॉग इन करा",
  signOut: "बाहेर पडा",
  signUp: "नवीन खाते तयार करा",
  email: "ईमेल पत्ता",
  password: "पासवर्ड",
  fullName: "पूर्ण नाव",
  phone: "१० अंकी मोबाईल नंबर",
  village: "गाव",
  district: "जिल्हा",
  role: "वापरकर्ता भूमिका",
  farmer: "शेतकरी (Farmer)",
  buyer: "खरेदीदार / व्यापारी (Buyer)",
  processor: "अन्न प्रक्रियादार (Processor)",
  admin: "प्रशासक / APMC अधिकारी (Admin)",
  dashboard: "डॅशबोर्ड",
  marketplace: "कृषी बाजारपेठ",
  orders: "खरेदी-विक्री ऑर्डर",
  newBatch: "नवीन कापणी बॅच नोंदवा",
  batches: "माझे पीक बॅच",
  crop: "पिकाचे नाव",
  variety: "वाण / प्रकार",
  quantity: "प्रमाण (किलो)",
  harvestDate: "कापणीची तारीख",
  notes: "शेताची टिपणी व निरीक्षण",
  save: "जतन करा",
  saving: "जतन होत आहे...",
  loading: "लोड होत आहे...",
  grade: "गुणवत्ता दर्जा",
  runGrading: "एआय दर्जा तपासणी करा",
  storage: "साठवणूक पद्धत",
  utilization: "वापराचा निर्णय",
  listForSale: "बाजारपेठेत विक्रीसाठी ठेवा",
  pricePerKg: "प्रति किलो अपेक्षित दर (₹)",
  traceability: "उत्पादन माग (Traceability)",
  earnings: "एकूण उत्पन्न",
  buyNow: "ऑर्डर निश्चित करा",
  language: "भाषा बदला",
  noBatches: "अजून बॅच नोंदवलेली नाही. पहिली कापणी नोंदवा.",
  noOrders: "अजून कोणतीही ऑर्डर नाही.",
  demoNotice: "पडताळणी झालेला शेतकरी लॉट",
  required: "ही माहिती भरणे आवश्यक आहे",
  errorGeneric: "काहीतरी चूक झाली. कृपया पुन्हा प्रयत्न करा.",
  weather: "हवामान अंदाज",
  marketPrices: "थेट कृषी उत्पन्न बाजारभाव (Mandi)",
  cropDoctor: "एआय पीक रोग डॉक्टर",
  qualityDetector: "एआय प्रतवारी व दर्जा तपासणी",
  soilHealth: "मृदा आरोग्य व खत नियोजन",
  yieldPredictor: "उत्पादन व महसूल अंदाज",
  coldStorage: "शीतगृह व साठवणूक",
  schemes: "शासकीय योजना व अवजारे भाडे",
  voiceAssistant: "आवाज सहायक (Voice AI)",

  // Traceability Details
  batchDetails: "कापणी व उत्पादनाचे संपूर्ण तपशील",
  journey: "शेतापासून ताटापर्यंतचा प्रवास व कालमर्यादा",
  origin: "उत्पादक शेताचे मूळ ठिकाण",
  provisionalGrade: "गुणवत्ता प्रतवारी व गुण",
  notGradedYet: "दर्जा तपासणी प्रलंबित",
  storageLocation: "साठवणूक केंद्र",
  notRecorded: "शेतावर साठवणूक",
  utilizationDecision: "वापराचा अंतिम निर्णय",
  notDecided: "ताजी थेट बाजारपेठ",
  gradingNote: "दर्जा तपासणी शेरा व कारण",
  registeredFarmer: "नोंदणीकृत महाराष्ट्र शेतकरी",
  verifiedAuthentic: "१००% पडताळणीकृत आणि सुरक्षित क्यूआर",
  downloadQr: "डिजिटल क्यूआर प्रमाणपत्र डाउनलोड करा",
  shareBatch: "बॅच इतिहास शेअर करा",
  certificateTitle: "डिजिटल कृषी ट्रैसेबिलिटी गुणवत्ता प्रमाणपत्र",
  harvestedOn: "कापणी तारीख",
  farmerDetails: "शेतकरी तपशील",
  status_harvested: "कापणी झाली",
  status_graded: "एआय दर्जा तपासला",
  status_stored: "शीतगृहात साठवले",
  status_listed: "विक्रीसाठी उपलब्ध",
  status_sold: "विक्री झाली",
  status_delivered: "ग्राहकाकडे पोहोचवले",
  noTimelineEvents: "अद्याप कोणतीही घटना नोंदवलेली नाही.",
  moistureLevel: "आर्द्रता प्रमाण",
  defectRate: "दोष प्रमाण",
  shelfLife: "अपेक्षित टिकाऊपणा",
  days: "दिवस",
  inspectionAudit: "एआय गुणवत्ता तपासणी यादी",
  verifiedByApmc: "महाराष्ट्र कृषी उत्पन्न बाजार समिती मानकांनुसार पडताळणी",

  // 4 Roles Dashboard specific
  farmerDashboard: "शेतकरी शेत व कापणी डॅशबोर्ड",
  buyerDashboard: "खरेदीदार व व्यापारी खरेदी केंद्र",
  processorDashboard: "अन्न प्रक्रियादार व दुय्यम माल केंद्र",
  adminDashboard: "कृषी प्रशासन व APMC नियंत्रण कक्ष",
  welcomeBack: "पुन्हा स्वागत आहे",
  roleSpecificBadge: "भूमिका कार्यक्षेत्र",
  demoLoginNotice: "त्वरित चाचणी लॉगिन (भूमिका निवडा):",
  phone10DigitError: "कृपया १० अंकी वैध मोबाईल क्रमांक टाका (उदा. 9822012345).",
  emailValidError: "कृपया वैध ईमेल पत्ता टाका.",
  loginSuccess: "यशस्वीरित्या लॉग इन झाले!",
  signupSuccess: "नवीन खाते तयार झाले! अ‍ॅग्रोनॉट्समध्ये आपले स्वागत आहे.",
  invalidCredentials: "चुकीचा ईमेल किंवा पासवर्ड. कृपया योग्य माहिती भरा अथवा थेट डेमो भूमिका निवडा.",
};

const hi: Dict = {
  appName: "एग्रोनॉट्स",
  tagline: "कटाई से बिक्री तक, एक ही बैच नंबर",
  heroBody:
    "अपनी फसल दर्ज करें, प्रारंभिक गुणवत्ता जांचें, भंडारण करें, बेचें और खरीदारों को खेत तक सीधा ट्रेस करने दें।",
  getStarted: "शुरू करें",
  signIn: "लॉग इन करें",
  signOut: "साइन आउट",
  signUp: "नया खाता बनाएं",
  email: "ईमेल पता",
  password: "पासवर्ड",
  fullName: "पूरा नाम",
  phone: "१० अंकों का मोबाइल नंबर",
  village: "गाँव",
  district: "जिला",
  role: "उपयोगकर्ता भूमिका",
  farmer: "किसान (Farmer)",
  buyer: "खरीदार / व्यापारी (Buyer)",
  processor: "खाद्य प्रसंस्करणकर्ता (Processor)",
  admin: "प्रशासक / APMC अधिकारी (Admin)",
  dashboard: "डैशबोर्ड",
  marketplace: "कृषि बाज़ार",
  orders: "ऑर्डर इतिहास",
  newBatch: "नया फसल बैच दर्ज करें",
  batches: "मेरी फसल बैच",
  crop: "फसल का नाम",
  variety: "किस्म / वैरायटी",
  quantity: "मात्रा (किग्रा)",
  harvestDate: "कटाई की तारीख",
  notes: "खेत की टिप्पणी",
  save: "सहेजें",
  saving: "सहेजा जा रहा है...",
  loading: "लोड हो रहा है...",
  grade: "गुणवत्ता ग्रेड",
  runGrading: "एआई गुणवत्ता जांचें",
  storage: "भंडारण स्थल",
  utilization: "उपयोग निर्णय",
  listForSale: "बाज़ार में बिक्री के लिए रखें",
  pricePerKg: "प्रति किग्रा मूल्य (₹)",
  traceability: "ट्रेसेबिलिटी (फसल इतिहास)",
  earnings: "कुल आमदनी",
  buyNow: "ऑर्डर बुक करें",
  language: "भाषा बदलें",
  noBatches: "अभी कोई बैच नहीं है। पहली फसल दर्ज करें।",
  noOrders: "अभी कोई ऑर्डर नहीं है।",
  demoNotice: "सत्यापित किसान लॉट",
  required: "यह भरना आवश्यक है",
  errorGeneric: "कुछ गलत हुआ। कृपया पुनः प्रयास करें।",
  weather: "मौसम पूर्वानुमान",
  marketPrices: "लाइव मंडी भाव",
  cropDoctor: "एआई फसल रोग डॉक्टर",
  qualityDetector: "एआई गुणवत्ता व ग्रेडिंग डिटेक्टर",
  soilHealth: "मृदा स्वास्थ्य व खाद योजना",
  yieldPredictor: "उपज व आय अनुमान",
  coldStorage: "कोल्ड स्टोरेज",
  schemes: "सरकारी योजनाएं व कृषि यंत्र किराए",
  voiceAssistant: "वॉयस एआई सहायक",

  // Traceability Details
  batchDetails: "कटाई व उपज का सम्पूर्ण विवरण",
  journey: "खेत से थाली तक का सफर व समयरेखा",
  origin: "उत्पादक खेत का मूल स्थान",
  provisionalGrade: "गुणवत्ता ग्रेड और स्कोर",
  notGradedYet: "ग्रेडिंग जांच लंबित",
  storageLocation: "भंडारण सुविधा",
  notRecorded: "खेत पर भंडारण",
  utilizationDecision: "उपयोग का अंतिम निर्णय",
  notDecided: "ताजा बाज़ार सूची",
  gradingNote: "ग्रेडिंग रिपोर्ट व टिप्पणी",
  registeredFarmer: "पंजीकृत महाराष्ट्र किसान",
  verifiedAuthentic: "100% सत्यापित व सुरक्षित क्यूआर",
  downloadQr: "डिजिटल क्यूआर प्रमाण पत्र डाउनलोड करें",
  shareBatch: "बैच ट्रेस साझा करें",
  certificateTitle: "डिजिटल कृषि ट्रेसेबिलिटी गुणवत्ता प्रमाण पत्र",
  harvestedOn: "कटाई की तारीख",
  farmerDetails: "किसान विवरण",
  status_harvested: "कटाई पूर्ण",
  status_graded: "एआई ग्रेडिंग पूर्ण",
  status_stored: "कोल्ड स्टोरेज में भंडारित",
  status_listed: "बिक्री के लिए उपलब्ध",
  status_sold: "खरीदार को बेचा गया",
  status_delivered: "उपभोक्ता को डिलीवर",
  noTimelineEvents: "अभी कोई समयरेखा इवेंट दर्ज नहीं है।",
  moistureLevel: "नमी का स्तर",
  defectRate: "दोष दर",
  shelfLife: "अनुमानित शेल्फ लाइफ",
  days: "दिन",
  inspectionAudit: "एआई गुणवत्ता चेकलिस्ट",
  verifiedByApmc: "महाराष्ट्र कृषि उपज मंडी मानकों के अनुसार सत्यापित",

  // 4 Roles Dashboard specific
  farmerDashboard: "किसान खेत व कटाई डैशबोर्ड",
  buyerDashboard: "खरीदार व व्यापारी खरीद केंद्र",
  processorDashboard: "खाद्य प्रसंस्करण व द्वितीयक लॉट केंद्र",
  adminDashboard: "कृषि प्रशासन व APMC नियंत्रण कक्ष",
  welcomeBack: "पुनः स्वागत है",
  roleSpecificBadge: "भूमिका कार्यक्षेत्र",
  demoLoginNotice: "त्वरित परीक्षण लॉगिन (भूमिका चुनें):",
  phone10DigitError: "कृपया 10 अंकों का वैध मोबाइल नंबर दर्ज करें।",
  emailValidError: "कृपया वैध ईमेल पता दर्ज करें।",
  loginSuccess: "सफलतापूर्वक लॉग इन हुआ!",
  signupSuccess: "नया खाता बनाया गया! एग्रोनॉट्स में आपका स्वागत है।",
  invalidCredentials: "अमान्य ईमेल या पासवर्ड। कृपया विवरण जांचें या डेमो खाता चुनें।",
};

// Universal entity translator (Crops, Varieties, Locations, Grades, Statuses)
const entityTranslations: Record<string, { mr: string; hi: string }> = {
  // Crops
  "Red Onion": { mr: "लाल कांदा", hi: "लाल प्याज" },
  "Onion": { mr: "कांदा", hi: "प्याज" },
  "Tomato": { mr: "टोमॅटो", hi: "टमाटर" },
  "Pomegranate": { mr: "डाळिंब", hi: "अनार" },
  "Grapes": { mr: "द्राक्षे", hi: "अंगूर" },
  "Soybean": { mr: "सोयाबीन", hi: "सोयाबीन" },
  "Cotton": { mr: "कापूस", hi: "कपास" },
  "Turmeric": { mr: "हळद", hi: "हल्दी" },
  "Wheat": { mr: "गहू", hi: "गेहूं" },
  "Sugarcane": { mr: "ऊस", hi: "गन्ना" },
  "Green Chilli": { mr: "हिरवी मिरची", hi: "हरी मिर्च" },
  "Ginger": { mr: "आले", hi: "अदरक" },
  "Banana": { mr: "केळी", hi: "केला" },
  "Potato": { mr: "बटाटा", hi: "आलू" },
  "Garlic": { mr: "लसूण", hi: "लहसुन" },

  // Varieties
  "Bhima Kiran": { mr: "भीमा किरण", hi: "भीमा किरण" },
  "Bhima Super": { mr: "भीमा सुपर", hi: "भीमा सुपर" },
  "Bhagwa": { mr: "भगवा (सिंदूरी)", hi: "भगवा" },
  "Arakta": { mr: "आरक्ता", hi: "आरक्ता" },
  "Abhinav": { mr: "अभिनव हायब्रिड", hi: "अभिनव हाइब्रिड" },
  "JS-335": { mr: "जेएस-३३५", hi: "जेएस-335" },
  "Thompson Seedless": { mr: "थॉमसन सीडलेस", hi: "थॉम्पसन सीडलेस" },
  "Sonaka": { mr: "सोनाका", hi: "सोनाका" },
  "Salem": { mr: "सेलम", hi: "सेलम" },
  "Garva": { mr: "गरवा", hi: "गरवा" },
  "Fursungi": { mr: "फुर्सुंगी", hi: "फुर्सुंगी" },
  "Desi": { mr: "देशी वाण", hi: "देसी किस्म" },
  "Hybrid": { mr: "हायब्रिड", hi: "हाइब्रिड" },

  // Statuses
  "harvested": { mr: "कापणी झाली", hi: "कटाई पूर्ण" },
  "graded": { mr: "दर्जा निश्चित", hi: "ग्रेडिंग पूर्ण" },
  "stored": { mr: "साठवले", hi: "भंडारित" },
  "listed": { mr: "विक्रीसाठी ठेवले", hi: "सूचीबद्ध" },
  "sold": { mr: "विक्री झाली", hi: "बिक गया" },
  "delivered": { mr: "पोहोचवले", hi: "वितरित" },
  "in_transit": { mr: "वाहतुकीत", hi: "रास्ते में" },
  "cancelled": { mr: "रद्द", hi: "रद्द" },

  // Grades
  "A": { mr: "दर्जा अ (प्रीमियम)", hi: "ग्रेड ए (प्रीमियम)" },
  "B": { mr: "दर्जा ब (प्रक्रिया योग्य)", hi: "ग्रेड बी (प्रोसेसिंग)" },
  "C": { mr: "दर्जा क (स्थानिक/पल्प)", hi: "ग्रेड सी (लोकल/पल्प)" },
  "Grade A": { mr: "दर्जा अ (प्रीमियम एक्सपोर्ट)", hi: "ग्रेड ए (प्रीमियम एक्सपोर्ट)" },
  "Grade B": { mr: "दर्जा ब (प्रक्रिया योग्य)", hi: "ग्रेड बी (प्रोसेसिंग)" },
  "Grade C": { mr: "दर्जा क (पल्प व पावडर)", hi: "ग्रेड सी (पल्प/पाउडर)" },

  // Districts
  "Nashik": { mr: "नाशिक", hi: "नासिक" },
  "Pune": { mr: "पुणे", hi: "पुणे" },
  "Latur": { mr: "लातूर", hi: "लातूर" },
  "Kolhapur": { mr: "कोल्हापूर", hi: "कोल्हापुर" },
  "Solapur": { mr: "सोलापूर", hi: "सोलापुर" },
  "Sangli": { mr: "सांगली", hi: "सांगली" },
  "Ahmednagar": { mr: "अहमदनगर (अहिल्यानगर)", hi: "अहमदनगर" },
  "Nagpur": { mr: "नागपूर", hi: "नागपुर" },
  "Amravati": { mr: "अमरावती", hi: "अमरावती" },
  "Jalgaon": { mr: "जळगाव", hi: "जलगांव" },
  "Aurangabad": { mr: "छत्रपती संभाजीनगर", hi: "औरंगाबाद" },
  "Satara": { mr: "सातारा", hi: "सतारा" },
  "Maharashtra": { mr: "महाराष्ट्र", hi: "महाराष्ट्र" },
  "Pimpalgaon": { mr: "पिंपळगाव बसवंत", hi: "पिंपलगांव बसवंत" },
  "Lasalgaon": { mr: "लासलगाव", hi: "लासलगांव" },
  "Baramati": { mr: "बारामती", hi: "बारामती" },

  // Event types
  "harvest": { mr: "कापणी नोंद", hi: "कटाई प्रविष्टि" },
  "grade": { mr: "एआय दर्जा तपासणी", hi: "एआई गुणवत्ता जांच" },
  "store": { mr: "शीतगृह साठवणूक", hi: "कोल्ड स्टोरेज भंडारण" },
  "list": { mr: "बाजारपेठ विक्री सूची", hi: "मार्केटप्लेस लिस्टिंग" },
  "order": { mr: "खरेदी ऑर्डर नोंद", hi: "खरीद आदेश प्रविष्टि" },
  "deliver": { mr: "ग्राहकाकडे पोहोच", hi: "डिलीवरी पूर्ण" },
};

const dicts: Record<Lang, Dict> = { en, mr, hi };

export const langLabels: Record<Lang, string> = {
  en: "English",
  mr: "मराठी",
  hi: "हिंदी",
};

/**
 * Universal entity translator that safely converts crops, varieties,
 * districts, grades and statuses into the active language.
 */
export function translateEntity(val: string | null | undefined, lang: Lang): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (lang === "en") return trimmed;

  // Direct match in entity map
  if (entityTranslations[trimmed]?.[lang]) {
    return entityTranslations[trimmed][lang];
  }

  // Case-insensitive match
  const lower = trimmed.toLowerCase();
  for (const [key, map] of Object.entries(entityTranslations)) {
    if (key.toLowerCase() === lower) {
      return map[lang];
    }
  }

  // Check dictionary
  if (dicts[lang][trimmed]) {
    return dicts[lang][trimmed];
  }

  return trimmed;
}

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: string) => string;
  te: (val: string | null | undefined) => string;
};

const I18nContext = React.createContext<Ctx>({
  lang: "en",
  setLang: () => {},
  t: (k) => en[k] ?? k,
  te: (val) => val ?? "",
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = React.useState<Lang>("en");

  React.useEffect(() => {
    const stored = window.localStorage.getItem("agronauts.lang");
    if (stored === "en" || stored === "mr" || stored === "hi") setLangState(stored);
  }, []);

  const setLang = React.useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem("agronauts.lang", l);
  }, []);

  const t = React.useCallback(
    (k: string) => {
      return dicts[lang][k] ?? en[k] ?? k;
    },
    [lang]
  );

  const te = React.useCallback(
    (val: string | null | undefined) => {
      return translateEntity(val, lang);
    },
    [lang]
  );

  const value = React.useMemo<Ctx>(
    () => ({ lang, setLang, t, te }),
    [lang, setLang, t, te]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return React.useContext(I18nContext);
}
