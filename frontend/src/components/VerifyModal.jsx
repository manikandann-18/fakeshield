import React, { useState } from 'react';
import axios from 'axios';

export default function VerifyModal({ post, onClose, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [loadingText, setLoadingText] = useState('Run Analysis');

  const loadingSequence = [
    'Initializing AI Cluster...',
    'Running Logistic Regression (Keywords)...',
    'Running Naive Bayes (Semantics)...',
    'Running Decision Trees (Patterns)...',
    'Finalizing Triple-Check Consensus...'
  ];

  const handleVerify = async () => {
    setLoading(true);
    let i = 0;
    setLoadingText(loadingSequence[0]);
    const interval = setInterval(() => {
      i++;
      if (i < loadingSequence.length) {
        setLoadingText(loadingSequence[i]);
      } else {
        clearInterval(interval);
      }
    }, 600);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/verify`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Delay closing to ensure presentation animation finishes
      setTimeout(() => {
        clearInterval(interval);
        onUpdate(res.data);
        onClose();
      }, 3000);
    } catch (err) {
      clearInterval(interval);
      setError('Verification failed. Please try again.');
      setLoading(false);
      setLoadingText('Run Analysis');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Verify Post</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to run a fact-check and security analysis on this post? This process will check for potential fake news and phishing threats.
        </p>
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <div className="flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleVerify}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? loadingText : 'Run Analysis'}
          </button>
        </div>
      </div>
    </div>
  );
}
