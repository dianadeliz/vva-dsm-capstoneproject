import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useVoice } from '../../contexts/VoiceContext';
import { FiLogOut, FiMic, FiMicOff, FiVolume2, FiVolumeX } from 'react-icons/fi';
import Weather from './Weather';
import Navigation from './Navigation';
import Chat from './Chat';
import Translation from './Translation';
import VoiceAssistant from './VoiceAssistant';
import VoiceSettings from './VoiceSettings';
import AirQuality from './AirQuality';
import ChanceOfRain from './ChanceOfRain';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { isListening, startListening, stopListening, transcript, clearTranscript } = useVoice();
  const [activeSection, setActiveSection] = useState(null);

  const handleLogout = async () => {
    await logout();
  };

  const handleVoiceCommand = () => {
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening('assistant');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'weather':
        return <Weather />;
      case 'airquality':
        return <AirQuality />;
      case 'chanceofrain':
        return <ChanceOfRain />;
      case 'navigation':
        return <Navigation />;
      case 'chat':
        return <Chat />;
      case 'translation':
        return <Translation />;
      default:
        return (
          <div className="dashboard-grid">
            <div 
              className="dashboard-card"
              onClick={() => setActiveSection('weather')}
            >
              <h3>
                <span role="img" aria-label="weather">🌤️</span>
                Weather
              </h3>
              <p>Get current weather information and forecasts for any location</p>
            </div>
            <div 
              className="dashboard-card"
              onClick={() => setActiveSection('airquality')}
            >
              <h3>
                <span role="img" aria-label="air quality">🌫️</span>
                Air Quality Condition
              </h3>
              <p>Check air quality for any location</p>
            </div>
            <div 
              className="dashboard-card"
              onClick={() => setActiveSection('chanceofrain')}
            >
              <h3>
                <span role="img" aria-label="chance of rain">🌧️</span>
                Chance of Rain
              </h3>
              <p>Check the chance of rain for any location</p>
            </div>
            <div 
              className="dashboard-card"
              onClick={() => setActiveSection('navigation')}
            >
              <h3>
                <span role="img" aria-label="navigation">🗺️</span>
                Navigation
              </h3>
              <p>Find directions and navigate to your destination</p>
            </div>
            <div 
              className="dashboard-card"
              onClick={() => setActiveSection('chat')}
            >
              <h3>
                <span role="img" aria-label="chat">💬</span>
                Chat Assistant
              </h3>
              <p>Have a conversation with your AI assistant</p>
            </div>
            <div 
              className="dashboard-card"
              onClick={() => setActiveSection('translation')}
            >
              <h3>
                <span role="img" aria-label="translation">🌐</span>
                Translation
              </h3>
              <p>Translate text between different languages</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome, {user?.username}!</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>
            Your Voice Virtual Assistant is ready to help
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <VoiceSettings />
          <button
            onClick={handleVoiceCommand}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {isListening ? <FiMicOff /> : <FiMic />}
            {isListening ? 'Stop' : 'Voice'}
          </button>
          <button
            onClick={handleLogout}
            className="btn btn-danger"
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiLogOut />
            Logout
          </button>
        </div>
      </div>

      {activeSection && (
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={() => setActiveSection(null)}
            className="btn btn-secondary"
            style={{ marginBottom: '16px' }}
          >
            ← Back to Dashboard
          </button>
        </div>
      )}

      {renderSection()}

      <VoiceAssistant />
    </div>
  );
};

export default Dashboard; 