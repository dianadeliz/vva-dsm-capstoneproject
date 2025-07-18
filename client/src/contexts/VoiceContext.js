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
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Set basic properties
      utterance.lang = options.lang || 'en-US';
      utterance.rate = options.rate || 0.9; // Slightly slower for better clarity
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 0.8; // Slightly lower volume

      let selectedVoice = null;
      
      // If a specific voice is requested, use it (highest priority)
      if (options.voiceName) {
        selectedVoice = voices.find(v => v.name === options.voiceName);
      }
      
      // For translation (when lang is not English), find the best voice for that language
      else if (options.lang && !options.lang.startsWith('en')) {
        // Find the best voice for the target language
        selectedVoice = voices.find(v => 
          v.lang === options.lang && 
          v.localService && 
          !v.name.includes('Daniel') && 
          !v.name.includes('Samantha')
        );
        
        if (!selectedVoice) {
          selectedVoice = voices.find(v => 
            v.lang === options.lang && 
            !v.name.includes('Daniel') && 
            !v.name.includes('Samantha')
          );
        }
        
        if (!selectedVoice) {
          selectedVoice = voices.find(v => v.lang === options.lang);
        }
        
        if (!selectedVoice) {
          // Fallback to base language
          const baseLang = options.lang.split('-')[0];
          selectedVoice = voices.find(v => v.lang.startsWith(baseLang));
        }
      }
      
      // For main assistant (English), always try to use Samantha first
      else {
        // First, try to find Samantha
        selectedVoice = voices.find(v => v.name === 'Samantha');
        
        // If Samantha not found, try user's preferred voice
        if (!selectedVoice) {
          const preferredVoiceName = getPreferredVoice();
          if (preferredVoiceName) {
            selectedVoice = voices.find(v => v.name === preferredVoiceName);
          }
        }
        
        // If still no voice, find the best available English voice
        if (!selectedVoice) {
          selectedVoice = voices.find(v => 
            v.lang.startsWith('en') && 
            v.localService && 
            !v.name.includes('Daniel')
          );
          
          if (!selectedVoice) {
            selectedVoice = voices.find(v => 
              v.lang.startsWith('en') && 
              !v.name.includes('Daniel')
            );
          }
          
          if (!selectedVoice) {
            selectedVoice = voices.find(v => v.lang.startsWith('en'));
          }
        }
      }
      
      // If still no voice, use the first available
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices[0];
      }

      // Set the voice
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        console.log('Using voice:', selectedVoice.name, 'Language:', selectedVoice.lang);
      }

      // Event handlers
      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log('Speech started');
      };
      
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log('Speech ended');
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsSpeaking(false);
        toast.error('Text-to-speech error: ' + event.error);
      };

      // Speak the text
      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error starting speech synthesis:', error);
        toast.error('Failed to start speech synthesis');
      }
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

  // Reset voice preferences
  const resetVoicePreferences = () => {
    localStorage.removeItem('preferredVoice');
    console.log('Voice preferences reset');
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
    getPreferredVoice,
    resetVoicePreferences
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