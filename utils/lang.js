const languages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Russian",
  "Chinese",
  "Japanese",
  "Korean",
  "Arabic",
  "Hindi",
  "Urdu",
  "Bengali",
  "Punjabi",
];

const codes = {
  "English": "en-US",
  "Spanish": "es-ES",
  "French": "fr-FR",
  "German": "de-DE",
  "Italian": "it-IT",
  "Portuguese": "pt-PT",
  "Russian": "ru-RU",
  "Chinese": "zh-CN",
  "Japanese": "ja-JP",
  "Korean": "ko-KR",
  "Arabic": "ar-SA",
  "Hindi": "hi-IN",
  "Urdu": "ur-PK",
  "Bengali": "bn-BD",
  "Punjabi": "pa-IN",
};

const getLanguageCode = (language) => {
  return codes[language] || "en-US";
};

export { languages, getLanguageCode };
