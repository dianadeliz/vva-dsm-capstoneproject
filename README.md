# Voice Virtual Assistant

A comprehensive Voice Virtual Assistant with authentication, weather, navigation, chat, and translation features. Built with React, Node.js, and MongoDB.

## 🌟 Features

### Authentication System
- **User Registration**: Create new accounts with username, email, and password
- **User Login**: Secure authentication with JWT tokens
- **Password Reset**: Email-based password recovery system
- **Session Management**: Persistent login sessions

### Dashboard Features
- **Weather**: Redirects to Google Weather for current conditions and forecasts
- **Navigation**: Opens Google Maps with location search and directions
- **Chat Assistant**: AI-powered conversation with voice input/output
- **Translation**: Multi-language text translation with voice support

### Voice Capabilities
- **Speech Recognition**: Voice input for all features
- **Text-to-Speech**: Audio output for responses
- **Voice Commands**: Navigate the app using voice
- **Real-time Transcription**: Live voice-to-text conversion

### Database Integration
- **MongoDB Atlas**: Cloud database for user data and chat history
- **User Management**: Secure user profiles and authentication
- **Chat History**: Persistent conversation storage
- **Session Tracking**: User activity monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account (or local MongoDB)
- Google Translate API key (optional, for production translation)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voice-virtual-assistant
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   
   Create a `.env` file in the `server` directory:
   ```env
   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/voice_assistant?retryWrites=true&w=majority
   
   # JWT Secret
   JWT_SECRET=your_jwt_secret_key_here
   
   # Email Configuration (for password reset)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Google Translate API Key (optional)
   GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key
   
   # OpenRouter API Key (for AI chat functionality)
   OPENROUTER_API_KEY=your_openrouter_api_key
   
   # Site Configuration (for OpenRouter)
   SITE_URL=http://localhost:3000
   SITE_NAME=Voice Virtual Assistant
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend (port 3000).

## 📁 Project Structure

```
voice-virtual-assistant/
├── server/                 # Backend Node.js server
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Authentication middleware
│   ├── index.js           # Server entry point
│   └── package.json       # Backend dependencies
├── client/                # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── App.js         # Main app component
│   │   └── index.js       # React entry point
│   └── package.json       # Frontend dependencies
└── package.json           # Root package.json
```

## 🔧 Configuration

### MongoDB Setup
1. Create a MongoDB Atlas account
2. Create a new cluster
3. Get your connection string
4. Update the `MONGODB_URI` in your `.env` file

### Email Configuration (for password reset)
1. Enable 2-factor authentication on your Gmail account
2. Generate an app password
3. Update the email settings in your `.env` file

### Google Translate API (optional)
1. Go to Google Cloud Console
2. Enable the Translate API
3. Create credentials
4. Add the API key to your `.env` file

### OpenRouter API (for AI chat functionality)
1. Go to [OpenRouter](https://openrouter.ai/)
2. Create an account and get your API key
3. Add the API key to your `.env` file

## 🎯 Usage

### Registration & Login
1. Visit `http://localhost:3000`
2. Click "Sign up" to create a new account
3. Fill in your details and register
4. You'll be automatically logged in and redirected to the dashboard

### Voice Assistant
1. Click the microphone button in the bottom-right corner
2. Speak your command (e.g., "check weather", "open navigation")
3. The assistant will respond with voice and text

### Weather
1. Click the Weather card on the dashboard
2. Enter a location or use current location
3. Click "Search" to open Google Weather

### Navigation
1. Click the Navigation card on the dashboard
2. Enter a destination
3. Click "Search" or "Get Directions" to open Google Maps

### Chat Assistant
1. Click the Chat Assistant card
2. Type or speak your message
3. The AI will respond with text and voice

### Translation
1. Click the Translation card
2. Select source and target languages
3. Enter text or use voice input
4. Click "Translate" and optionally hear the result

## 🔒 Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Secure cross-origin requests
- **Helmet**: Security headers for Express

## 🎨 UI/UX Features

- **Modern Design**: Clean, responsive interface
- **Voice Integration**: Seamless voice input/output
- **Real-time Feedback**: Loading states and notifications
- **Mobile Responsive**: Works on all device sizes
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use production MongoDB URI
- Configure production email settings
- Set up proper CORS origins

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password/:token` - Password reset
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/chat` - Save chat message
- `GET /api/user/chat/:sessionId` - Get chat history
- `GET /api/user/chat-sessions` - Get all chat sessions

### Translation
- `POST /api/translation/translate` - Translate text
- `GET /api/translation/languages` - Get supported languages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code comments

## 🔮 Future Enhancements

- [ ] Real-time chat with WebSocket
- [ ] Advanced AI integration (OpenAI, Claude)
- [ ] Voice biometrics
- [ ] Multi-language voice recognition
- [ ] Calendar integration
- [ ] Task management
- [ ] Smart home integration
- [ ] Mobile app version

---

**Built with ❤️ using React, Node.js, and MongoDB** 