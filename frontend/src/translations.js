/**
 * Central translation dictionary for the AI Health Report Interpreter.
 *
 * Every user-visible string in the application is keyed here.
 * The frontend reads from this file; no translations are
 * scattered across components.
 */

const translations = {
  // ───────────────────────────────────────────────
  // ENGLISH
  // ───────────────────────────────────────────────
  en: {
    welcomeTitle: "Understand Your Health Reports with AI",
    welcomeSubtitle: "Upload your medical report to extract biomarkers, understand results and explore helpful health insights.",
    filterAll: "All Results",
    filterAttention: "Attention Needed",
    filterNormal: "Normal",
    filterUnknown: "Unclassified",
    reportOverview: "Report Overview",
    reportTypeLabel: "Report Type",
    labReport: "Laboratory Analysis",
    imagingReport: "Imaging Diagnostic Scan",
    generalReport: "General Health Report",
    summaryMetrics: "Results Summary",
    dropToUpload: "Drop your PDF file here",
    clickOrDrag: "Click to browse or drag and drop your PDF here",
    supportedFormat: "Supported format: PDF up to 25 MB",
    changeFile: "Select different file",
    pageLabel: "Page",
    doctorNote: "Take these questions to your next healthcare appointment to discuss with your doctor.",
    resultsFound: "biomarkers extracted",
    observationsFound: "imaging findings identified",
    patternsDetected: "clinical patterns detected",

    // Header
    appTitle: "AI Health Report Interpreter",
    appSubtitle: "Understand your medical reports in simple language.",

    // Upload section
    uploadTitle: "Upload Your Medical Report",
    uploadDescription:
      "Upload your medical PDF and get a simple, easy-to-understand explanation of your results.",
    choosePdf: "Choose a PDF report",
    pdfSelected: "PDF selected successfully",
    clickToBrowse: "Click here to browse your files",
    languageLabel: "🌐 Language",
    analyzeButton: "Analyze Report →",
    analyzingButton: "Analyzing...",

    // Messages
    selectPdfError: "Please select a PDF file.",
    selectPdfFirst: "Please select a medical PDF first.",
    reportSuccess: "Report analyzed successfully.",
    processingError: "Failed to process the report.",
    genericError: "Something went wrong while analyzing the report.",

    // Report heading
    yourReport: "YOUR REPORT",

    // Overall impression
    impressionTitle: "Overall Impression",
    impressionSubtitle: "What your report means in simple language",
    noImpression: "No clear impression was identified in this report.",
    uploadPromptImpression:
      "Upload a medical report to see an easy-to-understand summary of the important findings.",

    // Imaging
    imagingTitle: "Imaging Findings",
    imagingSubtitle: "Important observations identified in your scan",
    noImagingFindings:
      "No organ-specific findings could be confidently identified. Please refer to the original imaging report.",

    // Biomarkers
    biomarkerTitle: "Biomarker Analysis",
    biomarkerSubtitle: "Understand what is high, low, or normal",
    noBiomarkers:
      "No laboratory biomarkers were confidently identified from this report.",
    uploadPromptBiomarkers:
      "Low, high and normal laboratory results will appear here after analysis.",
    referenceRange: "Reference range:",

    // Status labels
    statusHigh: "High",
    statusLow: "Low",
    statusNormal: "Normal",
    statusUnknown: "Unknown",

    // Patterns
    patternsTitle: "Detected Patterns",
    patternsSubtitle: "Relationships between your report findings",
    noPatterns:
      "No significant patterns were identified from the available results.",
    uploadPromptPatterns:
      "Important patterns identified from your report will appear here.",

    // Concern
    concernTitle: "How Concerning Is This?",
    concernSubtitle: "Understand what may need attention",
    waitingForAnalysis: "Waiting for report analysis",
    waitingDescription:
      "The system will assess the findings and explain why they may or may not require medical follow-up.",

    // Knowledge
    knowledgeTitle: "AI Knowledge Analysis",
    knowledgeSubtitle: "Relevant medical information about your findings",
    noKnowledge:
      "No relevant medical knowledge was retrieved for the identified findings.",
    uploadPromptKnowledge:
      "Relevant medical knowledge retrieved from the AI knowledge base will appear here.",
    relatedTo: "Related to:",
    reportFinding: "Report finding",
    source: "Source:",

    // Doctor questions
    doctorTitle: "Questions to Ask Your Doctor",
    doctorSubtitle: "Useful questions based on your report",
    defaultQ1: "What do my report findings mean?",
    defaultQ2: "Do I need any additional tests?",
    defaultQ3: "What could be causing these findings?",
    defaultQ4: "Do I need a follow-up appointment?",

    // Chatbot
    chatbotTitle: "Ask About Your Report",
    chatbotSubtitle:
      "Ask questions about unfamiliar medical terms and findings.",
    chatbotWelcome:
      "👋 Upload your report and I'll help explain unfamiliar medical terms and findings.",
    chatPlaceholder: "Ask something about your report...",
    sendButton: "Send",

    // Disclaimer
    disclaimerTitle: "Medical Disclaimer",
    disclaimerText:
      "This tool provides educational information and is not a medical diagnosis. Results should be discussed with a qualified healthcare professional who can consider your symptoms, medical history, and other clinical information.",

    // Saved Reports & LocalStorage
    savedReports: "Saved Reports",
    savedReportsModalTitle: "Saved Medical Reports",
    allReportsTab: "All Reports",
    localStorageTab: "Local Storage",
    databaseTab: "Cloud Database",
    autoSavedBadge: "Auto-saved in LocalStorage",
    autoSavedToast: "Report automatically saved to LocalStorage",
    clearLocalReports: "Clear Local Storage",
    clearLocalConfirm: "Are you sure you want to delete all locally stored medical reports?",
    exportReports: "Export JSON",
    deleteReport: "Delete",
    noSavedReports: "No saved reports found.",
    noLocalReports: "No local reports saved yet. Upload and analyze any medical report to save it automatically.",
    closeReport: "Close Report",
    viewReport: "View Report",
    restoredFromLocal: "Restored previous report from local storage",
    storageLocal: "Local Storage",
    storageDb: "Cloud Database",
    storageSynced: "Local + Cloud",
  },

  // ───────────────────────────────────────────────
  // HINDI
  // ───────────────────────────────────────────────
  hi: {
    welcomeTitle: "AI के साथ अपनी स्वास्थ्य रिपोर्ट समझें",
    welcomeSubtitle: "बायोमार्कर निकालने, परिणामों को समझने और उपयोगी स्वास्थ्य जानकारी प्राप्त करने के लिए अपनी मेडिकल रिपोर्ट अपलोड करें।",
    filterAll: "सभी परिणाम",
    filterAttention: "ध्यान देने योग्य",
    filterNormal: "सामान्य",
    filterUnknown: "अवर्गीकृत",
    reportOverview: "रिपोर्ट अवलोकन",
    reportTypeLabel: "रिपोर्ट प्रकार",
    labReport: "प्रयोगशाला विश्लेषण",
    imagingReport: "इमेजिंग स्कैन",
    generalReport: "सामान्य स्वास्थ्य रिपोर्ट",
    summaryMetrics: "परिणाम सारांश",
    dropToUpload: "अपनी PDF फ़ाइल यहाँ छोड़ें",
    clickOrDrag: "ब्राउज़ करने के लिए क्लिक करें या PDF यहाँ खींचें",
    supportedFormat: "समर्थित प्रारूप: 25 MB तक की PDF",
    changeFile: "फ़ाइल बदलें",
    pageLabel: "पृष्ठ",
    doctorNote: "अपने डॉक्टर के साथ चर्चा करने के लिए इन प्रश्नों को अपने अगले अपॉइंटमेंट में ले जाएं।",
    resultsFound: "बायोमार्कर निकाले गए",
    observationsFound: "इमेजिंग निष्कर्ष पहचाने गए",
    patternsDetected: "पैटर्न पहचाने गए",

    appTitle: "AI स्वास्थ्य रिपोर्ट विश्लेषक",
    appSubtitle: "अपनी चिकित्सा रिपोर्ट को सरल भाषा में समझें।",

    uploadTitle: "अपनी मेडिकल रिपोर्ट अपलोड करें",
    uploadDescription:
      "अपनी मेडिकल PDF अपलोड करें और अपने परिणामों की सरल व्याख्या प्राप्त करें।",
    choosePdf: "एक PDF रिपोर्ट चुनें",
    pdfSelected: "PDF सफलतापूर्वक चुनी गई",
    clickToBrowse: "अपनी फ़ाइलें ब्राउज़ करने के लिए यहाँ क्लिक करें",
    languageLabel: "🌐 भाषा",
    analyzeButton: "रिपोर्ट विश्लेषण करें →",
    analyzingButton: "विश्लेषण हो रहा है...",

    selectPdfError: "कृपया एक PDF फ़ाइल चुनें।",
    selectPdfFirst: "कृपया पहले एक मेडिकल PDF चुनें।",
    reportSuccess: "रिपोर्ट का विश्लेषण सफलतापूर्वक हुआ।",
    processingError: "रिपोर्ट को प्रोसेस करने में विफल।",
    genericError: "रिपोर्ट का विश्लेषण करते समय कुछ गड़बड़ हुई।",

    yourReport: "आपकी रिपोर्ट",

    impressionTitle: "समग्र निष्कर्ष",
    impressionSubtitle: "आपकी रिपोर्ट का सरल भाषा में अर्थ",
    noImpression: "इस रिपोर्ट में कोई स्पष्ट निष्कर्ष नहीं मिला।",
    uploadPromptImpression:
      "महत्वपूर्ण निष्कर्षों का सारांश देखने के लिए एक मेडिकल रिपोर्ट अपलोड करें।",

    imagingTitle: "इमेजिंग निष्कर्ष",
    imagingSubtitle: "आपके स्कैन में पहचाने गए महत्वपूर्ण अवलोकन",
    noImagingFindings:
      "कोई अंग-विशिष्ट निष्कर्ष विश्वसनीय रूप से नहीं मिले। कृपया मूल इमेजिंग रिपोर्ट देखें।",

    biomarkerTitle: "बायोमार्कर विश्लेषण",
    biomarkerSubtitle: "समझें कि क्या अधिक, कम या सामान्य है",
    noBiomarkers:
      "इस रिपोर्ट से कोई प्रयोगशाला बायोमार्कर विश्वसनीय रूप से नहीं मिले।",
    uploadPromptBiomarkers:
      "विश्लेषण के बाद निम्न, उच्च और सामान्य प्रयोगशाला परिणाम यहाँ दिखाई देंगे।",
    referenceRange: "संदर्भ सीमा:",

    statusHigh: "अधिक",
    statusLow: "कम",
    statusNormal: "सामान्य",
    statusUnknown: "अज्ञात",

    patternsTitle: "पहचाने गए पैटर्न",
    patternsSubtitle: "आपकी रिपोर्ट के निष्कर्षों के बीच संबंध",
    noPatterns: "उपलब्ध परिणामों से कोई महत्वपूर्ण पैटर्न नहीं मिले।",
    uploadPromptPatterns:
      "आपकी रिपोर्ट से पहचाने गए महत्वपूर्ण पैटर्न यहाँ दिखाई देंगे।",

    concernTitle: "यह कितना चिंताजनक है?",
    concernSubtitle: "समझें कि किस पर ध्यान देने की ज़रूरत है",
    waitingForAnalysis: "रिपोर्ट विश्लेषण की प्रतीक्षा",
    waitingDescription:
      "सिस्टम निष्कर्षों का आकलन करेगा और बताएगा कि उन्हें चिकित्सा अनुवर्ती की आवश्यकता क्यों हो या न हो।",

    knowledgeTitle: "AI ज्ञान विश्लेषण",
    knowledgeSubtitle: "आपके निष्कर्षों से संबंधित चिकित्सा जानकारी",
    noKnowledge:
      "पहचाने गए निष्कर्षों के लिए कोई प्रासंगिक चिकित्सा ज्ञान नहीं मिला।",
    uploadPromptKnowledge:
      "AI ज्ञान आधार से प्राप्त प्रासंगिक चिकित्सा ज्ञान यहाँ दिखाई देगा।",
    relatedTo: "संबंधित:",
    reportFinding: "रिपोर्ट निष्कर्ष",
    source: "स्रोत:",

    doctorTitle: "अपने डॉक्टर से पूछने के लिए प्रश्न",
    doctorSubtitle: "आपकी रिपोर्ट पर आधारित उपयोगी प्रश्न",
    defaultQ1: "मेरी रिपोर्ट के निष्कर्षों का क्या अर्थ है?",
    defaultQ2: "क्या मुझे कोई अतिरिक्त जाँच करानी चाहिए?",
    defaultQ3: "इन निष्कर्षों का कारण क्या हो सकता है?",
    defaultQ4: "क्या मुझे फ़ॉलो-अप अपॉइंटमेंट की ज़रूरत है?",

    chatbotTitle: "अपनी रिपोर्ट के बारे में पूछें",
    chatbotSubtitle:
      "अपरिचित चिकित्सा शब्दों और निष्कर्षों के बारे में प्रश्न पूछें।",
    chatbotWelcome:
      "👋 अपनी रिपोर्ट अपलोड करें और मैं अपरिचित चिकित्सा शब्दों और निष्कर्षों को समझाने में मदद करूँगा।",
    chatPlaceholder: "अपनी रिपोर्ट के बारे में कुछ पूछें...",
    sendButton: "भेजें",

    disclaimerTitle: "चिकित्सा अस्वीकरण",
    disclaimerText:
      "यह उपकरण शैक्षिक जानकारी प्रदान करता है और यह चिकित्सा निदान नहीं है। परिणामों पर एक योग्य स्वास्थ्य पेशेवर से चर्चा की जानी चाहिए जो आपके लक्षणों, चिकित्सा इतिहास और अन्य नैदानिक जानकारी पर विचार कर सकें।",
  },

  // ───────────────────────────────────────────────
  // TELUGU
  // ───────────────────────────────────────────────
  te: {
    welcomeTitle: "AI తో మీ ఆరోగ్య నివేదికలను అర్థం చేసుకోండి",
    welcomeSubtitle: "బయోమార్కర్లను సంగ్రహించడానికి, ఫలితాలను అర్థం చేసుకోవడానికి మీ వైద్య నివేదికను అప్‌లోడ్ చేయండి.",
    filterAll: "అన్ని ఫలితాలు",
    filterAttention: "శ్రద్ధ అవసరం",
    filterNormal: "సాధారణం",
    filterUnknown: "వర్గీకరించనివి",
    reportOverview: "నివేదిక సమీక్ష",
    reportTypeLabel: "నివేదిక రకం",
    labReport: "ప్రయోగశాల విశ్లేషణ",
    imagingReport: "ఇమేజింగ్ స్కాన్",
    generalReport: "సాధారణ ఆరోగ్య నివేదిక",
    summaryMetrics: "ఫలితాల సారాంశం",
    dropToUpload: "మీ PDF ఫైల్‌ను ఇక్కడ వదలండి",
    clickOrDrag: "బ్రౌజ్ చేయడానికి క్లిక్ చేయండి లేదా PDF ను ఇక్కడ డ్రాగ్ చేయండి",
    supportedFormat: "మద్దతు ఉన్న ఫార్మాట్: 25 MB వరకు PDF",
    changeFile: "ఫైల్ మార్చండి",
    pageLabel: "పేజీ",
    doctorNote: "మీ డాక్టర్‌తో చర్చించడానికి ఈ ప్రశ్నలను మీ తదుపరి అపాయింట్‌మెంట్‌కు తీసుకెళ్లండి.",
    resultsFound: "బయోమార్కర్లు కనుగొనబడ్డాయి",
    observationsFound: "ఇమేజింగ్ ఫలితాలు గుర్తించబడ్డాయి",
    patternsDetected: "నమూనాలు గుర్తించబడ్డాయి",

    appTitle: "AI ఆరోగ్య నివేదిక విశ్లేషకం",
    appSubtitle: "మీ వైద్య నివేదికలను సరళ భాషలో అర్థం చేసుకోండి.",

    uploadTitle: "మీ వైద్య నివేదికను అప్‌లోడ్ చేయండి",
    uploadDescription:
      "మీ వైద్య PDF ను అప్‌లోడ్ చేయండి మరియు మీ ఫలితాల సరళ వివరణను పొందండి.",
    choosePdf: "ఒక PDF నివేదికను ఎంచుకోండి",
    pdfSelected: "PDF విజయవంతంగా ఎంపిక చేయబడింది",
    clickToBrowse: "మీ ఫైల్‌లను బ్రౌజ్ చేయడానికి ఇక్కడ క్లిక్ చేయండి",
    languageLabel: "🌐 భాష",
    analyzeButton: "నివేదిక విశ్లేషించండి →",
    analyzingButton: "విశ్లేషిస్తోంది...",

    selectPdfError: "దయచేసి ఒక PDF ఫైల్‌ను ఎంచుకోండి.",
    selectPdfFirst: "దయచేసి ముందుగా ఒక వైద్య PDF ఎంచుకోండి.",
    reportSuccess: "నివేదిక విజయవంతంగా విశ్లేషించబడింది.",
    processingError: "నివేదికను ప్రాసెస్ చేయడంలో విఫలమైంది.",
    genericError: "నివేదిక విశ్లేషించేటప్పుడు ఏదో తప్పు జరిగింది.",

    yourReport: "మీ నివేదిక",

    impressionTitle: "మొత్తం అభిప్రాయం",
    impressionSubtitle: "మీ నివేదిక సరళ భాషలో ఏమి అర్థం",
    noImpression: "ఈ నివేదికలో స్పష్టమైన అభిప్రాయం గుర్తించబడలేదు.",
    uploadPromptImpression:
      "ముఖ్యమైన ఫలితాల సారాంశం చూడడానికి ఒక వైద్య నివేదికను అప్‌లోడ్ చేయండి.",

    imagingTitle: "ఇమేజింగ్ ఫలితాలు",
    imagingSubtitle: "మీ స్కాన్‌లో గుర్తించబడిన ముఖ్యమైన పరిశీలనలు",
    noImagingFindings:
      "అవయవ-నిర్దిష్ట ఫలితాలు నమ్మకంగా గుర్తించబడలేదు. దయచేసి అసలు ఇమేజింగ్ నివేదికను చూడండి.",

    biomarkerTitle: "బయోమార్కర్ విశ్లేషణ",
    biomarkerSubtitle: "ఏది ఎక్కువ, తక్కువ లేదా సాధారణమో అర్థం చేసుకోండి",
    noBiomarkers:
      "ఈ నివేదిక నుండి ప్రయోగశాల బయోమార్కర్లు నమ్మకంగా గుర్తించబడలేదు.",
    uploadPromptBiomarkers:
      "విశ్లేషణ తర్వాత తక్కువ, ఎక్కువ మరియు సాధారణ ప్రయోగశాల ఫలితాలు ఇక్కడ కనిపిస్తాయి.",
    referenceRange: "సూచన పరిధి:",

    statusHigh: "ఎక్కువ",
    statusLow: "తక్కువ",
    statusNormal: "సాధారణం",
    statusUnknown: "తెలియదు",

    patternsTitle: "గుర్తించబడిన నమూనాలు",
    patternsSubtitle: "మీ నివేదిక ఫలితాల మధ్య సంబంధాలు",
    noPatterns:
      "అందుబాటులో ఉన్న ఫలితాల నుండి ముఖ్యమైన నమూనాలు గుర్తించబడలేదు.",
    uploadPromptPatterns:
      "మీ నివేదిక నుండి గుర్తించబడిన ముఖ్యమైన నమూనాలు ఇక్కడ కనిపిస్తాయి.",

    concernTitle: "ఇది ఎంత ఆందోళనకరం?",
    concernSubtitle: "దేనికి శ్రద్ధ అవసరమో అర్థం చేసుకోండి",
    waitingForAnalysis: "నివేదిక విశ్లేషణ కోసం వేచి ఉంది",
    waitingDescription:
      "సిస్టమ్ ఫలితాలను అంచనా వేసి, వాటికి వైద్య ఫాలో-అప్ ఎందుకు అవసరం లేదా అవసరం కాదో వివరిస్తుంది.",

    knowledgeTitle: "AI జ్ఞాన విశ్లేషణ",
    knowledgeSubtitle: "మీ ఫలితాల గురించి సంబంధిత వైద్య సమాచారం",
    noKnowledge:
      "గుర్తించబడిన ఫలితాలకు సంబంధిత వైద్య జ్ఞానం తిరిగి పొందబడలేదు.",
    uploadPromptKnowledge:
      "AI జ్ఞాన భాండాగారం నుండి పొందిన సంబంధిత వైద్య జ్ఞానం ఇక్కడ కనిపిస్తుంది.",
    relatedTo: "సంబంధం:",
    reportFinding: "నివేదిక ఫలితం",
    source: "మూలం:",

    doctorTitle: "మీ డాక్టర్‌ను అడగవలసిన ప్రశ్నలు",
    doctorSubtitle: "మీ నివేదిక ఆధారంగా ఉపయోగకరమైన ప్రశ్నలు",
    defaultQ1: "నా నివేదిక ఫలితాల అర్థం ఏమిటి?",
    defaultQ2: "నాకు ఏవైనా అదనపు పరీక్షలు అవసరమా?",
    defaultQ3: "ఈ ఫలితాలకు కారణం ఏమిటి?",
    defaultQ4: "నాకు ఫాలో-అప్ అపాయింట్‌మెంట్ అవసరమా?",

    chatbotTitle: "మీ నివేదిక గురించి అడగండి",
    chatbotSubtitle:
      "తెలియని వైద్య పదాలు మరియు ఫలితాల గురించి ప్రశ్నలు అడగండి.",
    chatbotWelcome:
      "👋 మీ నివేదిక అప్‌లోడ్ చేయండి, తెలియని వైద్య పదాలు మరియు ఫలితాలను వివరించడంలో నేను సహాయం చేస్తాను.",
    chatPlaceholder: "మీ నివేదిక గురించి ఏదైనా అడగండి...",
    sendButton: "పంపండి",

    disclaimerTitle: "వైద్య నిరాకరణ",
    disclaimerText:
      "ఈ సాధనం విద్యా సమాచారాన్ని అందిస్తుంది మరియు ఇది వైద్య నిర్ధారణ కాదు. ఫలితాలను మీ లక్షణాలు, వైద్య చరిత్ర మరియు ఇతర వైద్య సమాచారాన్ని పరిగణించగల అర్హత కలిగిన ఆరోగ్య నిపుణులతో చర్చించాలి.",
  },

  // ───────────────────────────────────────────────
  // TAMIL
  // ───────────────────────────────────────────────
  ta: {
    welcomeTitle: "AI மூலம் உங்கள் உடல்நல அறிக்கைகளைப் புரிந்து கொள்ளுங்கள்",
    welcomeSubtitle: "பயோமார்க்கர்களைப் பிரித்தெடுக்கவும், முடிவுகளைப் புரிந்து கொள்ளவும் உங்கள் மருத்துவ அறிக்கையைப் பதிவேற்றவும்.",
    filterAll: "அனைத்து முடிவுகள்",
    filterAttention: "கவனம் தேவை",
    filterNormal: "இயல்பானது",
    filterUnknown: "வகைப்படுத்தப்படாதவை",
    reportOverview: "அறிக்கை கண்ணோட்டம்",
    reportTypeLabel: "அறிக்கை வகை",
    labReport: "ஆய்வக பகுப்பாய்வு",
    imagingReport: "இமேஜிங் ஸ்கேன்",
    generalReport: "பொது சுகாதார அறிக்கை",
    summaryMetrics: "முடிவுகள் சுருக்கம்",
    dropToUpload: "உங்கள் PDF கோப்பை இங்கே விடவும்",
    clickOrDrag: "உலாவ கிளிக் செய்யவும் அல்லது PDF கோப்பை இங்கே இழுத்து விடவும்",
    supportedFormat: "ஆதரிக்கப்படும் வடிவம்: 25 MB வரை PDF",
    changeFile: "கோப்பை மாற்றவும்",
    pageLabel: "பக்கம்",
    doctorNote: "உங்கள் மருத்துவரிடம் விவாதிக்க இந்த கேள்விகளை உங்கள் அடுத்த சந்திப்பிற்கு எடுத்துச் செல்லுங்கள்.",
    resultsFound: "பயோமார்க்கர்கள் கண்டறியப்பட்டன",
    observationsFound: "இமேஜிங் அவதானிப்புகள்",
    patternsDetected: "வடிவங்கள் கண்டறியப்பட்டன",

    appTitle: "AI உடல்நல அறிக்கை விளக்கி",
    appSubtitle: "உங்கள் மருத்துவ அறிக்கைகளை எளிய மொழியில் புரிந்து கொள்ளுங்கள்.",

    uploadTitle: "உங்கள் மருத்துவ அறிக்கையை பதிவேற்றவும்",
    uploadDescription:
      "உங்கள் மருத்துவ PDF ஐ பதிவேற்றி, உங்கள் முடிவுகளின் எளிய விளக்கத்தைப் பெறுங்கள்.",
    choosePdf: "ஒரு PDF அறிக்கையைத் தேர்ந்தெடுக்கவும்",
    pdfSelected: "PDF வெற்றிகரமாகத் தேர்ந்தெடுக்கப்பட்டது",
    clickToBrowse: "உங்கள் கோப்புகளை உலாவ இங்கே கிளிக் செய்யவும்",
    languageLabel: "🌐 மொழி",
    analyzeButton: "அறிக்கையை பகுப்பாய்வு செய் →",
    analyzingButton: "பகுப்பாய்வு செய்கிறது...",

    selectPdfError: "தயவுசெய்து ஒரு PDF கோப்பைத் தேர்ந்தெடுக்கவும்.",
    selectPdfFirst: "தயவுசெய்து முதலில் ஒரு மருத்துவ PDF ஐத் தேர்ந்தெடுக்கவும்.",
    reportSuccess: "அறிக்கை வெற்றிகரமாக பகுப்பாய்வு செய்யப்பட்டது.",
    processingError: "அறிக்கையை செயலாக்குவதில் தோல்வி.",
    genericError: "அறிக்கையை பகுப்பாய்வு செய்யும் போது ஏதோ தவறு நிகழ்ந்தது.",

    yourReport: "உங்கள் அறிக்கை",

    impressionTitle: "ஒட்டுமொத்த கருத்து",
    impressionSubtitle: "உங்கள் அறிக்கை எளிய மொழியில் என்ன பொருள்",
    noImpression: "இந்த அறிக்கையில் தெளிவான கருத்து கண்டறியப்படவில்லை.",
    uploadPromptImpression:
      "முக்கியமான கண்டுபிடிப்புகளின் சுருக்கத்தைக் காண ஒரு மருத்துவ அறிக்கையை பதிவேற்றவும்.",

    imagingTitle: "இமேஜிங் கண்டுபிடிப்புகள்",
    imagingSubtitle: "உங்கள் ஸ்கேனில் கண்டறியப்பட்ட முக்கிய அவதானிப்புகள்",
    noImagingFindings:
      "உறுப்பு சார்ந்த கண்டுபிடிப்புகள் நம்பகமாகக் கண்டறியப்படவில்லை. அசல் இமேஜிங் அறிக்கையைப் பார்க்கவும்.",

    biomarkerTitle: "பயோமார்க்கர் பகுப்பாய்வு",
    biomarkerSubtitle: "எது அதிகம், குறைவு அல்லது இயல்பானது என்பதைப் புரிந்து கொள்ளுங்கள்",
    noBiomarkers:
      "இந்த அறிக்கையிலிருந்து ஆய்வக பயோமார்க்கர்கள் நம்பகமாகக் கண்டறியப்படவில்லை.",
    uploadPromptBiomarkers:
      "பகுப்பாய்வுக்குப் பிறகு குறைவான, அதிகமான மற்றும் இயல்பான ஆய்வக முடிவுகள் இங்கே தோன்றும்.",
    referenceRange: "குறிப்பு வரம்பு:",

    statusHigh: "அதிகம்",
    statusLow: "குறைவு",
    statusNormal: "இயல்பானது",
    statusUnknown: "தெரியவில்லை",

    patternsTitle: "கண்டறியப்பட்ட வடிவங்கள்",
    patternsSubtitle: "உங்கள் அறிக்கை கண்டுபிடிப்புகளுக்கிடையிலான உறவுகள்",
    noPatterns:
      "கிடைக்கும் முடிவுகளிலிருந்து முக்கியமான வடிவங்கள் கண்டறியப்படவில்லை.",
    uploadPromptPatterns:
      "உங்கள் அறிக்கையிலிருந்து கண்டறியப்பட்ட முக்கிய வடிவங்கள் இங்கே தோன்றும்.",

    concernTitle: "இது எவ்வளவு கவலைக்குரியது?",
    concernSubtitle: "எதில் கவனம் தேவை என்பதைப் புரிந்து கொள்ளுங்கள்",
    waitingForAnalysis: "அறிக்கை பகுப்பாய்வுக்காகக் காத்திருக்கிறது",
    waitingDescription:
      "கண்டுபிடிப்புகளை மதிப்பீடு செய்து, மருத்துவ பின்தொடர்வு ஏன் தேவை அல்லது தேவையில்லை என்பதை விளக்கும்.",

    knowledgeTitle: "AI அறிவு பகுப்பாய்வு",
    knowledgeSubtitle: "உங்கள் கண்டுபிடிப்புகள் பற்றிய தொடர்புடைய மருத்துவ தகவல்",
    noKnowledge:
      "கண்டறியப்பட்ட கண்டுபிடிப்புகளுக்கு தொடர்புடைய மருத்துவ அறிவு கிடைக்கவில்லை.",
    uploadPromptKnowledge:
      "AI அறிவுத் தளத்திலிருந்து பெறப்பட்ட தொடர்புடைய மருத்துவ அறிவு இங்கே தோன்றும்.",
    relatedTo: "தொடர்புடையது:",
    reportFinding: "அறிக்கை கண்டுபிடிப்பு",
    source: "ஆதாரம்:",

    doctorTitle: "உங்கள் மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்",
    doctorSubtitle: "உங்கள் அறிக்கையின் அடிப்படையிலான பயனுள்ள கேள்விகள்",
    defaultQ1: "என் அறிக்கை கண்டுபிடிப்புகளின் அர்த்தம் என்ன?",
    defaultQ2: "எனக்கு கூடுதல் பரிசோதனைகள் தேவையா?",
    defaultQ3: "இந்த கண்டுபிடிப்புகளுக்கு என்ன காரணமாக இருக்கும்?",
    defaultQ4: "எனக்கு பின்தொடர் சந்திப்பு தேவையா?",

    chatbotTitle: "உங்கள் அறிக்கை பற்றி கேளுங்கள்",
    chatbotSubtitle: "அறிமுகமில்லாத மருத்துவ சொற்கள் மற்றும் கண்டுபிடிப்புகள் பற்றி கேள்விகள் கேளுங்கள்.",
    chatbotWelcome:
      "👋 உங்கள் அறிக்கையை பதிவேற்றவும், அறிமுகமில்லாத மருத்துவ சொற்கள் மற்றும் கண்டுபிடிப்புகளை விளக்க நான் உதவுவேன்.",
    chatPlaceholder: "உங்கள் அறிக்கை பற்றி ஏதாவது கேளுங்கள்...",
    sendButton: "அனுப்பு",

    disclaimerTitle: "மருத்துவ மறுப்பு",
    disclaimerText:
      "இந்தக் கருவி கல்வித் தகவலை வழங்குகிறது, இது மருத்துவ நோயறிதல் அல்ல. உங்கள் அறிகுறிகள், மருத்துவ வரலாறு மற்றும் பிற மருத்துவத் தகவல்களைக் கருத்தில் கொள்ளக்கூடிய தகுதியான சுகாதார நிபுணருடன் முடிவுகளை விவாதிக்க வேண்டும்.",
  },

  // ───────────────────────────────────────────────
  // KANNADA
  // ───────────────────────────────────────────────
  kn: {
    welcomeTitle: "AI ನೊಂದಿಗೆ ನಿಮ್ಮ ಆರೋಗ್ಯ ವರದಿಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",
    welcomeSubtitle: "ಬಯೋಮಾರ್ಕರ್‌ಗಳನ್ನು ಹೊರತೆಗೆಯಲು ಮತ್ತು ಫಲಿತಾಂಶಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲು ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",
    filterAll: "ಎಲ್ಲಾ ಫಲಿತಾಂಶಗಳು",
    filterAttention: "ಗಮನ ಬೇಕು",
    filterNormal: "ಸಾಮಾನ್ಯ",
    filterUnknown: "ವರ್ಗೀಕರಿಸದ",
    reportOverview: "ವರದಿ ಅವಲೋಕನ",
    reportTypeLabel: "ವರದಿ ಪ್ರಕಾರ",
    labReport: "ಪ್ರಯೋಗಾಲಯ ವಿಶ್ಲೇಷಣೆ",
    imagingReport: "ಇಮೇಜಿಂಗ್ ಸ್ಕ್ಯಾನ್",
    generalReport: "ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ವರದಿ",
    summaryMetrics: "ಫಲಿತಾಂಶಗಳ ಸಾರಾಂಶ",
    dropToUpload: "ನಿಮ್ಮ PDF ಫೈಲ್ ಅನ್ನು ಇಲ್ಲಿ ಬಿಡಿ",
    clickOrDrag: "ಬ್ರೌಸ್ ಮಾಡಲು ಕ್ಲಿಕ್ ಮಾಡಿ ಅಥವಾ PDF ಅನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ",
    supportedFormat: "ಬೆಂಬಲಿತ ಫಾರ್ಮ್ಯಾಟ್: 25 MB ವರೆಗೆ PDF",
    changeFile: "ಫೈಲ್ ಬದಲಾಯಿಸಿ",
    pageLabel: "ಪುಟ",
    doctorNote: "ನಿಮ್ಮ ವೈದ್ಯರೊಂದಿಗೆ ಚರ್ಚಿಸಲು ಈ ಪ್ರಶ್ನೆಗಳನ್ನು ನಿಮ್ಮ ಮುಂದಿನ ಭೇಟಿಗೆ ಕೊಂಡೊಯ್ಯಿರಿ.",
    resultsFound: "ಬಯೋಮಾರ್ಕರ್‌ಗಳು ಕಂಡುಬಂದಿವೆ",
    observationsFound: "ಇಮೇಜಿಂಗ್ ಫಲಿತಾಂಶಗಳು",
    patternsDetected: "ನಮೂನೆಗಳು ಪತ್ತೆಯಾಗಿವೆ",

    appTitle: "AI ಆರೋಗ್ಯ ವರದಿ ವಿಶ್ಲೇಷಕ",
    appSubtitle: "ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವರದಿಗಳನ್ನು ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ.",

    uploadTitle: "ನಿಮ್ಮ ವೈದ್ಯಕೀಯ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    uploadDescription:
      "ನಿಮ್ಮ ವೈದ್ಯಕೀಯ PDF ಅನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಮತ್ತು ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳ ಸರಳ ವಿವರಣೆಯನ್ನು ಪಡೆಯಿರಿ.",
    choosePdf: "ಒಂದು PDF ವರದಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ",
    pdfSelected: "PDF ಯಶಸ್ವಿಯಾಗಿ ಆಯ್ಕೆಯಾಗಿದೆ",
    clickToBrowse: "ನಿಮ್ಮ ಫೈಲ್‌ಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ",
    languageLabel: "🌐 ಭಾಷೆ",
    analyzeButton: "ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸಿ →",
    analyzingButton: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",

    selectPdfError: "ದಯವಿಟ್ಟು ಒಂದು PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ.",
    selectPdfFirst: "ದಯವಿಟ್ಟು ಮೊದಲು ಒಂದು ವೈದ್ಯಕೀಯ PDF ಆಯ್ಕೆಮಾಡಿ.",
    reportSuccess: "ವರದಿ ಯಶಸ್ವಿಯಾಗಿ ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ.",
    processingError: "ವರದಿಯನ್ನು ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲು ವಿಫಲವಾಗಿದೆ.",
    genericError: "ವರದಿಯನ್ನು ವಿಶ್ಲೇಷಿಸುವಾಗ ಏನೋ ತಪ್ಪಾಗಿದೆ.",

    yourReport: "ನಿಮ್ಮ ವರದಿ",

    impressionTitle: "ಒಟ್ಟಾರೆ ಅಭಿಪ್ರಾಯ",
    impressionSubtitle: "ನಿಮ್ಮ ವರದಿಯ ಸರಳ ಭಾಷೆಯಲ್ಲಿ ಅರ್ಥ",
    noImpression: "ಈ ವರದಿಯಲ್ಲಿ ಸ್ಪಷ್ಟ ಅಭಿಪ್ರಾಯ ಗುರುತಿಸಲಾಗಿಲ್ಲ.",
    uploadPromptImpression:
      "ಮುಖ್ಯ ಫಲಿತಾಂಶಗಳ ಸಾರಾಂಶ ನೋಡಲು ವೈದ್ಯಕೀಯ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.",

    imagingTitle: "ಇಮೇಜಿಂಗ್ ಫಲಿತಾಂಶಗಳು",
    imagingSubtitle: "ನಿಮ್ಮ ಸ್ಕ್ಯಾನ್‌ನಲ್ಲಿ ಗುರುತಿಸಲಾದ ಮುಖ್ಯ ಅವಲೋಕನಗಳು",
    noImagingFindings:
      "ಅಂಗ-ನಿರ್ದಿಷ್ಟ ಫಲಿತಾಂಶಗಳನ್ನು ವಿಶ್ವಾಸಾರ್ಹವಾಗಿ ಗುರುತಿಸಲಾಗಿಲ್ಲ. ಮೂಲ ಇಮೇಜಿಂಗ್ ವರದಿಯನ್ನು ನೋಡಿ.",

    biomarkerTitle: "ಬಯೋಮಾರ್ಕರ್ ವಿಶ್ಲೇಷಣೆ",
    biomarkerSubtitle: "ಯಾವುದು ಹೆಚ್ಚು, ಕಡಿಮೆ ಅಥವಾ ಸಾಮಾನ್ಯ ಎಂಬುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",
    noBiomarkers:
      "ಈ ವರದಿಯಿಂದ ಪ್ರಯೋಗಾಲಯ ಬಯೋಮಾರ್ಕರ್‌ಗಳನ್ನು ವಿಶ್ವಾಸಾರ್ಹವಾಗಿ ಗುರುತಿಸಲಾಗಿಲ್ಲ.",
    uploadPromptBiomarkers:
      "ವಿಶ್ಲೇಷಣೆಯ ನಂತರ ಕಡಿಮೆ, ಹೆಚ್ಚು ಮತ್ತು ಸಾಮಾನ್ಯ ಪ್ರಯೋಗಾಲಯ ಫಲಿತಾಂಶಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.",
    referenceRange: "ಉಲ್ಲೇಖ ವ್ಯಾಪ್ತಿ:",

    statusHigh: "ಹೆಚ್ಚು",
    statusLow: "ಕಡಿಮೆ",
    statusNormal: "ಸಾಮಾನ್ಯ",
    statusUnknown: "ತಿಳಿದಿಲ್ಲ",

    patternsTitle: "ಪತ್ತೆಯಾದ ನಮೂನೆಗಳು",
    patternsSubtitle: "ನಿಮ್ಮ ವರದಿ ಫಲಿತಾಂಶಗಳ ನಡುವಿನ ಸಂಬಂಧಗಳು",
    noPatterns:
      "ಲಭ್ಯವಿರುವ ಫಲಿತಾಂಶಗಳಿಂದ ಮಹತ್ವದ ನಮೂನೆಗಳು ಗುರುತಿಸಲಾಗಿಲ್ಲ.",
    uploadPromptPatterns:
      "ನಿಮ್ಮ ವರದಿಯಿಂದ ಗುರುತಿಸಲಾದ ಮುಖ್ಯ ನಮೂನೆಗಳು ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತವೆ.",

    concernTitle: "ಇದು ಎಷ್ಟು ಆತಂಕಕಾರಿ?",
    concernSubtitle: "ಯಾವುದಕ್ಕೆ ಗಮನ ಬೇಕು ಎಂಬುದನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ",
    waitingForAnalysis: "ವರದಿ ವಿಶ್ಲೇಷಣೆಗಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ",
    waitingDescription:
      "ಫಲಿತಾಂಶಗಳನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ, ವೈದ್ಯಕೀಯ ಅನುಸರಣೆ ಏಕೆ ಅಗತ್ಯ ಅಥವಾ ಅಗತ್ಯವಿಲ್ಲ ಎಂಬುದನ್ನು ವಿವರಿಸುತ್ತದೆ.",

    knowledgeTitle: "AI ಜ್ಞಾನ ವಿಶ್ಲೇಷಣೆ",
    knowledgeSubtitle: "ನಿಮ್ಮ ಫಲಿತಾಂಶಗಳ ಬಗ್ಗೆ ಸಂಬಂಧಿತ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿ",
    noKnowledge:
      "ಗುರುತಿಸಲಾದ ಫಲಿತಾಂಶಗಳಿಗೆ ಸಂಬಂಧಿತ ವೈದ್ಯಕೀಯ ಜ್ಞಾನ ಲಭ್ಯವಿಲ್ಲ.",
    uploadPromptKnowledge:
      "AI ಜ್ಞಾನ ಆಧಾರದಿಂದ ಪಡೆದ ಸಂಬಂಧಿತ ವೈದ್ಯಕೀಯ ಜ್ಞಾನ ಇಲ್ಲಿ ಕಾಣಿಸಿಕೊಳ್ಳುತ್ತದೆ.",
    relatedTo: "ಸಂಬಂಧಿತ:",
    reportFinding: "ವರದಿ ಫಲಿತಾಂಶ",
    source: "ಮೂಲ:",

    doctorTitle: "ನಿಮ್ಮ ವೈದ್ಯರನ್ನು ಕೇಳಬೇಕಾದ ಪ್ರಶ್ನೆಗಳು",
    doctorSubtitle: "ನಿಮ್ಮ ವರದಿಯ ಆಧಾರದ ಮೇಲೆ ಉಪಯುಕ್ತ ಪ್ರಶ್ನೆಗಳು",
    defaultQ1: "ನನ್ನ ವರದಿ ಫಲಿತಾಂಶಗಳ ಅರ್ಥವೇನು?",
    defaultQ2: "ನನಗೆ ಯಾವುದಾದರೂ ಹೆಚ್ಚುವರಿ ಪರೀಕ್ಷೆಗಳು ಬೇಕಾ?",
    defaultQ3: "ಈ ಫಲಿತಾಂಶಗಳಿಗೆ ಕಾರಣವೇನು?",
    defaultQ4: "ನನಗೆ ಅನುಸರಣೆ ಭೇಟಿ ಬೇಕಾ?",

    chatbotTitle: "ನಿಮ್ಮ ವರದಿಯ ಬಗ್ಗೆ ಕೇಳಿ",
    chatbotSubtitle: "ಅಪರಿಚಿತ ವೈದ್ಯಕೀಯ ಪದಗಳು ಮತ್ತು ಫಲಿತಾಂಶಗಳ ಬಗ್ಗೆ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.",
    chatbotWelcome:
      "👋 ನಿಮ್ಮ ವರದಿಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಅಪರಿಚಿತ ವೈದ್ಯಕೀಯ ಪದಗಳು ಮತ್ತು ಫಲಿತಾಂಶಗಳನ್ನು ವಿವರಿಸಲು ನಾನು ಸಹಾಯ ಮಾಡುತ್ತೇನೆ.",
    chatPlaceholder: "ನಿಮ್ಮ ವರದಿಯ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ...",
    sendButton: "ಕಳುಹಿಸಿ",

    disclaimerTitle: "ವೈದ್ಯಕೀಯ ನಿರಾಕರಣೆ",
    disclaimerText:
      "ಈ ಸಾಧನವು ಶೈಕ್ಷಣಿಕ ಮಾಹಿತಿಯನ್ನು ಒದಗಿಸುತ್ತದೆ ಮತ್ತು ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ. ಫಲಿತಾಂಶಗಳನ್ನು ನಿಮ್ಮ ರೋಗಲಕ್ಷಣಗಳು, ವೈದ್ಯಕೀಯ ಇತಿಹಾಸ ಮತ್ತು ಇತರ ವೈದ್ಯಕೀಯ ಮಾಹಿತಿಯನ್ನು ಪರಿಗಣಿಸಬಲ್ಲ ಅರ್ಹ ಆರೋಗ್ಯ ವೃತ್ತಿಪರರೊಂದಿಗೆ ಚರ್ಚಿಸಬೇಕು.",
  },

  // ───────────────────────────────────────────────
  // MALAYALAM
  // ───────────────────────────────────────────────
  ml: {
    welcomeTitle: "AI ഉപയോഗിച്ച് നിങ്ങളുടെ ആരോഗ്യ റിപ്പോർട്ടുകൾ മനസ്സിലാക്കുക",
    welcomeSubtitle: "ബയോമാർക്കറുകൾ വേർതിരിച്ചെടുക്കാനും ഫലങ്ങൾ ലളിതമായി മനസ്സിലാക്കാനും നിങ്ങളുടെ മെഡിക്കൽ റിപ്പോർട്ട് അപ്‌ലോഡ് ചെയ്യുക.",
    filterAll: "എല്ലാ ഫലങ്ങളും",
    filterAttention: "ശ്രദ്ധ ആവശ്യം",
    filterNormal: "സാധാരണം",
    filterUnknown: "വർഗ്ഗീകരിക്കാത്തവ",
    reportOverview: "റിപ്പോർട്ട് അവലോകനം",
    reportTypeLabel: "റിപ്പോർട്ട് തരം",
    labReport: "ലാബ് വിശകലനം",
    imagingReport: "ഇമേജിംഗ് സ്കാൻ",
    generalReport: "പൊതു ആരോഗ്യ റിപ്പോർട്ട്",
    summaryMetrics: "ഫലങ്ങളുടെ സംഗ്രഹം",
    dropToUpload: "നിങ്ങളുടെ PDF ഫയൽ ഇവിടെ ഇടുക",
    clickOrDrag: "ബ്രൗസ് ചെയ്യാൻ ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ PDF ഇവിടെ വലിച്ചിടുക",
    supportedFormat: "പിന്തുണയ്ക്കുന്ന ഫോർമാറ്റ്: 25 MB വരെയുള്ള PDF",
    changeFile: "ഫയൽ മാറ്റുക",
    pageLabel: "പേജ്",
    doctorNote: "ഡോക്ടറുമായി ചർച്ച ചെയ്യുന്നതിനായി ഈ ചോദ്യങ്ങൾ നിങ്ങളുടെ അടുത്ത സന്ദർശനത്തിൽ കൊണ്ടുപോകുക.",
    resultsFound: "ബയോമാർക്കറുകൾ കണ്ടെത്തി",
    observationsFound: "ഇമേജിംഗ് കണ്ടെത്തലുകൾ",
    patternsDetected: "പാറ്റേണുകൾ കണ്ടെത്തി",

    appTitle: "AI ആരോഗ്യ റിപ്പോർട്ട് വ്യാഖ്യാതാവ്",
    appSubtitle: "നിങ്ങളുടെ മെഡിക്കൽ റിപ്പോർട്ടുകൾ ലളിതമായ ഭാഷയിൽ മനസ്സിലാക്കുക.",

    uploadTitle: "നിങ്ങളുടെ മെഡിക്കൽ റിപ്പോർട്ട് അപ്‌ലോഡ് ചെയ്യുക",
    uploadDescription:
      "നിങ്ങളുടെ മെഡിക്കൽ PDF അപ്‌ലോഡ് ചെയ്ത് ഫലങ്ങളുടെ ലളിതമായ വിശദീകരണം നേടുക.",
    choosePdf: "ഒരു PDF റിപ്പോർട്ട് തിരഞ്ഞെടുക്കുക",
    pdfSelected: "PDF വിജയകരമായി തിരഞ്ഞെടുത്തു",
    clickToBrowse: "നിങ്ങളുടെ ഫയലുകൾ ബ്രൗസ് ചെയ്യാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക",
    languageLabel: "🌐 ഭാഷ",
    analyzeButton: "റിപ്പോർട്ട് വിശകലനം ചെയ്യുക →",
    analyzingButton: "വിശകലനം ചെയ്യുന്നു...",

    selectPdfError: "ദയവായി ഒരു PDF ഫയൽ തിരഞ്ഞെടുക്കുക.",
    selectPdfFirst: "ദയവായി ആദ്യം ഒരു മെഡിക്കൽ PDF തിരഞ്ഞെടുക്കുക.",
    reportSuccess: "റിപ്പോർട്ട് വിജയകരമായി വിശകലനം ചെയ്തു.",
    processingError: "റിപ്പോർട്ട് പ്രോസസ്സ് ചെയ്യുന്നതിൽ പരാജയപ്പെട്ടു.",
    genericError: "റിപ്പോർട്ട് വിശകലനം ചെയ്യുമ്പോൾ എന്തോ തെറ്റ് സംഭവിച്ചു.",

    yourReport: "നിങ്ങളുടെ റിപ്പോർട്ട്",

    impressionTitle: "മൊത്തത്തിലുള്ള അഭിപ്രായം",
    impressionSubtitle: "നിങ്ങളുടെ റിപ്പോർട്ട് ലളിതമായ ഭാഷയിൽ എന്താണ് അർത്ഥമാക്കുന്നത്",
    noImpression: "ഈ റിപ്പോർട്ടിൽ വ്യക്തമായ അഭിപ്രായം കണ്ടെത്തിയില്ല.",
    uploadPromptImpression:
      "പ്രധാന കണ്ടെത്തലുകളുടെ സംഗ്രഹം കാണാൻ ഒരു മെഡിക്കൽ റിപ്പോർട്ട് അപ്‌ലോഡ് ചെയ്യുക.",

    imagingTitle: "ഇമേജിംഗ് കണ്ടെത്തലുകൾ",
    imagingSubtitle: "നിങ്ങളുടെ സ്കാനിൽ കണ്ടെത്തിയ പ്രധാന നിരീക്ഷണങ്ങൾ",
    noImagingFindings:
      "അവയവ-നിർദ്ദിഷ്ട കണ്ടെത്തലുകൾ വിശ്വസനീയമായി കണ്ടെത്തിയില്ല. യഥാർത്ഥ ഇമേജിംഗ് റിപ്പോർട്ട് കാണുക.",

    biomarkerTitle: "ബയോമാർക്കർ വിശകലനം",
    biomarkerSubtitle: "ഏതാണ് ഉയർന്നത്, കുറഞ്ഞത് അല്ലെങ്കിൽ സാധാരണമെന്ന് മനസ്സിലാക്കുക",
    noBiomarkers:
      "ഈ റിപ്പോർട്ടിൽ നിന്ന് ലാബ് ബയോമാർക്കറുകൾ വിശ്വസനീയമായി കണ്ടെത്തിയില്ല.",
    uploadPromptBiomarkers:
      "വിശകലനത്തിന് ശേഷം കുറഞ്ഞ, ഉയർന്ന, സാധാരണ ലാബ് ഫലങ്ങൾ ഇവിടെ കാണിക്കും.",
    referenceRange: "റഫറൻസ് ശ്രേണി:",

    statusHigh: "ഉയർന്നത്",
    statusLow: "കുറഞ്ഞത്",
    statusNormal: "സാധാരണം",
    statusUnknown: "അജ്ഞാതം",

    patternsTitle: "കണ്ടെത്തിയ പാറ്റേണുകൾ",
    patternsSubtitle: "നിങ്ങളുടെ റിപ്പോർട്ട് കണ്ടെത്തലുകൾ തമ്മിലുള്ള ബന്ധങ്ങൾ",
    noPatterns:
      "ലഭ്യമായ ഫലങ്ങളിൽ നിന്ന് പ്രധാന പാറ്റേണുകൾ കണ്ടെത്തിയില്ല.",
    uploadPromptPatterns:
      "നിങ്ങളുടെ റിപ്പോർട്ടിൽ നിന്ന് കണ്ടെത്തിയ പ്രധാന പാറ്റേണുകൾ ഇവിടെ കാണിക്കും.",

    concernTitle: "ഇത് എത്രത്തോളം ആശങ്കാജനകമാണ്?",
    concernSubtitle: "എന്തിന് ശ്രദ്ധ ആവശ്യമെന്ന് മനസ്സിലാക്കുക",
    waitingForAnalysis: "റിപ്പോർട്ട് വിശകലനത്തിനായി കാത്തിരിക്കുന്നു",
    waitingDescription:
      "കണ്ടെത്തലുകൾ വിലയിരുത്തി, മെഡിക്കൽ ഫോളോ-അപ്പ് ആവശ്യമോ അല്ലയോ എന്ന് വിശദീകരിക്കും.",

    knowledgeTitle: "AI വിജ്ഞാന വിശകലനം",
    knowledgeSubtitle: "നിങ്ങളുടെ കണ്ടെത്തലുകളെ കുറിച്ചുള്ള പ്രസക്ത മെഡിക്കൽ വിവരങ്ങൾ",
    noKnowledge:
      "കണ്ടെത്തിയ ഫലങ്ങൾക്ക് പ്രസക്ത മെഡിക്കൽ വിജ്ഞാനം ലഭ്യമല്ല.",
    uploadPromptKnowledge:
      "AI വിജ്ഞാന ശേഖരത്തിൽ നിന്ന് ലഭിച്ച പ്രസക്ത മെഡിക്കൽ വിജ്ഞാനം ഇവിടെ കാണിക്കും.",
    relatedTo: "ബന്ധപ്പെട്ടത്:",
    reportFinding: "റിപ്പോർട്ട് കണ്ടെത്തൽ",
    source: "ഉറവിടം:",

    doctorTitle: "നിങ്ങളുടെ ഡോക്ടറോട് ചോദിക്കേണ്ട ചോദ്യങ്ങൾ",
    doctorSubtitle: "നിങ്ങളുടെ റിപ്പോർട്ടിന്റെ അടിസ്ഥാനത്തിലുള്ള ഉപയോഗപ്രദമായ ചോദ്യങ്ങൾ",
    defaultQ1: "എന്റെ റിപ്പോർട്ട് കണ്ടെത്തലുകളുടെ അർത്ഥമെന്താണ്?",
    defaultQ2: "എനിക്ക് അധിക പരിശോധനകൾ ആവശ്യമുണ്ടോ?",
    defaultQ3: "ഈ കണ്ടെത്തലുകൾക്ക് കാരണമെന്ത്?",
    defaultQ4: "എനിക്ക് ഫോളോ-അപ്പ് അപ്പോയിന്റ്‌മെന്റ് ആവശ്യമുണ്ടോ?",

    chatbotTitle: "നിങ്ങളുടെ റിപ്പോർട്ടിനെ കുറിച്ച് ചോദിക്കുക",
    chatbotSubtitle: "അപരിചിതമായ മെഡിക്കൽ പദങ്ങളെയും കണ്ടെത്തലുകളെയും കുറിച്ച് ചോദ്യങ്ങൾ ചോദിക്കുക.",
    chatbotWelcome:
      "👋 നിങ്ങളുടെ റിപ്പോർട്ട് അപ്‌ലോഡ് ചെയ്യുക, അപരിചിതമായ മെഡിക്കൽ പദങ്ങളും കണ്ടെത്തലുകളും വിശദീകരിക്കാൻ ഞാൻ സഹായിക്കാം.",
    chatPlaceholder: "നിങ്ങളുടെ റിപ്പോർട്ടിനെ കുറിച്ച് എന്തെങ്കിലും ചോദിക്കുക...",
    sendButton: "അയയ്ക്കുക",

    disclaimerTitle: "മെഡിക്കൽ നിരാകരണം",
    disclaimerText:
      "ഈ ഉപകരണം വിദ്യാഭ്യാസ വിവരങ്ങൾ നൽകുന്നു, ഇത് ഒരു മെഡിക്കൽ രോഗനിർണയമല്ല. നിങ്ങളുടെ ലക്ഷണങ്ങൾ, മെഡിക്കൽ ചരിത്രം, മറ്റ് ക്ലിനിക്കൽ വിവരങ്ങൾ എന്നിവ പരിഗണിക്കാൻ കഴിയുന്ന യോഗ്യതയുള്ള ആരോഗ്യ പ്രൊഫഷണലുമായി ഫലങ്ങൾ ചർച്ച ചെയ്യണം.",
  },

  // ───────────────────────────────────────────────
  // MARATHI
  // ───────────────────────────────────────────────
  mr: {
    welcomeTitle: "AI सह तुमचे आरोग्य अहवाल समजून घ्या",
    welcomeSubtitle: "बायोमार्कर काढण्यासाठी आणि निकाल समजून घेण्यासाठी तुमचा वैद्यकीय अहवाल अपलोड करा.",
    filterAll: "सर्व निकाल",
    filterAttention: "लक्ष देणे आवश्यक",
    filterNormal: "सामान्य",
    filterUnknown: "अवर्गीकृत",
    reportOverview: "अहवाल विहंगावलोकन",
    reportTypeLabel: "अहवाल प्रकार",
    labReport: "प्रयोगशाळा विश्लेषण",
    imagingReport: "इमेजिंग स्कॅन",
    generalReport: "सामान्य आरोग्य अहवाल",
    summaryMetrics: "निकाल सारांश",
    dropToUpload: "तुमची PDF फाइल येथे टाका",
    clickOrDrag: "ब्राउझ करण्यासाठी क्लिक करा किंवा PDF येथे ड्रॅग करा",
    supportedFormat: "समर्थित फॉरमॅट: 25 MB पर्यंत PDF",
    changeFile: "फाइल बदला",
    pageLabel: "पृष्ठ",
    doctorNote: "तुमच्या डॉक्टरांशी चर्चा करण्यासाठी हे प्रश्न तुमच्या पुढील भेटीत सोबत ठेवा.",
    resultsFound: "बायोमार्कर आढळले",
    observationsFound: "इमेजिंग निष्कर्ष",
    patternsDetected: "पॅटर्न आढळले",

    appTitle: "AI आरोग्य अहवाल विश्लेषक",
    appSubtitle: "तुमचे वैद्यकीय अहवाल सोप्या भाषेत समजून घ्या.",

    uploadTitle: "तुमचा वैद्यकीय अहवाल अपलोड करा",
    uploadDescription:
      "तुमची वैद्यकीय PDF अपलोड करा आणि तुमच्या निकालांचे सोपे स्पष्टीकरण मिळवा.",
    choosePdf: "एक PDF अहवाल निवडा",
    pdfSelected: "PDF यशस्वीरित्या निवडली गेली",
    clickToBrowse: "तुमच्या फाइल्स ब्राउझ करण्यासाठी इथे क्लिक करा",
    languageLabel: "🌐 भाषा",
    analyzeButton: "अहवाल विश्लेषण करा →",
    analyzingButton: "विश्लेषण सुरू आहे...",

    selectPdfError: "कृपया एक PDF फाइल निवडा.",
    selectPdfFirst: "कृपया आधी एक वैद्यकीय PDF निवडा.",
    reportSuccess: "अहवालाचे विश्लेषण यशस्वीरित्या झाले.",
    processingError: "अहवाल प्रक्रिया करण्यात अयशस्वी.",
    genericError: "अहवालाचे विश्लेषण करताना काहीतरी चुकले.",

    yourReport: "तुमचा अहवाल",

    impressionTitle: "एकूण निष्कर्ष",
    impressionSubtitle: "तुमच्या अहवालाचा सोप्या भाषेत अर्थ",
    noImpression: "या अहवालात स्पष्ट निष्कर्ष ओळखला गेला नाही.",
    uploadPromptImpression:
      "महत्त्वाच्या निष्कर्षांचा सारांश पाहण्यासाठी वैद्यकीय अहवाल अपलोड करा.",

    imagingTitle: "इमेजिंग निष्कर्ष",
    imagingSubtitle: "तुमच्या स्कॅनमध्ये ओळखलेली महत्त्वाची निरीक्षणे",
    noImagingFindings:
      "अवयव-विशिष्ट निष्कर्ष विश्वासार्हपणे ओळखले गेले नाहीत. कृपया मूळ इमेजिंग अहवाल पहा.",

    biomarkerTitle: "बायोमार्कर विश्लेषण",
    biomarkerSubtitle: "कोणते जास्त, कमी किंवा सामान्य आहे ते समजून घ्या",
    noBiomarkers:
      "या अहवालातून प्रयोगशाळा बायोमार्कर्स विश्वासार्हपणे ओळखले गेले नाहीत.",
    uploadPromptBiomarkers:
      "विश्लेषणानंतर कमी, जास्त आणि सामान्य प्रयोगशाळा निकाल येथे दिसतील.",
    referenceRange: "संदर्भ श्रेणी:",

    statusHigh: "जास्त",
    statusLow: "कमी",
    statusNormal: "सामान्य",
    statusUnknown: "अज्ञात",

    patternsTitle: "शोधलेले पॅटर्न",
    patternsSubtitle: "तुमच्या अहवालातील निष्कर्षांमधील संबंध",
    noPatterns: "उपलब्ध निकालांमधून महत्त्वाचे पॅटर्न ओळखले गेले नाहीत.",
    uploadPromptPatterns:
      "तुमच्या अहवालातून ओळखलेले महत्त्वाचे पॅटर्न येथे दिसतील.",

    concernTitle: "हे किती चिंताजनक आहे?",
    concernSubtitle: "कशाकडे लक्ष देणे आवश्यक आहे ते समजून घ्या",
    waitingForAnalysis: "अहवाल विश्लेषणाची प्रतीक्षा",
    waitingDescription:
      "प्रणाली निष्कर्षांचे मूल्यांकन करेल आणि वैद्यकीय पाठपुरावा का आवश्यक आहे किंवा नाही हे स्पष्ट करेल.",

    knowledgeTitle: "AI ज्ञान विश्लेषण",
    knowledgeSubtitle: "तुमच्या निष्कर्षांबद्दल संबंधित वैद्यकीय माहिती",
    noKnowledge:
      "ओळखल्या गेलेल्या निष्कर्षांसाठी संबंधित वैद्यकीय ज्ञान मिळाले नाही.",
    uploadPromptKnowledge:
      "AI ज्ञान भांडारातून मिळालेले संबंधित वैद्यकीय ज्ञान येथे दिसेल.",
    relatedTo: "संबंधित:",
    reportFinding: "अहवाल निष्कर्ष",
    source: "स्रोत:",

    doctorTitle: "तुमच्या डॉक्टरांना विचारायचे प्रश्न",
    doctorSubtitle: "तुमच्या अहवालावर आधारित उपयुक्त प्रश्न",
    defaultQ1: "माझ्या अहवालाच्या निष्कर्षांचा अर्थ काय आहे?",
    defaultQ2: "मला काही अतिरिक्त चाचण्यांची गरज आहे का?",
    defaultQ3: "या निष्कर्षांचे कारण काय असू शकते?",
    defaultQ4: "मला फॉलो-अप भेटीची गरज आहे का?",

    chatbotTitle: "तुमच्या अहवालाबद्दल विचारा",
    chatbotSubtitle: "अपरिचित वैद्यकीय संज्ञा आणि निष्कर्षांबद्दल प्रश्न विचारा.",
    chatbotWelcome:
      "👋 तुमचा अहवाल अपलोड करा आणि अपरिचित वैद्यकीय संज्ञा आणि निष्कर्ष समजावून सांगण्यात मी मदत करेन.",
    chatPlaceholder: "तुमच्या अहवालाबद्दल काहीतरी विचारा...",
    sendButton: "पाठवा",

    disclaimerTitle: "वैद्यकीय अस्वीकरण",
    disclaimerText:
      "हे साधन शैक्षणिक माहिती प्रदान करते आणि हे वैद्यकीय निदान नाही. तुमच्या लक्षणे, वैद्यकीय इतिहास आणि इतर नैदानिक माहिती विचारात घेऊ शकणाऱ्या पात्र आरोग्य व्यावसायिकांशी निकालांवर चर्चा करावी.",
  },

  // ───────────────────────────────────────────────
  // BENGALI
  // ───────────────────────────────────────────────
  bn: {
    welcomeTitle: "AI দিয়ে আপনার স্বাস্থ্য রিপোর্ট বুঝুন",
    welcomeSubtitle: "বায়োমার্কার বের করতে এবং ফলাফল বুঝতে আপনার চিকিৎসা রিপোর্ট আপলোড করুন।",
    filterAll: "সমস্ত ফলাফল",
    filterAttention: "মনোযোগ প্রয়োজন",
    filterNormal: "স্বাভাবিক",
    filterUnknown: "অশ্রেণীবদ্ধ",
    reportOverview: "রিপোর্ট ওভারভিউ",
    reportTypeLabel: "রিপোর্টের ধরন",
    labReport: "ল্যাব বিশ্লেষণ",
    imagingReport: "ইমেজিং স্ক্যান",
    generalReport: "সাধারণ স্বাস্থ্য রিপোর্ট",
    summaryMetrics: "ফলাফলের সারাংশ",
    dropToUpload: "আপনার PDF ফাইল এখানে ফেলুন",
    clickOrDrag: "ব্রাউজ করতে ক্লিক করুন বা PDF এখানে টেনে আনুন",
    supportedFormat: "সমর্থিত ফর্ম্যাট: ২৫ MB পর্যন্ত PDF",
    changeFile: "ফাইল পরিবর্তন করুন",
    pageLabel: "পৃষ্ঠা",
    doctorNote: "আপনার ডাক্তারের সাথে আলোচনা করতে এই প্রশ্নগুলি পরবর্তী অ্যাপয়েন্টমেন্টে নিয়ে যান।",
    resultsFound: "বায়োমার্কার পাওয়া গেছে",
    observationsFound: "ইমেজিং পর্যবেক্ষণ",
    patternsDetected: "প্যাটার্ন চিহ্নিত হয়েছে",

    appTitle: "AI স্বাস্থ্য রিপোর্ট বিশ্লেষক",
    appSubtitle: "আপনার চিকিৎসা রিপোর্ট সরল ভাষায় বুঝুন।",

    uploadTitle: "আপনার চিকিৎসা রিপোর্ট আপলোড করুন",
    uploadDescription:
      "আপনার চিকিৎসা PDF আপলোড করুন এবং ফলাফলের সহজ ব্যাখ্যা পান।",
    choosePdf: "একটি PDF রিপোর্ট বেছে নিন",
    pdfSelected: "PDF সফলভাবে নির্বাচিত হয়েছে",
    clickToBrowse: "আপনার ফাইল ব্রাউজ করতে এখানে ক্লিক করুন",
    languageLabel: "🌐 ভাষা",
    analyzeButton: "রিপোর্ট বিশ্লেষণ করুন →",
    analyzingButton: "বিশ্লেষণ চলছে...",

    selectPdfError: "অনুগ্রহ করে একটি PDF ফাইল নির্বাচন করুন।",
    selectPdfFirst: "অনুগ্রহ করে প্রথমে একটি চিকিৎসা PDF নির্বাচন করুন।",
    reportSuccess: "রিপোর্ট সফলভাবে বিশ্লেষণ করা হয়েছে।",
    processingError: "রিপোর্ট প্রসেস করতে ব্যর্থ।",
    genericError: "রিপোর্ট বিশ্লেষণ করার সময় কিছু ভুল হয়েছে।",

    yourReport: "আপনার রিপোর্ট",

    impressionTitle: "সামগ্রিক ধারণা",
    impressionSubtitle: "সরল ভাষায় আপনার রিপোর্টের অর্থ",
    noImpression: "এই রিপোর্টে কোনো স্পষ্ট ধারণা চিহ্নিত হয়নি।",
    uploadPromptImpression:
      "গুরুত্বপূর্ণ ফলাফলের সারাংশ দেখতে একটি চিকিৎসা রিপোর্ট আপলোড করুন।",

    imagingTitle: "ইমেজিং ফলাফল",
    imagingSubtitle: "আপনার স্ক্যানে চিহ্নিত গুরুত্বপূর্ণ পর্যবেক্ষণ",
    noImagingFindings:
      "অঙ্গ-নির্দিষ্ট ফলাফল নির্ভরযোগ্যভাবে চিহ্নিত হয়নি। মূল ইমেজিং রিপোর্ট দেখুন।",

    biomarkerTitle: "বায়োমার্কার বিশ্লেষণ",
    biomarkerSubtitle: "কোনটি বেশি, কম বা স্বাভাবিক তা বুঝুন",
    noBiomarkers:
      "এই রিপোর্ট থেকে ল্যাব বায়োমার্কার নির্ভরযোগ্যভাবে চিহ্নিত হয়নি।",
    uploadPromptBiomarkers:
      "বিশ্লেষণের পরে কম, বেশি এবং স্বাভাবিক ল্যাব ফলাফল এখানে দেখা যাবে।",
    referenceRange: "রেফারেন্স রেঞ্জ:",

    statusHigh: "বেশি",
    statusLow: "কম",
    statusNormal: "স্বাভাবিক",
    statusUnknown: "অজানা",

    patternsTitle: "শনাক্তকৃত প্যাটার্ন",
    patternsSubtitle: "আপনার রিপোর্টের ফলাফলগুলির মধ্যে সম্পর্ক",
    noPatterns:
      "উপলব্ধ ফলাফল থেকে কোনো গুরুত্বপূর্ণ প্যাটার্ন চিহ্নিত হয়নি।",
    uploadPromptPatterns:
      "আপনার রিপোর্ট থেকে চিহ্নিত গুরুত্বপূর্ণ প্যাটার্ন এখানে দেখা যাবে।",

    concernTitle: "এটা কতটা উদ্বেগজনক?",
    concernSubtitle: "কিসে মনোযোগ প্রয়োজন তা বুঝুন",
    waitingForAnalysis: "রিপোর্ট বিশ্লেষণের জন্য অপেক্ষা করছে",
    waitingDescription:
      "সিস্টেম ফলাফলগুলি মূল্যায়ন করবে এবং ব্যাখ্যা করবে কেন চিকিৎসা ফলো-আপ প্রয়োজন বা নয়।",

    knowledgeTitle: "AI জ্ঞান বিশ্লেষণ",
    knowledgeSubtitle: "আপনার ফলাফল সম্পর্কিত প্রাসঙ্গিক চিকিৎসা তথ্য",
    noKnowledge:
      "চিহ্নিত ফলাফলের জন্য প্রাসঙ্গিক চিকিৎসা জ্ঞান পাওয়া যায়নি।",
    uploadPromptKnowledge:
      "AI জ্ঞান ভান্ডার থেকে প্রাপ্ত প্রাসঙ্গিক চিকিৎসা জ্ঞান এখানে দেখা যাবে।",
    relatedTo: "সম্পর্কিত:",
    reportFinding: "রিপোর্ট ফলাফল",
    source: "উৎস:",

    doctorTitle: "আপনার ডাক্তারকে জিজ্ঞাসা করার প্রশ্ন",
    doctorSubtitle: "আপনার রিপোর্টের ভিত্তিতে দরকারি প্রশ্ন",
    defaultQ1: "আমার রিপোর্টের ফলাফলের অর্থ কী?",
    defaultQ2: "আমার কি কোনো অতিরিক্ত পরীক্ষা দরকার?",
    defaultQ3: "এই ফলাফলের কারণ কী হতে পারে?",
    defaultQ4: "আমার কি ফলো-আপ অ্যাপয়েন্টমেন্ট দরকার?",

    chatbotTitle: "আপনার রিপোর্ট সম্পর্কে জিজ্ঞাসা করুন",
    chatbotSubtitle: "অপরিচিত চিকিৎসা পরিভাষা ও ফলাফল সম্পর্কে প্রশ্ন করুন।",
    chatbotWelcome:
      "👋 আপনার রিপোর্ট আপলোড করুন, অপরিচিত চিকিৎসা পরিভাষা ও ফলাফল ব্যাখ্যা করতে আমি সাহায্য করব।",
    chatPlaceholder: "আপনার রিপোর্ট সম্পর্কে কিছু জিজ্ঞাসা করুন...",
    sendButton: "পাঠান",

    disclaimerTitle: "চিকিৎসা দাবিত্যাগ",
    disclaimerText:
      "এই সরঞ্জামটি শিক্ষামূলক তথ্য প্রদান করে এবং এটি চিকিৎসা রোগ নির্ণয় নয়। আপনার উপসর্গ, চিকিৎসা ইতিহাস এবং অন্যান্য ক্লিনিক্যাল তথ্য বিবেচনা করতে পারেন এমন যোগ্য স্বাস্থ্য পেশাদারের সাথে ফলাফল নিয়ে আলোচনা করা উচিত।",
  },
};

/**
 * Returns the translation dictionary for the given language code.
 * Falls back to English if the code is unrecognised.
 */
export function getTranslations(langCode) {
  const selected = translations[langCode] || {};
  return { ...translations.en, ...selected };
}

/**
 * Returns the localised status label for a biomarker status string.
 */
export function getStatusText(status, t) {
  if (status === "high") return t.statusHigh;
  if (status === "low") return t.statusLow;
  if (status === "normal") return t.statusNormal;
  return t.statusUnknown;
}

/**
 * Language metadata used by the selector dropdown.
 * value = ISO code sent to the backend.
 * label = native-script display name.
 */
export const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "te", label: "తెలుగు" },
  { value: "ta", label: "தமிழ்" },
  { value: "kn", label: "ಕನ್ನಡ" },
  { value: "ml", label: "മലയാളം" },
  { value: "mr", label: "मराठी" },
  { value: "bn", label: "বাংলা" },
];

export default translations;
