import React, { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import { FiMic, FiMicOff, FiVolume2, FiVolumeX, FiRotateCcw } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Translation = () => {
  const { isListening, startListening, stopListening, transcript, clearTranscript, speak, isSpeaking, stopSpeaking } = useVoice();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [sourceLanguage, setSourceLanguage] = useState('auto');
  const [targetLanguage, setTargetLanguage] = useState('es');
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchLanguages();
  }, []);

  useEffect(() => {
    if (transcript && !isListening) {
      setInputText(transcript);
      clearTranscript();
    }
  }, [transcript, isListening, clearTranscript]);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get('/api/translation/languages');
      setLanguages(response.data.languages);
    } catch (error) {
      console.error('Error fetching languages:', error);
      // Fallback languages
      setLanguages([
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Spanish' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' },
        { code: 'it', name: 'Italian' },
        { code: 'pt', name: 'Portuguese' },
        { code: 'ru', name: 'Russian' },
        { code: 'ja', name: 'Japanese' },
        { code: 'ko', name: 'Korean' },
        { code: 'zh', name: 'Chinese' }
      ]);
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter text to translate');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/translation/translate', {
        text: inputText,
        sourceLanguage,
        targetLanguage
      });

      setTranslatedText(response.data.translatedText);
      toast.success('Translation completed!');
    } catch (error) {
      console.error('Translation error:', error);
      toast.error('Translation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening();
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLanguage !== 'auto') {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setInputText(translatedText);
      setTranslatedText('');
    }
  };

  // Map language codes to BCP-47 codes for speech synthesis
  const getSpeechLangCode = (code) => {
    switch (code) {
      case 'zh': return 'zh-CN'; // Chinese (Mandarin)
      case 'ja': return 'ja-JP'; // Japanese
      case 'ko': return 'ko-KR'; // Korean
      case 'es': return 'es-ES'; // Spanish (Spain)
      case 'fr': return 'fr-FR'; // French (France)
      case 'de': return 'de-DE'; // German
      case 'it': return 'it-IT'; // Italian
      case 'pt': return 'pt-PT'; // Portuguese (Portugal)
      case 'ru': return 'ru-RU'; // Russian
      case 'en': return 'en-US'; // English (US)
      default: return code; // fallback to code
    }
  };

  const handleSpeakTranslation = () => {
    if (translatedText) {
      speak(translatedText, { lang: getSpeechLangCode(targetLanguage) });
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '24px', color: '#333' }}>
        <span role="img" aria-label="translation">🌐</span> Translation
      </h2>
      
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Translate text between different languages. You can use voice input and hear the translation.
      </p>

      {/* Language Selection */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            From Language
          </label>
          <select
            value={sourceLanguage}
            onChange={(e) => setSourceLanguage(e.target.value)}
            className="input"
            style={{ padding: '12px 16px' }}
          >
            <option value="auto">Auto Detect</option>
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'end', paddingBottom: '8px' }}>
          <button
            onClick={handleSwapLanguages}
            className="btn btn-secondary"
            style={{ padding: '12px', minWidth: '48px' }}
            title="Swap languages"
          >
            <FiRotateCcw />
          </button>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            To Language
          </label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            className="input"
            style={{ padding: '12px 16px' }}
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Translation Area */}
      <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* Input Text */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Input Text
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Enter text to translate..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '16px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={handleVoiceInput}
              className="btn btn-secondary"
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                padding: '8px',
                minWidth: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {isListening ? <FiMicOff /> : <FiMic />}
            </button>
          </div>
        </div>

        {/* Translated Text */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#333' }}>
            Translation
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={translatedText}
              readOnly
              placeholder="Translation will appear here..."
              style={{
                width: '100%',
                minHeight: '150px',
                padding: '16px',
                border: '2px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                resize: 'vertical',
                fontFamily: 'inherit',
                background: '#f8f9fa'
              }}
            />
            {translatedText && (
              <button
                onClick={handleSpeakTranslation}
                className="btn btn-secondary"
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  right: '12px',
                  padding: '8px',
                  minWidth: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {isSpeaking ? <FiVolumeX /> : <FiVolume2 />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleTranslate}
          className="btn btn-primary"
          disabled={loading || !inputText.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          {loading ? 'Translating...' : '🌐 Translate'}
        </button>

        <button
          onClick={handleClear}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🗑️ Clear
        </button>

        <button
          onClick={() => setShowModal(true)}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🔊 Hear Translation
        </button>
      </div>

      {/* Voice Status */}
      {isListening && (
        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#e3f2fd',
          borderRadius: '8px',
          color: '#1976d2',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <div className="voice-pulse" style={{ width: '8px', height: '8px', background: '#1976d2', borderRadius: '50%' }}></div>
          Listening... Speak now
        </div>
      )}

      {/* Translation Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px', color: '#333' }}>
              <span role="img" aria-label="speaker">🔊</span> Hear Translation
            </h3>
            
            {translatedText ? (
              <div>
                <p style={{ color: '#666', marginBottom: '16px' }}>
                  Click the button below to hear the translation:
                </p>
                <div style={{
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  border: '1px solid #e9ecef'
                }}>
                  <p style={{ margin: 0, lineHeight: '1.5' }}>{translatedText}</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    onClick={handleSpeakTranslation}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                  >
                    {isSpeaking ? <FiVolumeX /> : <FiVolume2 />}
                    {isSpeaking ? 'Stop' : 'Play Translation'}
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ color: '#666', textAlign: 'center' }}>
                No translation available. Please translate some text first.
              </p>
            )}
            
            <button
              onClick={() => setShowModal(false)}
              className="btn btn-secondary"
              style={{ marginTop: '20px', width: '100%' }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Translation; 