const express = require('express');
const auth = require('../middleware/auth');
const axios = require('axios');
const router = express.Router();

// Get current weather by location
router.get('/current/:location', auth, async (req, res) => {
  const { location } = req.params;
  
  if (!process.env.WEATHER_API_KEY) {
    return res.status(500).json({ error: 'Weather API key not configured' });
  }

  try {
    // Using OpenWeatherMap API (you can change this to your preferred weather API)
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    const weatherData = response.data;
    
    // Format the response
    const formattedWeather = {
      location: weatherData.name,
      country: weatherData.sys.country,
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      windSpeed: Math.round(weatherData.wind.speed * 3.6), // Convert m/s to km/h
      windDirection: weatherData.wind.deg,
      visibility: weatherData.visibility / 1000, // Convert to km
      sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(),
      timestamp: new Date().toISOString()
    };

    res.json(formattedWeather);
  } catch (error) {
    console.error('Weather API error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Location not found' });
    } else if (error.response?.status === 401) {
      res.status(500).json({ error: 'Invalid weather API key' });
    } else {
      res.status(500).json({ error: 'Weather service error' });
    }
  }
});

// Get weather forecast by location
router.get('/forecast/:location', auth, async (req, res) => {
  const { location } = req.params;
  
  if (!process.env.WEATHER_API_KEY) {
    return res.status(500).json({ error: 'Weather API key not configured' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    const forecastData = response.data;
    
    // Group forecast by day and get daily forecasts
    const dailyForecasts = [];
    const dailyData = {};
    
    forecastData.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!dailyData[date]) {
        dailyData[date] = {
          date: date,
          temps: [],
          descriptions: [],
          icons: []
        };
      }
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].descriptions.push(item.weather[0].description);
      dailyData[date].icons.push(item.weather[0].icon);
    });

    // Calculate daily averages
    Object.values(dailyData).forEach(day => {
      const avgTemp = Math.round(day.temps.reduce((a, b) => a + b, 0) / day.temps.length);
      const mostFrequentDesc = day.descriptions.sort((a, b) => 
        day.descriptions.filter(v => v === a).length - day.descriptions.filter(v => v === b).length
      ).pop();
      
      dailyForecasts.push({
        date: day.date,
        temperature: avgTemp,
        description: mostFrequentDesc,
        icon: day.icons[0]
      });
    });

    res.json({
      location: forecastData.city.name,
      country: forecastData.city.country,
      forecasts: dailyForecasts.slice(0, 5) // 5-day forecast
    });
  } catch (error) {
    console.error('Weather forecast error:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      res.status(404).json({ error: 'Location not found' });
    } else if (error.response?.status === 401) {
      res.status(500).json({ error: 'Invalid weather API key' });
    } else {
      res.status(500).json({ error: 'Weather service error' });
    }
  }
});

// Get weather by coordinates
router.get('/coordinates/:lat/:lon', auth, async (req, res) => {
  const { lat, lon } = req.params;
  
  if (!process.env.WEATHER_API_KEY) {
    return res.status(500).json({ error: 'Weather API key not configured' });
  }

  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.WEATHER_API_KEY}&units=metric`
    );

    const weatherData = response.data;
    
    const formattedWeather = {
      location: weatherData.name,
      country: weatherData.sys.country,
      temperature: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      humidity: weatherData.main.humidity,
      pressure: weatherData.main.pressure,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      windSpeed: Math.round(weatherData.wind.speed * 3.6),
      windDirection: weatherData.wind.deg,
      visibility: weatherData.visibility / 1000,
      sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
      sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString(),
      timestamp: new Date().toISOString()
    };

    res.json(formattedWeather);
  } catch (error) {
    console.error('Weather coordinates error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Weather service error' });
  }
});

module.exports = router; 