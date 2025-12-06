import { useState, useEffect } from 'react'
import { MapPinIcon, PhoneIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import LocationService from '../services/locationService'

const LocationSuggestions = ({ serviceType, userLocation }) => {
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [locationPermission, setLocationPermission] = useState('pending')
  const [hasSearched, setHasSearched] = useState(false)

  // Remove automatic useEffect - make it user-triggered instead

  const handleSearchNearby = () => {
    setHasSearched(true)
    fetchSuggestions()
  }

  const handleQuickSearch = () => {
    const serviceInfo = getServiceInfo()
    const googleUrl = `https://www.google.com/maps/search/${encodeURIComponent(serviceInfo.name + ' near me')}`
    window.open(googleUrl, '_blank', 'noopener,noreferrer')
  }

  const fetchSuggestions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let coordinates = userLocation

      if (!coordinates) {
        try {
          coordinates = await LocationService.getCurrentLocation()
          setLocationPermission('granted')
        } catch (locationError) {
          setLocationPermission('denied')
          // Try to use a default location or let user enter manually
          throw new Error('Please enable location access to find nearby services')
        }
      }

      const results = await LocationService.findProfessionalServices(
        coordinates.lat,
        coordinates.lon,
        serviceType,
        15 // 15km radius
      )

      // Limit to 3-5 suggestions as requested
      const limitedResults = results.slice(0, 5)
      setSuggestions(limitedResults)

    } catch (err) {
      console.error('Error fetching location suggestions:', err)
      
      // Provide specific error messages
      if (err.message.includes('Rate limit') || err.message.includes('429')) {
        setError('Service temporarily busy. Please wait a moment and try again, or use the search links below.')
      } else if (err.message.includes('timeout') || err.message.includes('504') || err.name === 'TimeoutError') {
        setError('Location service is taking too long to respond. Please try the search options below.')
      } else if (err.message.includes('location access')) {
        setError('Please enable location access to find nearby services, or use the search links below.')
      } else {
        setError('Unable to load nearby locations right now. You can use the search links below.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getServiceInfo = () => {
    return LocationService.getServiceInfo(serviceType)
  }

  if (!serviceType) return null

  return (
    <div className="mt-3 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
      <div className="flex items-center mb-3">
        <MapPinIcon className="h-5 w-5 text-blue-600 mr-2" />
        <h4 className="font-semibold text-blue-900">
          {getServiceInfo().emoji} Find Nearby {getServiceInfo().name}
        </h4>
      </div>

      {!hasSearched && !isLoading && (
        <div className="text-center">
          <p className="text-sm text-blue-700 mb-3">
            Find {getServiceInfo().name.toLowerCase()} in your area:
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={handleSearchNearby}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center space-x-1"
            >
              <MapPinIcon className="h-4 w-4" />
              <span>Find Nearby</span>
            </button>
            <button
              onClick={handleQuickSearch}
              className="border border-blue-600 text-blue-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors flex items-center space-x-1"
            >
              <ArrowTopRightOnSquareIcon className="h-4 w-4" />
              <span>Open Maps</span>
            </button>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center space-x-2 text-blue-700">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
          <span className="text-sm">Finding nearby locations...</span>
        </div>
      )}

      {error && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="font-medium flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Location services temporarily unavailable
          </p>
          <p className="text-xs mt-1">{error}</p>
          <div className="mt-3">
            <a
              href={`https://www.google.com/maps/search/${encodeURIComponent(getServiceInfo().name + ' near me')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 bg-amber-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-amber-700 transition-colors"
            >
              <ArrowTopRightOnSquareIcon className="h-3 w-3" />
              Search on Google Maps
            </a>
          </div>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="space-y-3">
          {suggestions.map((place) => (
            <div 
              key={place.id} 
              className="bg-white rounded-lg border border-blue-100 p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h5 className="font-medium text-gray-900 text-sm leading-tight">
                    {place.name}
                  </h5>
                  <p className="text-xs text-gray-600 mt-1">
                    {place.address}
                  </p>
                </div>
                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
                  {place.distance}km away
                </span>
              </div>

              {/* Additional Info */}
              <div className="flex flex-wrap gap-2 mb-2">
                {place.phone && (
                  <div className="flex items-center text-xs text-gray-600">
                    <PhoneIcon className="h-3 w-3 mr-1" />
                    <span>{place.phone}</span>
                  </div>
                )}
                {place.openingHours && (
                  <div className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded">
                    {place.openingHours.length > 20 
                      ? place.openingHours.substring(0, 20) + '...' 
                      : place.openingHours
                    }
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <a
                  href={place.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-blue-600 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Directions
                </a>
                <a
                  href={place.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 border border-gray-300 text-gray-700 text-xs px-3 py-1.5 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  View
                </a>
              </div>
            </div>
          ))}

          {suggestions.length === 5 && (
            <div className="text-center">
              <p className="text-xs text-blue-600">
                Showing top 5 closest locations • More results available in your area
              </p>
            </div>
          )}
        </div>
      )}

      {suggestions.length === 0 && !isLoading && !error && hasSearched && (
        <div className="text-sm text-gray-600 bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
          <p>No {getServiceInfo().name.toLowerCase()} found within 15km of your location</p>
          <p className="text-xs mt-1">Try expanding your search area or check a different location</p>
        </div>
      )}
    </div>
  )
}

export default LocationSuggestions