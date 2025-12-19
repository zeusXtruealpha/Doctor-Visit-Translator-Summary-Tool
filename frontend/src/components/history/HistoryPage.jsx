import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import HistoryList from './HistoryList';
import HistoryDetail from './HistoryDetail';
import LoadingSpinner from '../common/LoadingSpinner';

const HistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { getAccessToken } = useAuth();

  const fetchHistory = async () => {
    setLoading(true);
    setError('');

    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setHistory(data.data);
      } else {
        setError(data.error || 'Failed to load translation history');
      }
    } catch (err) {
      console.error('History fetch error:', err);
      setError('Unable to load your translation history. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTranslationDetail = async (translationId) => {
    try {
      const token = await getAccessToken();
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/history/${translationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setSelectedTranslation(data.data);
      } else {
        setError(data.error || 'Failed to load translation details');
      }
    } catch (err) {
      console.error('Translation detail fetch error:', err);
      setError('Unable to load translation details.');
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSelectTranslation = (translationId) => {
    fetchTranslationDetail(translationId);
  };

  const handleBackToList = () => {
    setSelectedTranslation(null);
  };

  const handleRetry = () => {
    fetchHistory();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <LoadingSpinner size="large" />
          <p className="elderly-text text-gray-600 mt-4">
            Loading your translation history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="card text-center py-12">
          <div className="text-red-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="elderly-text text-red-700 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {selectedTranslation ? (
        <HistoryDetail
          translation={selectedTranslation}
          onBack={handleBackToList}
        />
      ) : (
        <HistoryList
          history={history}
          onSelectTranslation={handleSelectTranslation}
        />
      )}
    </div>
  );
};

export default HistoryPage;