# HomeHelp AI Assistant - Complete Setup Guide

A comprehensive MERN stack AI-powered home assistant that helps users with household problems including pharmacy questions, cooking issues, electrical problems, and general maintenance using Google Gemini AI.

## 🏠 Features

- **AI-Powered Assistance**: Integrated with Google Gemini for intelligent responses
- **Category-Based Help**: Pharmacy, Cooking, Electrical, Plumbing, Cleaning, Gardening, Pest Control
- **Safety First**: Always recommends professional help for dangerous tasks
- **User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **History Tracking**: Keep track of past queries and solutions with analytics
- **Modern UI**: Clean, light-themed, responsive design with Tailwind CSS
- **Real-time Chat**: Interactive chat interface with message history
- **Favorites System**: Save important conversations for quick access
- **Feedback System**: Rate responses and provide feedback for improvement

## 🛠️ Tech Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Zustand for state management
- Heroicons for icons

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Google Gemini AI integration
- Helmet for security
- CORS for cross-origin requests
- Rate limiting for API protection

## 📁 Project Structure

```
homeHelp chatBot/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Zustand state management
│   │   └── utils/          # Utility functions
│   ├── public/
│   └── package.json
├── server/                 # Express backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   └── utils/          # Utility functions
│   └── package.json
└── README.md
```
└── README.md
```

## 🚀 Quick Start & Complete Setup

### Prerequisites
- Node.js (version 18 or higher)
- npm or yarn package manager
- MongoDB (local installation or MongoDB Atlas cloud)
- Google Gemini API key

### Installation & Setup

1. **Navigate to project directory:**
   ```bash
   cd "homeHelp chatBot"
   ```

2. **Install server dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies:**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Configuration:**

   **Server Environment (.env in server/ directory):**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/homehelp-ai
   JWT_SECRET=7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0
   GEMINI_API_KEY=AIzaSyA33Ey0Z-m_ThjFBPUeD0PdvkFiT9zcBEI
   NODE_ENV=development
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

   **Client Environment (.env in client/ directory):**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   VITE_APP_NAME=HomeHelp AI Assistant
   VITE_APP_VERSION=1.0.0
   ```

5. **Database Setup:**
   ```bash
   # Option 1: Local MongoDB
   mongod

   # Option 2: MongoDB Atlas (update MONGODB_URI in .env)
   # Use your Atlas connection string
   ```

6. **Start Development Servers:**

   **Terminal 1 - Backend Server:**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 - Frontend Development:**
   ```bash
   cd client
   npm run dev
   ```

7. **Access the Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 💡 Categories Supported

- 💊 **Pharmacy & Health**: Medication info, drug interactions, health advice
- 👨‍🍳 **Cooking & Kitchen**: Recipes, cooking tips, food safety, kitchen techniques
- ⚡ **Electrical**: Electrical repairs, safety tips, troubleshooting
- 🔧 **Plumbing**: Plumbing repairs, water issues, maintenance tips
- 🧹 **Cleaning**: Cleaning tips, stain removal, home maintenance
- 🌱 **Gardening**: Plant care, gardening tips, pest control
- 🐛 **Pest Control**: Natural pest control methods and prevention
- ❓ **General**: General household questions and advice

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### User Management
- `GET /api/user/me` - Get user profile
- `PUT /api/user/profile` - Update profile
- `PUT /api/user/password` - Change password

### AI Assistant
- `POST /api/ai/query` - Send query to AI
- `GET /api/ai/suggestions/:category` - Get category suggestions
- `GET /api/ai/popular` - Get popular queries
- `GET /api/ai/health` - AI service health check

### History Management
- `GET /api/history` - Get conversation history
- `GET /api/history/:id` - Get specific conversation
- `POST /api/history/:id/feedback` - Add feedback
- `PUT /api/history/:id/favorite` - Toggle favorite
- `DELETE /api/history/:id` - Delete conversation
- `GET /api/history/analytics` - Get usage analytics
- `DELETE /api/history` - Clear all history

## 🎨 Development Commands

### Server Commands
```bash
npm run dev          # Start development server with nodemon
npm run start        # Start production server
npm run test         # Run tests
npm run lint         # Run ESLint
```

### Client Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🔐 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication with secure secrets
- Rate limiting on API endpoints (100 requests per 15 minutes)
- CORS protection with configurable origins
- Helmet security headers
- Input validation and sanitization
- XSS protection
- MongoDB injection prevention

## 🧪 Testing & Troubleshooting

### Common Issues

**1. MongoDB Connection Error:**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
*Solution*: Make sure MongoDB is running locally or check your Atlas connection string.

**2. Gemini API Key Error:**
```
Error: Invalid API key
```
*Solution*: Verify your Gemini API key is correct and has proper permissions.

**3. CORS Error:**
```
Access to fetch blocked by CORS policy
```
*Solution*: Check that `CORS_ORIGIN` in server environment matches your frontend URL.

**4. JWT Token Issues:**
```
Error: jwt malformed
```
*Solution*: Clear browser localStorage and log in again.

### Performance Optimization
- Enable gzip compression (configured)
- MongoDB indexes (configured)
- API response caching
- Efficient Gemini API usage

## 🚀 Production Deployment

### Build for Production
```bash
# Build client
cd client
npm run build
# Built files will be in client/dist/
```

### Environment Setup for Production
- Update environment variables for production
- Use production MongoDB instance
- Set NODE_ENV=production
- Configure proper CORS origins
- Use strong JWT secrets
- Enable HTTPS

### Deployment Platforms
- **Vercel**: Frontend deployment
- **Heroku**: Full-stack deployment
- **DigitalOcean**: VPS deployment
- **AWS**: EC2 or Lambda deployment

## 📊 Environment Variables Reference

### Server Environment Variables
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Server port | No | 5000 |
| MONGODB_URI | MongoDB connection string | Yes | - |
| JWT_SECRET | JWT signing secret | Yes | - |
| GEMINI_API_KEY | Google Gemini API key | Yes | - |
| NODE_ENV | Environment mode | No | development |
| CORS_ORIGIN | Allowed CORS origin | No | * |
| RATE_LIMIT_WINDOW_MS | Rate limit window | No | 900000 |
| RATE_LIMIT_MAX_REQUESTS | Max requests per window | No | 100 |

### Client Environment Variables
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| VITE_API_BASE_URL | Backend API URL | No | http://localhost:5000/api |
| VITE_APP_NAME | Application name | No | HomeHelp AI |
| VITE_APP_VERSION | Application version | No | 1.0.0 |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Gemini AI for intelligent responses
- MongoDB for reliable data storage
- React and Vite for modern frontend development
- Tailwind CSS for beautiful styling
- The open-source community for amazing tools and libraries

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimers

- This application provides general guidance only
- Always consult professionals for medical, electrical, or safety concerns
- The AI responses are for informational purposes
- Users are responsible for their own safety when following suggestions