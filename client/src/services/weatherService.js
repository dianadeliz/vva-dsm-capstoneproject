import axios from 'axios';

class WeatherService {
  static async getCurrentWeather(location) {
    try {
      const response = await axios.get(`/api/weather/current/${encodeURIComponent(location)}`);
      return response.data;
    } catch (error) {
      console.error('Weather service error:', error);
      throw error;
    }
  }

  static async getWeatherForecast(location) {
    try {
      const response = await axios.get(`/api/weather/forecast/${encodeURIComponent(location)}`);
      return response.data;
    } catch (error) {
      console.error('Weather forecast service error:', error);
      throw error;
    }
  }

  static async getWeatherByCoordinates(lat, lon) {
    try {
      const response = await axios.get(`/api/weather/coordinates/${lat}/${lon}`);
      return response.data;
    } catch (error) {
      console.error('Weather coordinates service error:', error);
      throw error;
    }
  }

  static formatWeatherResponse(weatherData) {
    return `Current weather in ${weatherData.location}, ${weatherData.country}:
• Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)
• Conditions: ${weatherData.description}
• Humidity: ${weatherData.humidity}%
• Wind Speed: ${weatherData.windSpeed} km/h
• Visibility: ${weatherData.visibility} km
• Sunrise: ${weatherData.sunrise}
• Sunset: ${weatherData.sunset}`;
  }

  static formatForecastResponse(forecastData) {
    let response = `5-day forecast for ${forecastData.location}, ${forecastData.country}:\n`;
    
    forecastData.forecasts.forEach((forecast, index) => {
      const date = new Date(forecast.date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
      response += `• ${date}: ${forecast.temperature}°C, ${forecast.description}\n`;
    });
    
    return response;
  }

  static async getCurrentLocationWeather() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const weatherData = await this.getWeatherByCoordinates(latitude, longitude);
            resolve(weatherData);
          } catch (error) {
            reject(error);
          }
        },
        (error) => {
          reject(new Error('Unable to get location'));
        }
      );
    });
  }
}

export default WeatherService; 