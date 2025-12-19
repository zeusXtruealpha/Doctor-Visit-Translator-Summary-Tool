import React from 'react';

const LanguageSelector = ({ value, onChange, disabled }) => {
  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'tamil', name: 'Tamil (தமிழ்)', flag: '🇮🇳' },
    { code: 'hindi', name: 'Hindi (हिंदी)', flag: '🇮🇳' }
  ];

  return (
    <div className="card">
      <label htmlFor="targetLanguage" className="block elderly-text font-medium text-gray-700 mb-3">
        Select Output Language
      </label>
      
      <div className="grid grid-cols-1 gap-3">
        {languages.map((language) => (
          <label
            key={language.code}
            className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              value === language.code
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <input
              type="radio"
              name="targetLanguage"
              value={language.code}
              checked={value === language.code}
              onChange={(e) => onChange(e.target.value)}
              disabled={disabled}
              className="sr-only"
            />
            
            <span className="text-2xl mr-3">{language.flag}</span>
            
            <div className="flex-1">
              <span className="elderly-text font-medium text-gray-900">
                {language.name}
              </span>
              {language.code === 'english' && (
                <span className="block text-sm text-gray-500 mt-1">
                  Default - Simple English explanations
                </span>
              )}
            </div>
            
            {value === language.code && (
              <div className="text-primary-500">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </label>
        ))}
      </div>
      
      <p className="mt-3 text-sm text-gray-500">
        Your translation will be provided in simple, easy-to-understand language in your selected language.
      </p>
    </div>
  );
};

export default LanguageSelector;