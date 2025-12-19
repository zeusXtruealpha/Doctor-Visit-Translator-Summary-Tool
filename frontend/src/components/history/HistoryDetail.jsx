import React from 'react';
import TranslationDisplay from '../translate/TranslationDisplay';

const HistoryDetail = ({ translation, onBack }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLanguageName = (language) => {
    const names = {
      english: 'English',
      tamil: 'Tamil',
      hindi: 'Hindi'
    };
    return names[language] || language;
  };

  return (
    <div>
      {/* Header with back button */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-primary-600 hover:text-primary-500 mb-4"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to History
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Translation Details
            </h1>
            <p className="elderly-text text-gray-600">
              Translated on {formatDate(translation.date)} • {getLanguageName(translation.targetLanguage)}
            </p>
          </div>
        </div>
      </div>

      {/* Translation content */}
      <TranslationDisplay
        translation={{
          condition: translation.condition,
          medicines: translation.medicines,
          dailyRoutine: translation.dailyRoutine,
          dos: translation.dos,
          donts: translation.donts,
          originalText: translation.originalText
        }}
        language={translation.targetLanguage}
      />
    </div>
  );
};

export default HistoryDetail;