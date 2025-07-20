import React, { useState } from 'react';
import { FiSearch, FiMapPin, FiThermometer, FiDroplet, FiWind, FiEye, FiSunrise, FiSunset } from 'react-icons/fi';
import axios from 'axios';
import toast from 'react-hot-toast';

const Weather = () => {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!location.trim()) return;

    setLoading(true);
    setWeatherData(null);
    setForecastData(null);

    try {
      // Get current weather
      const weatherResponse = await axios.get(`/api/weather/current/${encodeURIComponent(location)}`);
      setWeatherData(weatherResponse.data);

      // Get forecast
      const forecastResponse = await axios.get(`/api/weather/forecast/${encodeURIComponent(location)}`);
      setForecastData(forecastResponse.data);

      toast.success(`Weather data for ${location} loaded!`);
    } catch (error) {
      console.error('Weather search error:', error);
      if (error.response?.status === 404) {
        toast.error('Location not found. Please check the spelling.');
      } else {
        toast.error('Failed to get weather data. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCurrentLocation = async () => {
    setLoading(true);
    setWeatherData(null);
    setForecastData(null);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            // Get weather by coordinates
            const weatherResponse = await axios.get(`/api/weather/coordinates/${latitude}/${longitude}`);
            setWeatherData(weatherResponse.data);
            setLocation(weatherResponse.data.location);

            // Get forecast
            const forecastResponse = await axios.get(`/api/weather/forecast/${encodeURIComponent(weatherResponse.data.location)}`);
            setForecastData(forecastResponse.data);

            toast.success(`Weather data for your location loaded!`);
          } catch (error) {
            console.error('Weather coordinates error:', error);
            toast.error('Failed to get weather data for your location.');
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          toast.error('Unable to get your location. Please enter a location manually.');
          setLoading(false);
        }
      );
    } else {
      toast.error('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 style={{ marginBottom: '24px', color: '#333' }}>
        <span role="img" aria-label="weather">🌤️</span> Weather Information
      </h2>
      
      <p style={{ color: '#666', marginBottom: '24px' }}>
        Get current weather conditions and forecasts for any location around the world.
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
      </div>

      {/* Weather Display */}
      {weatherData && (
        <div style={{ 
          marginTop: '32px', 
          padding: '24px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          borderRadius: '16px',
          color: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '600' }}>
                {weatherData.location}, {weatherData.country}
              </h3>
              <p style={{ margin: '4px 0 0 0', opacity: 0.9, fontSize: '16px' }}>
                {weatherData.description}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '48px', fontWeight: '300' }}>
                {weatherData.temperature}°C
              </div>
              <div style={{ fontSize: '14px', opacity: 0.8 }}>
                Feels like {weatherData.feelsLike}°C
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
            gap: '16px',
            marginTop: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiDroplet style={{ opacity: 0.8 }} />
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Humidity</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{weatherData.humidity}%</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiWind style={{ opacity: 0.8 }} />
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Wind Speed</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{weatherData.windSpeed} km/h</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiEye style={{ opacity: 0.8 }} />
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Visibility</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{weatherData.visibility} km</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiThermometer style={{ opacity: 0.8 }} />
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Pressure</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{weatherData.pressure} hPa</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSunrise style={{ opacity: 0.8 }} />
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Sunrise</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{weatherData.sunrise}</div>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiSunset style={{ opacity: 0.8 }} />
              <div>
                <div style={{ fontSize: '14px', opacity: 0.8 }}>Sunset</div>
                <div style={{ fontSize: '16px', fontWeight: '500' }}>{weatherData.sunset}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Forecast Display */}
      {forecastData && (
        <div style={{ 
          marginTop: '24px', 
          padding: '20px', 
          background: '#f8f9fa', 
          borderRadius: '12px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ marginBottom: '16px', color: '#333' }}>5-Day Forecast</h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
            gap: '12px'
          }}>
            {forecastData.forecasts.map((forecast, index) => (
              <div key={index} style={{
                padding: '12px',
                background: 'white',
                borderRadius: '8px',
                textAlign: 'center',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>
                  {new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                  {forecast.temperature}°C
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {forecast.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '32px', 
        padding: '20px', 
        background: '#f8f9fa', 
        borderRadius: '12px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: '12px', color: '#333' }}>Quick Weather Links</h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {['New York', 'London', 'Tokyo', 'Paris', 'Sydney', 'Mumbai'].map((city) => (
            <button
              key={city}
              onClick={() => {
                const searchQuery = encodeURIComponent(`weather ${city}`);
                const googleWeatherUrl = `https://www.google.com/search?q=${searchQuery}`;
                window.open(googleWeatherUrl, '_blank');
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

export default Weather; 