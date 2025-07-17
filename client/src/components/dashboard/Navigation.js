import React, { useState } from 'react';
import { FiSearch, FiMapPin, FiNavigation } from 'react-icons/fi';

const Navigation = () => {
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!destination.trim()) return;

    setLoading(true);
    
    // Redirect to Google Maps
    const searchQuery = encodeURIComponent(destination);
    const googleMapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
    
    // Open in new tab
    window.open(googleMapsUrl, '_blank');
    
    setLoading(false);
  };

  const handleDirections = () => {
    if (!destination.trim()) {
      alert('Please enter a destination first');
      return;
    }

    setLoading(true);
    
    // Get current location and open directions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const searchQuery = encodeURIComponent(destination);
          const googleMapsUrl = `https://www.google.com/maps/dir/${latitude},${longitude}/${searchQuery}`;
          window.open(googleMapsUrl, '_blank');
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Fallback to just searching the destination
          const searchQuery = encodeURIComponent(destination);
          const googleMapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
          window.open(googleMapsUrl, '_blank');
          setLoading(false);
        }
      );
    } else {
      // Fallback to just searching the destination
      const searchQuery = encodeURIComponent(destination);
      const googleMapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
      window.open(googleMapsUrl, '_blank');
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '24px', color: '#333' }}>
        <span role="img" aria-label="navigation">🗺️</span> Navigation
      </h2>
      
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Find directions and navigate to your destination using Google Maps.
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
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination (address, place, or landmark)"
              className="input"
              style={{ paddingLeft: '40px' }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !destination.trim()}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <FiSearch />
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <button
          onClick={handleDirections}
          className="btn btn-secondary"
          disabled={loading || !destination.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FiNavigation />
          Get Directions
        </button>
        
        <button
          onClick={() => {
            const googleMapsUrl = 'https://www.google.com/maps';
            window.open(googleMapsUrl, '_blank');
          }}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🗺️ Open Maps
        </button>
      </div>

      <div style={{ 
        marginTop: '32px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: '12px', color: '#333' }}>Quick Navigation</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {['Restaurants', 'Gas Stations', 'Hospitals', 'Hotels', 'Shopping Centers', 'Airports'].map((place) => (
            <button
              key={place}
              onClick={() => {
                const searchQuery = encodeURIComponent(place);
                const googleMapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
                window.open(googleMapsUrl, '_blank');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              {place}
            </button>
          ))}
        </div>
        
        <h4 style={{ marginBottom: '12px', color: '#333' }}>Popular Destinations</h4>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['Times Square, New York', 'Eiffel Tower, Paris', 'Big Ben, London', 'Tokyo Tower, Japan'].map((place) => (
            <button
              key={place}
              onClick={() => {
                const searchQuery = encodeURIComponent(place);
                const googleMapsUrl = `https://www.google.com/maps/search/${searchQuery}`;
                window.open(googleMapsUrl, '_blank');
              }}
              className="btn btn-secondary"
              style={{ fontSize: '14px', padding: '8px 16px' }}
            >
              {place}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navigation; 