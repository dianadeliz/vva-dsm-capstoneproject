import React, { useState, useEffect } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import { FiMic, FiMicOff } from 'react-icons/fi';

const VoiceAssistant = () => {
  const { isListening, startListening, stopListening, transcript, clearTranscript, speak } = useVoice();
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (transcript) {
      setShowTranscript(true);
      
      // Auto-hide transcript after 5 seconds
      const timer = setTimeout(() => {
        setShowTranscript(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [transcript]);

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
      setShowTranscript(false);
    } else {
      clearTranscript();
      startListening();
      speak("Voice assistant activated. How can I help you?", { voiceName: 'Samantha' });
    }
  };

  const processVoiceCommand = (command) => {
    const lowerCommand = command.toLowerCase();
    
    // Navigation commands
    if (lowerCommand.includes('weather') || lowerCommand.includes('check weather')) {
      speak("Opening weather section", { voiceName: 'Samantha' });
      // You could add navigation logic here
      return;
    }
    
    if (lowerCommand.includes('navigate') || lowerCommand.includes('directions') || lowerCommand.includes('maps')) {
      speak("Opening navigation section", { voiceName: 'Samantha' });
      return;
    }
    
    if (lowerCommand.includes('chat') || lowerCommand.includes('conversation')) {
      speak("Opening chat assistant", { voiceName: 'Samantha' });
      return;
    }
    
    if (lowerCommand.includes('translate') || lowerCommand.includes('translation')) {
      speak("Opening translation section", { voiceName: 'Samantha' });
      return;
    }
    
    if (lowerCommand.includes('dashboard') || lowerCommand.includes('home')) {
      speak("Going to dashboard", { voiceName: 'Samantha' });
      return;
    }
    
    if (lowerCommand.includes('logout') || lowerCommand.includes('sign out')) {
      speak("Logging you out", { voiceName: 'Samantha' });
      // You could add logout logic here
      return;
    }
    
    if (lowerCommand.includes('time')) {
      const time = new Date().toLocaleTimeString();
      speak(`The current time is ${time}`, { voiceName: 'Samantha' });
      return;
    }
    
    if (lowerCommand.includes('date')) {
      const date = new Date().toLocaleDateString();
      speak(`Today is ${date}`, { voiceName: 'Samantha' });
      return;
    }
    
    if (lowerCommand.includes('hello') || lowerCommand.includes('hi')) {
      speak("Hello! I'm your voice assistant. How can I help you today?", { voiceName: 'Samantha' });
      return;
    }
    
    if (lowerCommand.includes('help')) {
      speak("I can help you with weather, navigation, chat, translation, and more. Just say what you need!", { voiceName: 'Samantha' });
      return;
    }
    
    // Default response
    speak("I heard you say: " + command + ". How can I assist you with that?", { voiceName: 'Samantha' });
  };

  useEffect(() => {
    if (transcript && !isListening) {
      processVoiceCommand(transcript);
    }
  }, [transcript, isListening]);

  return null;
};

export default VoiceAssistant; 