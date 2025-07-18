import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const VoiceContext = createContext();

export const VoiceProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        toast.success('Voice recognition started');
      };

      recognitionInstance.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);
      };

      recognitionInstance.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        
        switch (event.error) {
          case 'no-speech':
            toast.error('No speech detected');
            break;
          case 'audio-capture':
            toast.error('Microphone not found');
            break;
          case 'not-allowed':
            toast.error('Microphone permission denied');
            break;
          default:
            toast.error('Voice recognition error');
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      toast.error('Speech recognition not supported in this browser');
    }

    // Initialize speech synthesis voices
    if ('speechSynthesis' in window) {
      // Load voices when they become available
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Available voices:', voices.map(v => v.name));
      };

      // Some browsers load voices asynchronously
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
      } else {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }
  }, []);

  // Start listening
  const startListening = () => {
    if (recognition) {
      try {
        recognition.start();
      } catch (error) {
        console.error('Error starting recognition:', error);
        toast.error('Failed to start voice recognition');
      }
    } else {
      toast.error('Speech recognition not available');
    }
  };

  // Stop listening
  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  // Clear transcript
  const clearTranscript = () => {
    setTranscript('');
  };

  // Text to speech
  const speak = (text, options = {}) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      const lang = options.lang || 'en-US';
      utterance.lang = lang;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      let bestVoice = null;
      
      // First, check if user has a preferred voice set
      const preferredVoiceName = getPreferredVoice();
      if (preferredVoiceName) {
        bestVoice = voices.find(v => v.name === preferredVoiceName);
      }
      
      // If a specific voiceName is provided, use it (overrides preference)
      if (options.voiceName) {
        bestVoice = voices.find(v => v.name === options.voiceName);
      }
      
      // Otherwise, prioritize modern, natural-sounding voices
      if (!bestVoice) {
        // First, try to find a modern Google voice
        bestVoice = voices.find(v => 
          v.lang === lang && 
          (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Enhanced'))
        );
      }
      
      if (!bestVoice) {
        // Then try Microsoft voices
        bestVoice = voices.find(v => 
          v.lang === lang && 
          (v.name.includes('Microsoft') || v.name.includes('David') || v.name.includes('Zira'))
        );
      }
      
      if (!bestVoice) {
        // Then try any local service voice
        bestVoice = voices.find(v => v.lang === lang && v.localService);
      }
      
      if (!bestVoice) {
        // Then try default voice for the language
        bestVoice = voices.find(v => v.lang === lang && v.default);
      }
      
      if (!bestVoice) {
        // Then any voice for the language
        bestVoice = voices.find(v => v.lang === lang);
      }
      
      if (!bestVoice) {
        // Finally, try any voice with the base language
        const baseLang = lang.split('-')[0];
        bestVoice = voices.find(v => v.lang.startsWith(baseLang));
      }
      
      // Set the voice if found
      if (bestVoice) {
        utterance.voice = bestVoice;
        console.log('Using voice:', bestVoice.name);
      } else {
        console.log('No suitable voice found, using default');
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        toast.error('Text-to-speech error');
      };

      window.speechSynthesis.speak(utterance);
    } else {
      toast.error('Text-to-speech not supported in this browser');
    }
  };

  // Stop speaking
  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  // Get available voices
  const getVoices = () => {
    if ('speechSynthesis' in window) {
      return window.speechSynthesis.getVoices();
    }
    return [];
  };

  // Set voice
  const setVoice = (voice) => {
    if ('speechSynthesis' in window) {
      // This would be used when creating new utterances
      return voice;
    }
    return null;
  };

  // Get available voices with better formatting
  const getAvailableVoices = () => {
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      return voices.map(voice => ({
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
        default: voice.default
      }));
    }
    return [];
  };

  // Set preferred voice by name
  const setPreferredVoice = (voiceName) => {
    if ('speechSynthesis' in window) {
      const voices = window.speechSynthesis.getVoices();
      const voice = voices.find(v => v.name === voiceName);
      if (voice) {
        // Store preference in localStorage
        localStorage.setItem('preferredVoice', voiceName);
        return voice;
      }
    }
    return null;
  };

  // Get preferred voice from localStorage
  const getPreferredVoice = () => {
    return localStorage.getItem('preferredVoice');
  };

  const value = {
    isListening,
    transcript,
    isSpeaking,
    startListening,
    stopListening,
    clearTranscript,
    speak,
    stopSpeaking,
    getVoices,
    setVoice,
    getAvailableVoices,
    setPreferredVoice,
    getPreferredVoice
  };

  return (
    <VoiceContext.Provider value={value}>
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = () => {
  const context = useContext(VoiceContext);
  if (!context) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return context;
}; 