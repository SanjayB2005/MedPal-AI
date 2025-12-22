import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  BeakerIcon,
  FireIcon,
  BoltIcon,
  HomeIcon,
  UserGroupIcon,
  ArrowRightIcon,
  SparklesIcon,
  ChatBubbleLeftRightIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import LocationSearch from '../components/LocationSearch'

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [showLocationSearch, setShowLocationSearch] = useState(false)
  const [locationServiceType, setLocationServiceType] = useState('')

  const categories = [
    {
      id: 'pharmacy',
      name: 'Pharmacy & Health',
      icon: BeakerIcon,
      emoji: '💊',
      description: 'Get guidance on medications, drug interactions, and general health questions.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      examples: [
        'Can I take this medication with food?',
        'What are the side effects of this drug?',
        'How should I store my medications?',
        'When should I see a doctor vs. pharmacist?'
      ],
      disclaimer: 'Always consult healthcare professionals for medical advice. This guidance is for informational purposes only.'
    },
    {
      id: 'cooking',
      name: 'Cooking & Kitchen',
      icon: FireIcon,
      emoji: '👨‍🍳',
      description: 'Troubleshoot cooking problems, get recipes, and learn kitchen techniques.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-700',
      examples: [
        'My cake sank in the middle, what went wrong?',
        'How do I fix oversalted soup?',
        'Best way to sharpen kitchen knives?',
        'How to prevent pasta from sticking?'
      ]
    },
    {
      id: 'electrical',
      name: 'Electrical & Safety',
      icon: BoltIcon,
      emoji: '⚡',
      description: 'Safe electrical maintenance, troubleshooting, and when to call professionals.',
      color: 'from-yellow-400 to-orange-400',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      examples: [
        'My outlet stopped working, what should I check?',
        'How do I safely replace a light switch?',
        'Why does my circuit breaker keep tripping?',
        'When should I call an electrician?'
      ],
      disclaimer: 'For safety, always turn off power at the breaker before electrical work. When in doubt, consult a licensed electrician.'
    },
    {
      id: 'household',
      name: 'General Household',
      icon: HomeIcon,
      emoji: '🏠',
      description: 'Home maintenance, cleaning, organization, and general repairs.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      examples: [
        'How do I unclog a slow drain?',
        'Best way to remove carpet stains?',
        'How to organize a small space?',
        'DIY furniture repair techniques?'
      ]
    },
    {
      id: 'professional',
      name: 'Find Professionals',
      icon: UserGroupIcon,
      emoji: '🔧',
      description: 'Connect with certified professionals for complex jobs and expert services.',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      examples: [
        'Find licensed electricians near me',
        'Connect with certified plumbers',
        'Locate HVAC specialists',
        'Get quotes for home repairs'
      ]
    }
  ]

  const CategoryCard = ({ category }) => {
    const Icon = category.icon
    const isSelected = selectedCategory === category.id

    return (
      <div className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer transform hover:scale-[1.02] ${
        isSelected 
          ? `border-gradient-to-r ${category.color} bg-white shadow-xl` 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
      }`} 
           onClick={() => setSelectedCategory(isSelected ? null : category.id)}>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className={`w-full h-full bg-gradient-to-br ${category.color}`}></div>
        </div>
        
        <div className="relative p-6">
          <div className="flex items-start gap-4">
            {/* Icon with enhanced styling */}
            <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${category.color} text-white flex-shrink-0 shadow-lg group-hover:shadow-xl transition-shadow`}>
              <Icon className="h-7 w-7" />
              <div className="absolute -top-1 -right-1 text-2xl">{category.emoji}</div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-gray-800">
                  {category.name}
                </h3>
                {isSelected && <SparklesIcon className="h-5 w-5 text-yellow-500 animate-pulse" />}
              </div>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {category.description}
              </p>
            
              {isSelected && (
                <div className="mt-6 space-y-4 animate-fadeIn">
                  <div className={`p-5 ${category.bgColor} rounded-xl border border-gray-200`}>
                    <h4 className={`font-semibold ${category.textColor} mb-4 flex items-center gap-2`}>
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      Example Questions
                    </h4>
                    <ul className="space-y-3">
                      {category.examples.map((example, index) => (
                        <li key={index} className="flex items-start gap-3 text-sm text-gray-700">
                          <span className={`inline-flex items-center justify-center w-6 h-6 ${category.bgColor} ${category.textColor} rounded-full text-xs font-medium mt-0.5 border-2`}>
                            {index + 1}
                          </span>
                          <span className="leading-relaxed">"{example}"</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {category.disclaimer && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-amber-500 text-lg mt-0.5">⚠️</div>
                        <p className="text-sm text-amber-800 leading-relaxed">
                          {category.disclaimer}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-3 pt-2">
                    <Link 
                      to="/dashboard" 
                      className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${category.color} text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                    >
                      <ChatBubbleLeftRightIcon className="h-5 w-5" />
                      Start Chatting
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                    {category.id === 'pharmacy' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setLocationServiceType('pharmacy')
                          setShowLocationSearch(true)
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-3 ${category.bgColor} ${category.textColor} border-2 font-medium rounded-xl hover:shadow-md transition-all duration-200`}
                      >
                        <MapPinIcon className="h-4 w-4" />
                        Find Local Pharmacies
                      </button>
                    )}
                    {category.id === 'electrical' && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation()
                          setLocationServiceType('electrician')
                          setShowLocationSearch(true)
                        }}
                        className={`inline-flex items-center gap-2 px-4 py-3 ${category.bgColor} ${category.textColor} border-2 font-medium rounded-xl hover:shadow-md transition-all duration-200`}
                      >
                        <MapPinIcon className="h-4 w-4" />
                        Find Local Electricians
                      </button>
                    )}
                    {category.id !== 'pharmacy' && category.id !== 'electrical' && (
                      <button className={`inline-flex items-center gap-2 px-4 py-3 ${category.bgColor} ${category.textColor} border-2 font-medium rounded-xl hover:shadow-md transition-all duration-200`}>
                        Learn More
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Enhanced Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl text-white shadow-lg">
              <SparklesIcon className="h-8 w-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Browse Categories
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose a category below to explore examples and get personalized help with your household needs. 
            <span className="text-blue-600 font-semibold">Click on any card to see more details!</span>
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid gap-8 lg:grid-cols-2 mb-16">
          {categories.map((category) => (
            <CategoryCard key={category.id} category={category} />
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-12 shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-white opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                                 radial-gradient(circle at 75% 75%, white 2px, transparent 2px)`,
                backgroundSize: '50px 50px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 mb-4">
                <SparklesIcon className="h-6 w-6 text-yellow-300" />
                <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wider">Ready to start?</span>
              </div>
              <h3 className="text-3xl font-bold text-white mb-4">
                Get Instant Help with Your Questions
              </h3>
              <p className="text-blue-100 text-lg mb-8 max-w-md mx-auto leading-relaxed">
                Jump straight to our AI assistant and start asking questions across any category. 
                No setup required!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link 
                  to="/dashboard" 
                  className="inline-flex items-center gap-3 px-8 py-4 bg-white text-blue-700 font-bold rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
                >
                  <ChatBubbleLeftRightIcon className="h-6 w-6" />
                  Start Chatting Now
                  <ArrowRightIcon className="h-5 w-5" />
                </Link>
                
              </div>
            </div>
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

export default Categories