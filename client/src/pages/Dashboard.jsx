import { useState, useRef, useEffect } from 'react'
import { useChatStore } from '../store/chatStore'
import { useAuthStore } from '../store/authStore'
import { aiAPI } from '../services/api'
import MarkdownRenderer from '../components/MarkdownRenderer'
import LocationSearch from '../components/LocationSearch'
import LocationSuggestions from '../components/LocationSuggestions'
import { 
  PaperAirplaneIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhoneIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  UserIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const [inputMessage, setInputMessage] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [locationServiceType, setLocationServiceType] = useState('')
  const [userLocation, setUserLocation] = useState(null)
  const messagesEndRef = useRef(null)
  
  const { messages, isLoading, addMessagePair, setLoading } = useChatStore()
  const { user } = useAuthStore()

  const categories = [
    { 
      id: 'pharmacy', 
      name: '💊 Pharmacy & Health', 
      description: 'Medication & health guidance',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'cooking', 
      name: '👨‍🍳 Cooking & Kitchen', 
      description: 'Recipes & kitchen troubleshooting',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      borderColor: 'border-orange-200'
    },
    { 
      id: 'electrical', 
      name: '⚡ Electrical & Safety', 
      description: 'Safe electrical maintenance',
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200'
    },
    { 
      id: 'household', 
      name: '🏠 General Household', 
      description: 'Maintenance & repairs',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      borderColor: 'border-green-200'
    },
    { 
      id: 'other', 
      name: '❓ Other Questions', 
      description: 'General household questions',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-200'
    }
  ]

  const quickActions = [
    "🎂 My cake sank in the center, what went wrong?",
    "💊 Is it safe to take ibuprofen with my medication?",
    "⚡ My outlet stopped working, what should I check?",
    "🚿 How do I unclog a slow drain?",
    "🧽 Best way to remove stains from carpet?",
    "🔧 How to fix a squeaky door hinge?",
    "🍳 How to prevent my pasta from sticking together?",
    "📱 My phone charger stopped working, can I fix it?"
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Try to get user location for location suggestions
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          })
        },
        (error) => {
          console.log('Location access denied or failed:', error.message)
          // Don't set error state, just continue without location
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
      )
    }
  }, [])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!inputMessage.trim() || isLoading) return

    const userMessage = inputMessage.trim()
    setInputMessage('')
    setLoading(true)

    try {
      const response = await aiAPI.sendQuery({
        query: userMessage,
        category: selectedCategory || 'general'
      })

      // Add location suggestion data to the response if present
      const enhancedResponse = {
        ...response,
        showLocationSuggestions: response.suggest_location_search && 
          response.location_service_type && 
          response.location_service_type !== 'cooking'
      }

      addMessagePair(userMessage, enhancedResponse)
    } catch (error) {
      console.error('Error sending query:', error)
      
      // Handle authentication error
      if (error.response?.status === 401) {
        addMessagePair(userMessage, {
          answer_text: `🔐 **Please Sign In to Continue**\n\nTo save your conversation history and continue using the AI assistant, please [sign in to your account](/login) or [create a new account](/register).\n\nYour conversations will be saved for future reference once you're logged in!`,
          steps: [],
          difficulty: 'easy',
          safety_warnings: [],
          suggest_professional: false,
          confidence_score: 0,
          formatted_response: true,
          suggest_location_search: false,
          location_service_type: null,
          location_message: null
        })
      } else {
        // Add error message to chat
        addMessagePair(userMessage, {
          answer_text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
          steps: [],
          difficulty: 'easy',
          safety_warnings: [],
          suggest_professional: false,
          confidence_score: 0,
          suggest_location_search: false,
          location_service_type: null,
          location_message: null
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAction = (action) => {
    setInputMessage(action)
  }

  const DifficultyBadge = ({ difficulty }) => {
    const colors = {
      easy: 'bg-secondary-100 text-secondary-700',
      medium: 'bg-accent-100 text-accent-700',
      hard: 'bg-red-100 text-red-700'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[difficulty]}`}>
        {difficulty}
      </span>
    )
  }

  const MessageBubble = ({ message }) => {
    if (message.type === 'user') {
      return (
        <div className="flex justify-end mb-4">
          <div className="message-bubble message-user">
            <p>{message.content}</p>
          </div>
        </div>
      )
    }

    // Check if this is a new formatted response or old structured response
    if (message.formatted_response) {
      return (
        <div className="flex justify-start mb-6">
          <MarkdownRenderer 
            content={message.content}
            difficulty={message.difficulty}
            suggestProfessional={message.suggestProfessional}
            confidenceScore={message.confidenceScore}
            suggestLocationSearch={message.suggest_location_search}
            locationServiceType={message.location_service_type}
            locationMessage={message.location_message}
            userLocation={userLocation}
          />
        </div>
      )
    }

    // Legacy format fallback (for old structured responses)
    return (
      <div className="flex justify-start mb-6">
        <div className="max-w-5xl w-full">
          <div className="message-bubble message-assistant">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          
          {/* Steps */}
          {message.steps && message.steps.length > 0 && (
            <div className="mt-3 bg-white rounded-xl border border-neutral-200 p-4">
              <h4 className="font-medium text-neutral-900 mb-3 flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-secondary-500 mr-2" />
                Step-by-step guide
                {message.difficulty && <DifficultyBadge difficulty={message.difficulty} />}
              </h4>
              <ol className="space-y-2">
                {message.steps.map((step, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mr-3 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-neutral-700">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Safety Warnings */}
          {message.safetyWarnings && message.safetyWarnings.length > 0 && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-4">
              <h4 className="font-medium text-red-900 mb-2 flex items-center">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
                Safety Warnings
              </h4>
              <ul className="space-y-1">
                {message.safetyWarnings.map((warning, index) => (
                  <li key={index} className="text-red-700 text-sm flex items-start">
                    <span className="mr-2">⚠️</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Professional Recommendation */}
          {message.suggestProfessional && (
            <div className="mt-3 bg-accent-50 border border-accent-200 rounded-xl p-4">
              <h4 className="font-medium text-accent-900 mb-2 flex items-center">
                <PhoneIcon className="h-5 w-5 text-accent-600 mr-2" />
                Professional Recommendation
              </h4>
              <p className="text-accent-800 text-sm mb-3">
                For this type of problem, we recommend consulting with a certified professional for safety and best results.
              </p>
              <button 
                onClick={() => {
                  setLocationServiceType('electrician') // Default, can be made dynamic
                  setShowLocationSearch(true)
                }}
                className="btn-secondary text-sm"
              >
                Find Professionals Near Me
              </button>
            </div>
          )}

          {/* Location Suggestions - Inline */}
          {message.suggest_location_search && message.location_service_type && (
            <LocationSuggestions 
              serviceType={message.location_service_type}
              userLocation={userLocation}
            />
          )}

          {/* Location Search Suggestion */}
          {message.suggest_location_search && message.location_service_type && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
                Find Local Professional Services
              </h4>
              <p className="text-blue-800 text-sm mb-3">
                {message.location_message}
              </p>
              <button 
                onClick={() => {
                  setLocationServiceType(message.location_service_type)
                  setShowLocationSearch(true)
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <MapPinIcon className="h-4 w-4" />
                <span>Find Nearby {message.location_service_type}s</span>
              </button>
            </div>
          )}

          {/* Confidence Score */}
          {message.confidenceScore !== undefined && (
            <div className="mt-2 text-xs text-neutral-500">
              Confidence: {Math.round(message.confidenceScore * 100)}%
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Enhanced Category Sidebar */}
      

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-auto p-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center min-h-[500px]">
              <div className="text-center max-w-2xl mx-auto">
                <div className="relative mb-8">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-20 animate-pulse"></div>
                  </div>
                  <div className="relative flex items-center justify-center">
                    <div className="p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl text-white shadow-2xl">
                      <SparklesIcon className="h-12 w-12 mx-auto" />
                    </div>
                  </div>
                </div>
                
                <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
                  👋 Welcome to your Med Pal!
                </h2>
                
                {/* Authentication Notice */}
                {!user && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="flex items-start gap-3">
                      <UserIcon className="h-6 w-6 text-amber-600 mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Save Your Conversation History</h4>
                        <p className="text-sm text-amber-700 mb-3">
                          To save your conversations and access them later, please sign in to your account.
                        </p>
                        <div className="flex gap-3">
                          <Link to="/login" className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-md hover:bg-amber-700 transition-colors">
                            Sign In
                          </Link>
                          <Link to="/register" className="text-xs text-amber-700 hover:text-amber-800 transition-colors border border-amber-300 px-3 py-1.5 rounded-md hover:bg-amber-100">
                            Create Account
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                               
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  I specialize in <span className="font-semibold text-blue-600">medical guidance</span> and 
                  <span className="font-semibold text-green-600"> healthcare facilities</span>. I also help with 
                  <span className="font-semibold text-yellow-600"> electrical issues</span> and 
                  <span className="font-semibold text-purple-600"> home maintenance</span>.
                </p>
                
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <div className="text-2xl mb-2">🎯</div>
                    <h3 className="font-semibold text-blue-800 mb-1">Safe & Reliable</h3>
                    <p className="text-sm text-blue-600">Get trusted advice with safety warnings when needed</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="text-2xl mb-2">⚡</div>
                    <h3 className="font-semibold text-green-800 mb-1">Instant Help</h3>
                    <p className="text-sm text-green-600">Get immediate answers to your household questions</p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>AI Assistant is online and ready</span>
                  </div>
                  <div className="hidden sm:block w-px h-4 bg-gray-300"></div>
                  <div className="text-sm text-gray-500">
                    Select a category or type your question below
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="message-bubble message-assistant">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-neutral-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Enhanced Input Area */}
        <div className="border-t border-gray-200/50 bg-white/90 backdrop-blur-sm">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask me anything about your household needs..."
                      className="w-full p-4 pr-12 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-0 transition-colors text-gray-900 placeholder-gray-500 bg-white shadow-sm"
                      disabled={isLoading}
                    />
                    {inputMessage && (
                      <button
                        type="button"
                        onClick={() => setInputMessage('')}
                        className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className={`p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-lg hover:shadow-xl transform transition-all duration-200 flex items-center justify-center min-w-[60px] ${
                    (!inputMessage.trim() || isLoading) ? 'opacity-50 cursor-not-allowed hover:shadow-lg hover:transform-none' : 'hover:scale-105'
                  }`}
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <PaperAirplaneIcon className="h-6 w-6" />
                  )}
                </button>
              </div>
              
              <div className="flex flex-wrap items-center gap-4 mt-4">
                {selectedCategory && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${categories.find(c => c.id === selectedCategory)?.bgColor} ${categories.find(c => c.id === selectedCategory)?.textColor}`}>
                    <div className="w-2 h-2 rounded-full bg-current"></div>
                    {categories.find(c => c.id === selectedCategory)?.name}
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <SparklesIcon className="h-4 w-4" />
                  <span>Powered by AI • Always consult professionals for complex issues</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      
      {/* Location Search Modal */}
      {showLocationSearch && (
        <LocationSearch 
          serviceType={locationServiceType}
          onClose={() => {
            setShowLocationSearch(false)
            setLocationServiceType('')
          }}
        />
      )}
    </div>
  )
}

export default Dashboard