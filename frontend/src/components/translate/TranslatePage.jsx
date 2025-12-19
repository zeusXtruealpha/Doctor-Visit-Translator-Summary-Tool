import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MedicalTextInput from './MedicalTextInput';
import LanguageSelector from './LanguageSelector';
import TranslationDisplay from './TranslationDisplay';
import ImageUpload from './ImageUpload';
import LoadingSpinner from '../common/LoadingSpinner';

const TranslatePage = () => {
  const [medicalText, setMedicalText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [inputMode, setInputMode] = useState('text'); // 'text' or 'image'
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [translation, setTranslation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { getAccessToken } = useAuth();

  const handleTranslateText = async () => {
    if (!medicalText.trim()) {
      setError('Please enter some medical text to translate');
      return;
    }

    if (medicalText.trim().length < 10) {
      setError('Please enter at least 10 characters of medical text');
      return;
    }

    setLoading(true);
    setError('');
    setTranslation(null);

    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          medicalText: medicalText.trim(),
          targetLanguage
        })
      });

      const data = await response.json();

      if (data.success) {
        setTranslation(data.data);
      } else {
        setError(data.error || 'Translation failed. Please try again.');
      }
    } catch (err) {
      console.error('Translation error:', err);
      setError('Unable to connect to translation service. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTranslateImage = async () => {
    if (!selectedImage) {
      setError('Please select an image to translate');
      return;
    }

    setLoading(true);
    setError('');
    setTranslation(null);

    try {
      const token = await getAccessToken();
      
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('targetLanguage', targetLanguage);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/translate/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setTranslation(data.data);
      } else {
        setError(data.error || 'Image translation failed. Please try again.');
      }
    } catch (err) {
      console.error('Image translation error:', err);
      setError('Unable to process image. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    if (inputMode === 'text') {
      handleTranslateText();
    } else {
      handleTranslateImage();
    }
  };

  const handleClear = () => {
    setMedicalText('');
    setSelectedImage(null);
    setTranslation(null);
    setError('');
  };

  const handleModeSwitch = (mode) => {
    setInputMode(mode);
    setError('');
    setTranslation(null);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-slide-in">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-800 mb-4">
          Medical Translation Assistant
        </h1>
        <p className="elderly-text text-slate-600 max-w-2xl mx-auto">
          Transform complex medical prescriptions and doctor notes into clear, easy-to-understand language. 
          Upload an image or type your medical text below.
        </p>
      </div>

      {/* Input Mode Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-white rounded-xl p-2 shadow-lg border border-slate-200">
          <button
            onClick={() => handleModeSwitch('text')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              inputMode === 'text'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-600 hover:text-blue-600'
            }`}
          >
            Type Text
          </button>
          <button
            onClick={() => handleModeSwitch('image')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
              inputMode === 'image'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 hover:text-emerald-600'
            }`}
          >
            Upload Image
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          {inputMode === 'text' ? (
            <MedicalTextInput
              value={medicalText}
              onChange={setMedicalText}
              disabled={loading}
            />
          ) : (
            <ImageUpload
              onImageSelect={setSelectedImage}
              disabled={loading}
            />
          )}
          
          <LanguageSelector
            value={targetLanguage}
            onChange={setTargetLanguage}
            disabled={loading}
          />

          <div className="flex space-x-4">
            {inputMode === 'text' ? (
              <button
                onClick={handleTranslateText}
                disabled={loading || !medicalText.trim()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Translating...
                  </span>
                ) : (
                  'Translate Text'
                )}
              </button>
            ) : (
              <button
                onClick={handleTranslateImage}
                disabled={loading || !selectedImage}
                className="flex-1 btn-upload disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Image...
                  </span>
                ) : (
                  'Translate from Image'
                )}
              </button>
            )}
            
            <button
              onClick={handleClear}
              disabled={loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-2 border-red-200 rounded-xl status-error">
              <div className="flex items-start space-x-3">
                <div className="text-red-500 mt-0.5">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="elderly-text text-red-700 mb-2">{error}</p>
                  <button
                    onClick={handleRetry}
                    className="text-sm text-red-600 hover:text-red-500 underline font-medium"
                  >
                    Try again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div>
          {loading && (
            <div className="card text-center py-16">
              <LoadingSpinner />
              <p className="elderly-text text-slate-600 mt-6">
                {inputMode === 'image' ? 'Processing your medical image...' : 'Translating your medical text...'}
              </p>
              <p className="text-sm text-slate-500 mt-2">
                This may take a few moments
              </p>
            </div>
          )}

          {translation && !loading && (
            <TranslationDisplay
              translation={translation}
              language={targetLanguage}
            />
          )}

          {!translation && !loading && !error && (
            <div className="card text-center py-16">
              <div className="text-slate-400 mb-6">
                {inputMode === 'image' ? (
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                ) : (
                  <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
              </div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">
                Ready to translate
              </h3>
              <p className="elderly-text text-slate-500">
                {inputMode === 'image' 
                  ? 'Upload a prescription image to get started'
                  : 'Enter your medical text to get a clear explanation'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TranslatePage;