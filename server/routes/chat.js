const express = require('express');
const auth = require('../middleware/auth');
const axios = require('axios');
const router = express.Router();

// Weather API functions
const getWeatherData = async (location) => {
  if (!process.env.WEATHER_API_KEY) {
    throw new Error('Weather API key not configured');
  }

  const response = await axios.get(
    `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${process.env.WEATHER_API_KEY}&units=metric`
  );

  const weatherData = response.data;
  return {
    location: weatherData.name,
    country: weatherData.sys.country,
    temperature: Math.round(weatherData.main.temp),
    feelsLike: Math.round(weatherData.main.feels_like),
    humidity: weatherData.main.humidity,
    description: weatherData.weather[0].description,
    windSpeed: Math.round(weatherData.wind.speed * 3.6),
    visibility: weatherData.visibility / 1000,
    sunrise: new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString(),
    sunset: new Date(weatherData.sys.sunset * 1000).toLocaleTimeString()
  };
};

const formatWeatherResponse = (weatherData) => {
  return `Current weather in ${weatherData.location}, ${weatherData.country}:
• Temperature: ${weatherData.temperature}°C (feels like ${weatherData.feelsLike}°C)
• Conditions: ${weatherData.description}
• Humidity: ${weatherData.humidity}%
• Wind Speed: ${weatherData.windSpeed} km/h
• Visibility: ${weatherData.visibility} km
• Sunrise: ${weatherData.sunrise}
• Sunset: ${weatherData.sunset}`;
};

// AI chat route using OpenRouter
router.post('/ai', auth, async (req, res) => {
  const { message, imageUrl } = req.body;

  try {
    // Check if this is a weather-related question
    const lowerMessage = message.toLowerCase();
    const weatherKeywords = ['weather', 'temperature', 'forecast', 'climate', 'hot', 'cold', 'rain', 'sunny', 'cloudy'];
    const isWeatherQuestion = weatherKeywords.some(keyword => lowerMessage.includes(keyword));

    if (isWeatherQuestion) {
      // Extract location from the message
      let location = 'New York'; // default location
      
      // Common location patterns
      const locationPatterns = [
        /weather (?:in|for|at) (.+)/i,
        /temperature (?:in|for|at) (.+)/i,
        /forecast (?:for|in|at) (.+)/i,
        /how's the weather (?:in|at) (.+)/i,
        /what's the weather (?:like|in|at) (.+)/i
      ];

      for (const pattern of locationPatterns) {
        const match = message.match(pattern);
        if (match && match[1]) {
          location = match[1].trim();
          break;
        }
      }

      // If no specific location found, try to extract city names
      if (location === 'New York') {
        const cityPattern = /(?:weather|temperature|forecast).*?(?:in|for|at)?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i;
        const cityMatch = message.match(cityPattern);
        if (cityMatch && cityMatch[1]) {
          location = cityMatch[1].trim();
        }
      }

      try {
        // Get real weather data
        const weatherData = await getWeatherData(location);
        const weatherResponse = formatWeatherResponse(weatherData);
        
        res.json({ aiResponse: weatherResponse });
        return;
      } catch (weatherError) {
        console.error('Weather API error:', weatherError);
        // Fall back to AI response if weather API fails
      }
    }

    // Regular AI response
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: "qwen/qwen2.5-vl-32b-instruct:free",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: message },
              ...(imageUrl
                ? [{ type: "image_url", image_url: { url: imageUrl } }]
                : [])
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || '',
          'X-Title': process.env.SITE_NAME || '',
        }
      }
    );
    res.json({ aiResponse: response.data.choices[0].message.content });
  } catch (error) {
    console.error('AI chat error:', error?.response?.data || error.message);
    res.status(500).json({ error: 'AI chat service error', details: error?.response?.data || error.message });
  }
});

module.exports = router; 