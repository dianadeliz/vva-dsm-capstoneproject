import React, { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import { FiVolume2, FiCheck, FiX } from 'react-icons/fi';

const VoiceTest = () => {
  const { getAvailableVoices, speak, setPreferredVoice, resetVoicePreferences } = useVoice();
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = getAvailableVoices();
      // Filter to only English voices and sort by quality
      const englishVoices = availableVoices
        .filter(voice => voice.lang.startsWith('en'))
        .sort((a, b) => {
          // Prioritize local services
          if (a.localService && !b.localService) return -1;
          if (!a.localService && b.localService) return 1;
          return 0;
        });
      setVoices(englishVoices);
    };

    // Load voices immediately if available
    loadVoices();
    
    // Also load when voices change
    if ('speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, [getAvailableVoices]);

  const testVoice = (voiceName) => {
    const testText = "Hello! This is a test of the voice synthesis. How does this sound to you?";
    speak(testText, { voiceName });
  };

  const selectVoice = (voiceName) => {
    setSelectedVoice(voiceName);
    setPreferredVoice(voiceName);
    testVoice(voiceName);
  };

  const getVoiceQuality = (voice) => {
    if (voice.localService) return 'High';
    if (voice.name.includes('Google') || voice.name.includes('Natural')) return 'Good';
    return 'Standard';
  };

  const getVoiceQualityColor = (quality) => {
    switch (quality) {
      case 'High': return '#4caf50';
      case 'Good': return '#ff9800';
      default: return '#666';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          cursor: 'pointer',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
          zIndex: 1000
        }}
        title="Test Voices"
      >
        <FiVolume2 size={20} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      zIndex: 1001,
      maxWidth: '350px',
      maxHeight: '400px',
      overflowY: 'auto'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Voice Test</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              resetVoicePreferences();
              setSelectedVoice('');
            }}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
            title="Reset voice preferences"
          >
            Reset
          </button>
          <button
            onClick={() => setIsVisible(false)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            <FiX />
          </button>
        </div>
      </div>

      <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#666' }}>
        Click a voice to test it, then select the one you prefer:
      </p>

      <div style={{ marginBottom: '12px' }}>
        {voices.map((voice, index) => {
          const quality = getVoiceQuality(voice);
          const isSelected = selectedVoice === voice.name;
          
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px',
                border: isSelected ? '2px solid #007bff' : '1px solid #eee',
                borderRadius: '4px',
                marginBottom: '4px',
                background: isSelected ? '#f0f8ff' : 'white'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '500', fontSize: '14px' }}>
                  {voice.name}
                  {isSelected && <FiCheck style={{ marginLeft: '8px', color: '#007bff' }} />}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {voice.lang} • 
                  <span style={{ color: getVoiceQualityColor(quality) }}>
                    {quality} Quality
                  </span>
                  {voice.localService && ' • Local'}
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => testVoice(voice.name)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px'
                  }}
                  title="Test this voice"
                >
                  <FiVolume2 size={16} />
                </button>
                <button
                  onClick={() => selectVoice(voice.name)}
                  style={{
                    background: isSelected ? '#007bff' : '#f0f0f0',
                    color: isSelected ? 'white' : '#333',
                    border: 'none',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {isSelected ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedVoice && (
        <div style={{
          background: '#e8f5e8',
          border: '1px solid #4caf50',
          borderRadius: '4px',
          padding: '8px',
          fontSize: '14px',
          color: '#2e7d32'
        }}>
          ✓ Voice selected: <strong>{selectedVoice}</strong>
        </div>
      )}
    </div>
  );
};

export default VoiceTest; 