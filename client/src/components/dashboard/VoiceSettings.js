import React, { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import { FiSettings, FiVolume2 } from 'react-icons/fi';

const VoiceSettings = () => {
  const { getAvailableVoices, setPreferredVoice, getPreferredVoice, speak } = useVoice();
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Get available voices
    const availableVoices = getAvailableVoices();
    setVoices(availableVoices);
    
    // Set current preferred voice
    const preferred = getPreferredVoice();
    if (preferred) {
      setSelectedVoice(preferred);
    }
  }, [getAvailableVoices, getPreferredVoice]);

  const handleVoiceChange = (voiceName) => {
    setSelectedVoice(voiceName);
    setPreferredVoice(voiceName);
    
    // Test the voice
    speak(`This is a test of the ${voiceName} voice.`, { voiceName });
  };

  const testVoice = (voiceName) => {
    speak(`This is a test of the ${voiceName} voice.`, { voiceName });
  };

  return (
    <div className="voice-settings">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="voice-settings-toggle"
        title="Voice Settings"
      >
        <FiSettings className="icon" />
      </button>

      {isOpen && (
        <div className="voice-settings-panel">
          <h3>Voice Settings</h3>
          <p>Select your preferred voice:</p>
          
          <div className="voice-list">
            {voices.map((voice, index) => (
              <div key={index} className="voice-option">
                <label>
                  <input
                    type="radio"
                    name="voice"
                    value={voice.name}
                    checked={selectedVoice === voice.name}
                    onChange={() => handleVoiceChange(voice.name)}
                  />
                  <span className="voice-name">{voice.name}</span>
                  <span className="voice-lang">({voice.lang})</span>
                  {voice.localService && <span className="voice-local">Local</span>}
                </label>
                <button
                  onClick={() => testVoice(voice.name)}
                  className="test-voice-btn"
                  title="Test this voice"
                >
                  <FiVolume2 />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={() => setIsOpen(false)}
            className="close-btn"
          >
            Close
          </button>
        </div>
      )}

      <style jsx>{`
        .voice-settings {
          position: relative;
        }

        .voice-settings-toggle {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s;
        }

        .voice-settings-toggle:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .voice-settings-panel {
          position: absolute;
          top: 100%;
          right: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 16px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 1000;
          min-width: 300px;
          max-height: 400px;
          overflow-y: auto;
        }

        .voice-settings-panel h3 {
          margin: 0 0 12px 0;
          color: #333;
        }

        .voice-settings-panel p {
          margin: 0 0 16px 0;
          color: #666;
          font-size: 14px;
        }

        .voice-list {
          margin-bottom: 16px;
        }

        .voice-option {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #eee;
        }

        .voice-option:last-child {
          border-bottom: none;
        }

        .voice-option label {
          display: flex;
          align-items: center;
          cursor: pointer;
          flex: 1;
        }

        .voice-name {
          margin-left: 8px;
          font-weight: 500;
        }

        .voice-lang {
          margin-left: 8px;
          color: #666;
          font-size: 12px;
        }

        .voice-local {
          margin-left: 8px;
          background: #e3f2fd;
          color: #1976d2;
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
        }

        .test-voice-btn {
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .test-voice-btn:hover {
          background-color: rgba(0, 0, 0, 0.1);
        }

        .close-btn {
          background: #f5f5f5;
          border: 1px solid #ddd;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .close-btn:hover {
          background: #e0e0e0;
        }
      `}</style>
    </div>
  );
};

export default VoiceSettings; 