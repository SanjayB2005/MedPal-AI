import { useState, useEffect } from 'react'
import { historyAPI } from '../services/api'
import {
  ClockIcon,
  ChatBubbleLeftIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

const History = () => {
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [selectedItem, setSelectedItem] = useState(null)
  const [error, setError] = useState(null)

  const fetchHistory = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Build query params
      const params = {
        page: 1,
        limit: 50
      }
      
      // Add search if provided
      if (searchQuery && searchQuery.trim()) {
        params.search = searchQuery.trim()
      }
      
      // Only add category if it's not 'all' or 'favorites'
      if (filterCategory && filterCategory !== 'all' && filterCategory !== 'favorites') {
        params.category = filterCategory
      }
      
      const response = await historyAPI.getHistory(params)
      
      // Transform the response data to match the expected format
      let transformedHistory = response.history.map(item => ({
        id: item._id,
        category: item.category,
        userQuery: item.userQuery,
        assistantSummary: item.assistantSummary,
        confidence: item.structuredResponse?.confidence_score || 0.7,
        createdAt: new Date(item.createdAt),
        favorite: item.isBookmarked || false,
        steps: item.structuredResponse?.steps || [],
        suggestProfessional: item.structuredResponse?.suggest_professional || false,
        disclaimer: item.category === 'pharmacy',
        safetyWarnings: item.structuredResponse?.safety_warnings || []
      }))
      
      // Client-side filter for favorites
      if (filterCategory === 'favorites') {
        transformedHistory = transformedHistory.filter(item => item.favorite)
      }
      
      setHistory(transformedHistory)
    } catch (error) {
      console.error('Failed to fetch history:', error)
      setError('Failed to load history. Please try again.')
      setHistory([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [filterCategory])

  // Debounced search effect
  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      fetchHistory()
    }, 500)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery])

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'favorites', name: '⭐ Favorites' },
    { id: 'general', name: '🌐 General' },
    { id: 'cooking', name: '🍳 Cooking' },
    { id: 'pharmacy', name: '💊 Pharmacy' },
    { id: 'electrical', name: '⚡ Electrical' },
    { id: 'household', name: '🏠 Household' },
 
  ]

  // Use the history data directly since filtering is done on the server
  const filteredHistory = history

  const toggleFavorite = async (id) => {
    try {
      await historyAPI.toggleFavorite(id)
      setHistory(history.map(item => 
        item.id === id ? { ...item, favorite: !item.favorite } : item
      ))
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      // You could add a toast notification here
    }
  }

  const formatDate = (date) => {
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      return 'Just now'
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const HistoryItem = ({ item }) => (
    <div 
      className="card hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 mr-4">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-1 rounded-full">
              {categories.find(c => c.id === item.category)?.name || item.category}
            </span>
            <span className="text-xs text-neutral-500">
              {formatDate(item.createdAt)}
            </span>
            <div className="flex items-center space-x-1">
              <span className="text-xs text-neutral-500">Confidence:</span>
              <span className={`text-xs font-medium ${
                item.confidence > 0.8 ? 'text-secondary-600' : 
                item.confidence > 0.6 ? 'text-accent-600' : 'text-red-600'
              }`}>
                {Math.round(item.confidence * 100)}%
              </span>
            </div>
          </div>
          
          <h3 className="font-medium text-neutral-900 mb-2">
            {item.userQuery}
          </h3>
          
          <p className="text-sm text-neutral-600 line-clamp-2">
            {item.assistantSummary}
          </p>
          
          {/* Badges */}
          <div className="flex items-center space-x-2 mt-3">
            {item.suggestProfessional && (
              <span className="text-xs bg-accent-100 text-accent-700 px-2 py-1 rounded-full">
                👷 Professional Recommended
              </span>
            )}
            {item.disclaimer && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                ⚠️ Medical Disclaimer
              </span>
            )}
            {item.steps && (
              <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                📝 {item.steps.length} Steps
              </span>
            )}
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggleFavorite(item.id)
          }}
          className="text-neutral-400 hover:text-accent-500"
        >
          {item.favorite ? (
            <StarIconSolid className="h-5 w-5 text-accent-500" />
          ) : (
            <StarIcon className="h-5 w-5" />
          )}
        </button>
      </div>
      
      {/* Expanded Details */}
      {selectedItem === item.id && item.steps && (
        <div className="mt-4 pt-4 border-t border-neutral-200">
          <h4 className="font-medium text-neutral-900 mb-2">Steps Provided:</h4>
          <ol className="space-y-1">
            {item.steps.map((step, index) => (
              <li key={index} className="text-sm text-neutral-700 flex items-start">
                <span className="inline-flex items-center justify-center w-5 h-5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium mr-2 shrink-0 mt-0.5">
                  {index + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-neutral-200 rounded w-1/3"></div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="card">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-4 flex items-center">
            <ClockIcon className="h-8 w-8 mr-3 text-primary-500" />
            Query History
          </h1>
          <p className="text-lg text-neutral-600">
            Review your past questions and solutions for future reference.
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your questions and answers..."
                className="pl-10 input-field"
              />
            </div>
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="input-field w-full lg:w-auto"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              Unable to Load History
            </h3>
            <p className="text-neutral-600 mb-4">{error}</p>
            <button
              onClick={fetchHistory}
              className="btn-secondary"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {!error && filteredHistory.length === 0 ? (
          <div className="text-center py-12">
            <ChatBubbleLeftIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              {filterCategory === 'favorites' 
                ? 'No favorites yet' 
                : searchQuery || filterCategory !== 'all' 
                  ? 'No matching results' 
                  : 'No history yet'}
            </h3>
            <p className="text-neutral-600">
              {filterCategory === 'favorites'
                ? 'Star your important conversations to find them here'
                : searchQuery || filterCategory !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Start asking questions to build your history'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                {filteredHistory.length} result{filteredHistory.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center space-x-2 text-sm text-neutral-500">
                <StarIconSolid className="h-4 w-4 text-accent-500" />
                <span>{history.filter(item => item.favorite).length} favorites</span>
              </div>
            </div>
            
            {filteredHistory.map((item) => (
              <HistoryItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History