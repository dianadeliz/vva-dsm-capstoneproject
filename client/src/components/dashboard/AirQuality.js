import React, { useState } from 'react';
import { FiSearch, FiMapPin } from 'react-icons/fi';

const AirQuality = () => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    // Redirect to Google Air Quality
    const searchQuery = encodeURIComponent(`air quality ${location}`);
    const googleAirQualityUrl = `https://www.google.com/search?q=${searchQuery}`;
    window.open(googleAirQualityUrl, '_blank');
    setLoading(false);
  };

  const handleCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const searchQuery = encodeURIComponent(`air quality ${latitude},${longitude}`);
          const googleAirQualityUrl = `https://www.google.com/search?q=${searchQuery}`;
          window.open(googleAirQualityUrl, '_blank');
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enter a location manually.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '24px', color: '#333' }}>
        <span role="img" aria-label="air quality">🌫️</span> Air Quality Condition
      </h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Get current air quality conditions for any location around the world.
      </p>
      <form onSubmit={handleSearch} style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <FiMapPin 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#999'
              }} 
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter city, state, or country"
              className="input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !location.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiSearch />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button
          onClick={handleCurrentLocation}
          className="btn btn-secondary"
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          📍 Use Current Location
        </button>
        <button
          onClick={() => {
            const searchQuery = encodeURIComponent('air quality');
            const googleAirQualityUrl = `https://www.google.com/search?q=${searchQuery}`;
            window.open(googleAirQualityUrl, '_blank');
          }}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🌍 Browse Air Quality
        </button>
      </div>
      <div style={{ 
        marginTop: '32px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: '12px', color: '#333' }}>Quick Air Quality Links</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai'].map((city) => (
            <button
              key={city}
              onClick={() => {
                const searchQuery = encodeURIComponent(`air quality ${city}`);
                const googleAirQualityUrl = `https://www.google.com/search?q=${searchQuery}`;
                window.open(googleAirQualityUrl, '_blank');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AirQuality; 