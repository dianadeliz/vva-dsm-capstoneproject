import React, { useState, useEffect, useRef } from 'react';
import { useVoice } from '../../contexts/VoiceContext';
import { useAuth } from '../../contexts/AuthContext';
import { FiSend, FiMic, FiMicOff, FiVolume2, FiVolumeX, FiCopy } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Chat = () => {
  const { user } = useAuth();
  const { isListening, startListening, stopListening, transcript, clearTranscript, speak, isSpeaking, stopSpeaking } = useVoice();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(`session_${Date.now()}`);
  const messagesEndRef = useRef(null);
  const [sending, setSending] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (transcript && !isListening) {
      setInputMessage(transcript);
      clearTranscript();
      setTimeout(() => {
        handleSendMessage(transcript);
      }, 100);
    }
  }, [transcript, isListening, clearTranscript]);

  const handleSendMessage = async (message) => {
    if (sending) return;
    
    // Get the message to send
    const msg = message !== undefined ? message : inputMessage;
    
    // Validate the message
    if (typeof msg !== 'string' || !msg.trim()) {
      return;
    }
    
    setSending(true);

    const userMessage = {
      role: 'user',
      content: msg,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      console.log('Sending message to AI:', msg);
      
      // Call backend AI route for assistant response
      const aiRes = await axios.post('/api/chat/ai', { message: msg });
      console.log('AI response received:', aiRes.data);
      
      const aiResponse = aiRes.data.aiResponse;

      const assistantMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Save to database
      try {
        await axios.post('/api/user/chat', {
          message: msg,
          response: aiResponse,
          sessionId
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Don't show error to user for database save failures
      }

    } catch (error) {
      console.error('Chat error:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        toast.error('Please log in again');
      } else if (error.response?.status === 500) {
        toast.error('AI service error. Please try again.');
      } else {
        toast.error('Failed to get AI response. Please check your connection.');
      }
    } finally {
      setLoading(false);
      setSending(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      clearTranscript();
      startListening('translation'); // Use translation source to avoid AI responses
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  // Replace 'Google US English' with your actual preferred voice name
  const preferredVoiceName = 'Samantha';

  return (
    <div className="card">
      <h2 style={{ marginBottom: '24px', color: '#333' }}>
        <span role="img" aria-label="chat">💬</span> Chat Assistant
      </h2>
      
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Have a conversation with your AI assistant. You can use voice input or type your messages.
      </p>

      {/* Chat Messages */}
      <div style={{
        height: '400px',
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '20px',
        overflowY: 'auto',
        background: '#f8f9fa'
      }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>
            <p>Start a conversation with your AI assistant!</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Try saying "Hello" or ask about weather, navigation, or translation.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              style={{
                marginBottom: '16px',
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '16px',
                background: message.role === 'user' ? '#667eea' : 'white',
                color: message.role === 'user' ? 'white' : '#333',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                wordWrap: 'break-word',
                position: 'relative'
              }}>
                <p style={{ margin: 0, lineHeight: '1.4' }}>{message.content}</p>
                {message.role === 'assistant' && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => speak(message.content, { voiceName: preferredVoiceName })}
                      className="btn btn-secondary"
                      title="Read Out Loud"
                    >
                      <FiVolume2 />
                    </button>
                    <button
                      onClick={stopSpeaking}
                      className="btn btn-secondary"
                      title="Pause Listening"
                      disabled={!isSpeaking}
                    >
                      <FiVolumeX />
                    </button>
                    <button
                      onClick={() => handleCopy(message.content)}
                      className="btn btn-secondary"
                      title="Copy Text"
                    >
                      <FiCopy />
                    </button>
                  </div>
                )}
                <small style={{
                  opacity: 0.7,
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block'
                }}>
                  {message.timestamp.toLocaleTimeString()}
                </small>
              </div>
            </div>
          ))
        )}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '16px',
              background: 'white',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
              <div className="spinner" style={{ width: '20px', height: '20px' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
        <div style={{ flex: 1 }}>
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message or use voice input..."
            style={{
              width: '100%',
              minHeight: '60px',
              padding: '12px 16px',
              border: '2px solid #e9ecef',
              borderRadius: '8px',
              fontSize: '16px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            disabled={loading || sending}
          />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleVoiceInput}
            className="btn btn-secondary"
            disabled={loading || sending}
            style={{
              padding: '12px',
              minWidth: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isListening ? 'Stop voice input' : 'Start voice input'}
          >
            {isListening ? <FiMicOff /> : <FiMic />}
          </button>
          <button
            onClick={isSpeaking ? stopSpeaking : () => speak(messages[messages.length - 1]?.content || '', { voiceName: preferredVoiceName })}
            className="btn btn-secondary"
            disabled={loading || sending || messages.length === 0}
            style={{
              padding: '12px',
              minWidth: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={isSpeaking ? 'Stop reading' : 'Read last message out loud'}
          >
            {isSpeaking ? <FiVolumeX /> : <FiVolume2 />}
          </button>
          <button
            onClick={() => {
              console.log('Send button clicked, inputMessage:', inputMessage);
              handleSendMessage();
            }}
            className="btn btn-primary"
            disabled={loading || sending || !inputMessage.trim()}
            style={{
              padding: '12px',
              minWidth: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Send message"
          >
            <FiSend />
          </button>
        </div>
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
    </div>
  );
};

export default Chat; 