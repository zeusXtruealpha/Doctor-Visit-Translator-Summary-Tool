import React from 'react';

const TranslationDisplay = ({ translation, language }) => {
  const sections = [
    {
      title: 'Your Condition',
      content: translation.condition,
      description: 'What health issue you have'
    },
    {
      title: 'Your Medicines',
      content: translation.medicines,
      description: 'What medications to take and how'
    },
    {
      title: 'Daily Routine',
      content: translation.dailyRoutine,
      description: 'Your daily schedule for treatment'
    },
    {
      title: "Do's",
      content: translation.dos,
      description: 'Things you should do'
    },
    {
      title: "Don'ts",
      content: translation.donts,
      description: 'Things you should avoid'
    }
  ];

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    // Create a text version for saving
    const textContent = sections.map(section => 
      `${section.title.toUpperCase()}\n${'-'.repeat(section.title.length)}\n${section.content}\n\n`
    ).join('');
    
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-translation-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-heading">Your Medical Translation</h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              title="Print this translation"
            >
              Print
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              title="Save as text file"
            >
              Save
            </button>
          </div>
        </div>
        
        <p className="elderly-text text-gray-600">
          Here's your medical information translated into simple, easy-to-understand language:
        </p>
      </div>

      {/* Translation sections */}
      {sections.map((section, index) => (
        <div key={index} className="card print:break-inside-avoid">
          <div className="mb-3">
            <h3 className="text-xl font-semibold text-gray-900 mb-1">
              {section.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              {section.description}
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="elderly-text text-gray-800 leading-relaxed whitespace-pre-wrap">
              {section.content}
            </div>
          </div>
        </div>
      ))}

      {/* Important notice */}
      <div className="card bg-yellow-50 border-yellow-200">
        <div>
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Important Notice
          </h3>
          <p className="elderly-text text-yellow-700">
            This translation is for informational purposes only. Always consult with your doctor if you have questions about your treatment. If you experience any concerning symptoms, seek medical attention immediately.
          </p>
        </div>
      </div>

      {/* Original text reference */}
      {translation.originalText && (
        <div className="card bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Original Medical Text
          </h3>
          <p className="text-sm text-gray-600 italic">
            "{translation.originalText}"
          </p>
        </div>
      )}
    </div>
  );
};

export default TranslationDisplay;