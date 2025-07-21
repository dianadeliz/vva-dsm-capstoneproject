import WeatherService from '../weatherService';
import axios from 'axios';

// Mock axios
jest.mock('axios');

// Mock navigator.geolocation
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};
global.navigator.geolocation = mockGeolocation;

describe('WeatherService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentWeather', () => {
    it('should fetch current weather successfully', async () => {
      const mockWeatherData = {
        location: 'New York',
        country: 'US',
        temperature: 20,
        feelsLike: 22,
        description: 'Partly cloudy',
        humidity: 65,
        windSpeed: 15,
        visibility: 10,
        sunrise: '06:30',
        sunset: '19:45'
      };

      axios.get.mockResolvedValueOnce({ data: mockWeatherData });

      const result = await WeatherService.getCurrentWeather('New York');

      expect(axios.get).toHaveBeenCalledWith('/api/weather/current/New%20York');
      expect(result).toEqual(mockWeatherData);
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Weather service unavailable';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(WeatherService.getCurrentWeather('New York')).rejects.toThrow(errorMessage);
      expect(axios.get).toHaveBeenCalledWith('/api/weather/current/New%20York');
    });

    it('should encode location with special characters', async () => {
      const mockWeatherData = { location: 'São Paulo' };
      axios.get.mockResolvedValueOnce({ data: mockWeatherData });

      await WeatherService.getCurrentWeather('São Paulo');

      expect(axios.get).toHaveBeenCalledWith('/api/weather/current/S%C3%A3o%20Paulo');
    });

    it('should handle empty location', async () => {
      const mockWeatherData = { location: '' };
      axios.get.mockResolvedValueOnce({ data: mockWeatherData });

      await WeatherService.getCurrentWeather('');

      expect(axios.get).toHaveBeenCalledWith('/api/weather/current/');
    });
  });

  describe('getWeatherForecast', () => {
    it('should fetch weather forecast successfully', async () => {
      const mockForecastData = {
        location: 'London',
        country: 'UK',
        forecasts: [
          {
            date: '2024-01-15',
            temperature: 12,
            description: 'Rainy'
          },
          {
            date: '2024-01-16',
            temperature: 15,
            description: 'Cloudy'
          }
        ]
      };

      axios.get.mockResolvedValueOnce({ data: mockForecastData });

      const result = await WeatherService.getWeatherForecast('London');

      expect(axios.get).toHaveBeenCalledWith('/api/weather/forecast/London');
      expect(result).toEqual(mockForecastData);
    });

    it('should handle forecast API errors', async () => {
      const errorMessage = 'Forecast service unavailable';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(WeatherService.getWeatherForecast('London')).rejects.toThrow(errorMessage);
      expect(axios.get).toHaveBeenCalledWith('/api/weather/forecast/London');
    });
  });

  describe('getWeatherByCoordinates', () => {
    it('should fetch weather by coordinates successfully', async () => {
      const mockWeatherData = {
        location: 'New York',
        temperature: 20,
        description: 'Sunny'
      };

      axios.get.mockResolvedValueOnce({ data: mockWeatherData });

      const result = await WeatherService.getWeatherByCoordinates(40.7128, -74.0060);

      expect(axios.get).toHaveBeenCalledWith('/api/weather/coordinates/40.7128/-74.006');
      expect(result).toEqual(mockWeatherData);
    });

    it('should handle coordinates API errors', async () => {
      const errorMessage = 'Coordinates service unavailable';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(WeatherService.getWeatherByCoordinates(40.7128, -74.0060)).rejects.toThrow(errorMessage);
    });

    it('should handle invalid coordinates', async () => {
      const errorMessage = 'Invalid coordinates';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(WeatherService.getWeatherByCoordinates(999, 999)).rejects.toThrow(errorMessage);
    });
  });

  describe('formatWeatherResponse', () => {
    it('should format weather data correctly', () => {
      const weatherData = {
        location: 'New York',
        country: 'US',
        temperature: 20,
        feelsLike: 22,
        description: 'Partly cloudy',
        humidity: 65,
        windSpeed: 15,
        visibility: 10,
        sunrise: '06:30',
        sunset: '19:45'
      };

      const formatted = WeatherService.formatWeatherResponse(weatherData);

      expect(formatted).toContain('Current weather in New York, US:');
      expect(formatted).toContain('Temperature: 20°C (feels like 22°C)');
      expect(formatted).toContain('Conditions: Partly cloudy');
      expect(formatted).toContain('Humidity: 65%');
      expect(formatted).toContain('Wind Speed: 15 km/h');
      expect(formatted).toContain('Visibility: 10 km');
      expect(formatted).toContain('Sunrise: 06:30');
      expect(formatted).toContain('Sunset: 19:45');
    });

    it('should handle missing weather data', () => {
      const weatherData = {
        location: 'Unknown',
        country: 'Unknown',
        temperature: null,
        feelsLike: null,
        description: 'Unknown',
        humidity: null,
        windSpeed: null,
        visibility: null,
        sunrise: null,
        sunset: null
      };

      const formatted = WeatherService.formatWeatherResponse(weatherData);

      expect(formatted).toContain('Current weather in Unknown, Unknown:');
      expect(formatted).toContain('Temperature: null°C (feels like null°C)');
      expect(formatted).toContain('Conditions: Unknown');
    });
  });

  describe('formatForecastResponse', () => {
    it('should format forecast data correctly', () => {
      const forecastData = {
        location: 'London',
        country: 'UK',
        forecasts: [
          {
            date: '2024-01-15T00:00:00Z',
            temperature: 12,
            description: 'Rainy'
          },
          {
            date: '2024-01-16T00:00:00Z',
            temperature: 15,
            description: 'Cloudy'
          }
        ]
      };

      const formatted = WeatherService.formatForecastResponse(forecastData);

      expect(formatted).toContain('5-day forecast for London, UK:');
      expect(formatted).toContain('• Mon, Jan 15: 12°C, Rainy');
      expect(formatted).toContain('• Tue, Jan 16: 15°C, Cloudy');
    });

    it('should handle empty forecast data', () => {
      const forecastData = {
        location: 'Unknown',
        country: 'Unknown',
        forecasts: []
      };

      const formatted = WeatherService.formatForecastResponse(forecastData);

      expect(formatted).toContain('5-day forecast for Unknown, Unknown:');
      expect(formatted).not.toContain('•');
    });

    it('should handle single forecast', () => {
      const forecastData = {
        location: 'Paris',
        country: 'France',
        forecasts: [
          {
            date: '2024-01-15T00:00:00Z',
            temperature: 18,
            description: 'Sunny'
          }
        ]
      };

      const formatted = WeatherService.formatForecastResponse(forecastData);

      expect(formatted).toContain('5-day forecast for Paris, France:');
      expect(formatted).toContain('• Mon, Jan 15: 18°C, Sunny');
    });
  });

  describe('getCurrentLocationWeather', () => {
    it('should get weather for current location successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      const mockWeatherData = {
        location: 'New York',
        temperature: 20,
        description: 'Sunny'
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      axios.get.mockResolvedValueOnce({ data: mockWeatherData });

      const result = await WeatherService.getCurrentLocationWeather();

      expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
      expect(axios.get).toHaveBeenCalledWith('/api/weather/coordinates/40.7128/-74.006');
      expect(result).toEqual(mockWeatherData);
    });

    it('should handle geolocation not supported', async () => {
      // Remove geolocation from navigator
      const originalGeolocation = navigator.geolocation;
      delete navigator.geolocation;

      await expect(WeatherService.getCurrentLocationWeather()).rejects.toThrow('Geolocation not supported');

      // Restore geolocation
      navigator.geolocation = originalGeolocation;
    });

    it('should handle geolocation permission denied', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 1, message: 'Permission denied' });
      });

      await expect(WeatherService.getCurrentLocationWeather()).rejects.toThrow('Unable to get location');
    });

    it('should handle geolocation timeout', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 3, message: 'Timeout' });
      });

      await expect(WeatherService.getCurrentLocationWeather()).rejects.toThrow('Unable to get location');
    });

    it('should handle weather API error after getting location', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.0060
        }
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const errorMessage = 'Weather service unavailable';
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(WeatherService.getCurrentLocationWeather()).rejects.toThrow(errorMessage);
    });

    it('should handle geolocation position unavailable', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation((success, error) => {
        error({ code: 2, message: 'Position unavailable' });
      });

      await expect(WeatherService.getCurrentLocationWeather()).rejects.toThrow('Unable to get location');
    });
  });

  describe('Error Handling', () => {
    it('should log errors to console', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const errorMessage = 'Network error';
      
      axios.get.mockRejectedValueOnce(new Error(errorMessage));

      try {
        await WeatherService.getCurrentWeather('New York');
      } catch (error) {
        // Expected to throw
      }

      expect(consoleSpy).toHaveBeenCalledWith('Weather service error:', expect.any(Error));
      consoleSpy.mockRestore();
    });

    it('should handle network timeout', async () => {
      axios.get.mockRejectedValueOnce(new Error('Request timeout'));

      await expect(WeatherService.getCurrentWeather('New York')).rejects.toThrow('Request timeout');
    });

    it('should handle malformed response', async () => {
      axios.get.mockResolvedValueOnce({ data: null });

      const result = await WeatherService.getCurrentWeather('New York');
      expect(result).toBeNull();
    });
  });

  describe('URL Encoding', () => {
    it('should properly encode special characters in location names', async () => {
      const mockWeatherData = { location: 'München' };
      axios.get.mockResolvedValueOnce({ data: mockWeatherData });

      await WeatherService.getCurrentWeather('München');

      expect(axios.get).toHaveBeenCalledWith('/api/weather/current/M%C3%BCnchen');
    });

    it('should handle locations with spaces and special characters', async () => {
      const mockWeatherData = { location: 'San José' };
      axios.get.mockResolvedValueOnce({ data: mockWeatherData });

      await WeatherService.getCurrentWeather('San José');

      expect(axios.get).toHaveBeenCalledWith('/api/weather/current/San%20Jos%C3%A9');
    });
  });
}); 