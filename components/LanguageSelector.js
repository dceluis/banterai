import React, { useState } from "react";
import { languages, getLanguageCode } from "../utils/lang";


const LanguageSelector = ({ updateLanguage }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  const handleChange = (e) => {
    setSelectedLanguage(e.target.value);
    updateLanguage(e.target.value);
  };

  return (
    <select value={selectedLanguage} onChange={handleChange}>
      {languages.map(language => (
        <option key={language} value={language}>
          {language}
        </option>
      ))}
    </select>
  );
};

export default LanguageSelector;
