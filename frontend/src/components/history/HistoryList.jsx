import React from 'react';

const HistoryList = ({ history, onSelectTranslation }) => {
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

  const getLanguageFlag = (language) => {
    const flags = {
      english: '🇺🇸',
      tamil: '🇮🇳',
      hindi: '🇮🇳'
    };
    return flags[language] || '🌐';
  };

  const getLanguageName = (language) => {
    const names = {
      english: 'English',
      tamil: 'Tamil',
      hindi: 'Hindi'
    };
    return names[language] || language;
  };

  if (history.length === 0) {
    return (
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Translation History
          </h1>
          <p className="elderly-text text-gray-600">
            Your past medical translations will appear here.
          </p>
        </div>

        <div className="card text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No translations yet
          </h3>
          <p className="elderly-text text-gray-500 mb-6">
            Start by translating your first medical document to see it here.
          </p>
          <a
            href="/translate"
            className="btn-primary inline-block"
          >
            Translate Medical Text
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Translation History
        </h1>
        <p className="elderly-text text-gray-600">
          Click on any translation to view the full details.
        </p>
      </div>

      <div className="space-y-4">
        {history.map((translation) => (
          <div
            key={translation.id}
            onClick={() => onSelectTranslation(translation.id)}
            className="card hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-primary-500"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg">{getLanguageFlag(translation.language)}</span>
                  <span className="text-sm font-medium text-primary-600">
                    {getLanguageName(translation.language)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(translation.date)}
                  </span>
                </div>
                
                <p className="elderly-text text-gray-800 mb-2 line-clamp-2">
                  {translation.preview}
                </p>
                
                {translation.condition && (
                  <p className="text-sm text-gray-600 line-clamp-1">
                    <span className="font-medium">Condition:</span> {translation.condition}
                  </p>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500">
          Showing {history.length} translation{history.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default HistoryList;