import { useState } from 'react'
import { 
  MapPinIcon, 
  MagnifyingGlassIcon,
  PhoneIcon,
  GlobeAltIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import locationService from '../services/locationService'

const LocationSearch = ({ serviceType, onClose }) => {
  const [location, setLocation] = useState('')
  const [useCurrentLocation, setUseCurrentLocation] = useState(false)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchRadius, setSearchRadius] = useState(10)

  const serviceInfo = locationService.getServiceInfo(serviceType)

  const handleSearch = async () => {
    if (!serviceType) return
    
    setLoading(true)
    setError('')
    setResults([])

    try {
      let coordinates

      if (useCurrentLocation) {
        coordinates = await locationService.getCurrentLocation()
      } else if (location.trim()) {
        coordinates = await locationService.geocodeAddress(location.trim())
      } else {
        setError('Please enter a location or use current location')
        setLoading(false)
        return
      }

      const services = await locationService.findProfessionalServices(
        coordinates.lat, 
        coordinates.lon, 
        serviceType, 
        searchRadius
      )

      setResults(services)
      
      if (services.length === 0) {
        setError(`No ${serviceInfo.name.toLowerCase()} found within ${searchRadius}km. Try increasing the search radius.`)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const ServiceResult = ({ service }) => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-900 text-lg">{service.name}</h3>
        <span className="text-sm text-blue-600 font-medium">{service.distance} km</span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex items-start">
          <MapPinIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
          <span>{service.address}</span>
        </div>
        
        {service.phone && (
          <div className="flex items-center">
            <PhoneIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <a href={`tel:${service.phone}`} className="text-blue-600 hover:text-blue-800">
              {service.phone}
            </a>
          </div>
        )}
        
        {service.website && (
          <div className="flex items-center">
            <GlobeAltIcon className="h-4 w-4 mr-2 flex-shrink-0" />
            <a 
              href={service.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 truncate"
            >
              Visit Website
            </a>
          </div>
        )}
        
        {service.openingHours && (
          <div className="flex items-start">
            <ClockIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
            <span className="text-xs">{service.openingHours}</span>
          </div>
        )}
      </div>
      
      <div className="flex gap-2 mt-4">
        <a
          href={service.directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors text-center"
        >
          Get Directions
        </a>
        <a
          href={service.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          View on Maps
        </a>
      </div>
    </div>
  )

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{serviceInfo.emoji}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Find {serviceInfo.name}</h2>
              <p className="text-sm text-gray-600">{serviceInfo.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2"
          >
            ✕
          </button>
        </div>

        {/* Search Form */}
        <div className="p-6 border-b border-gray-200 space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="currentLocation"
                checked={useCurrentLocation}
                onChange={(e) => setUseCurrentLocation(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="currentLocation" className="text-sm font-medium text-gray-700">
                Use my current location
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Radius:</label>
              <select 
                value={searchRadius} 
                onChange={(e) => setSearchRadius(parseInt(e.target.value))}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>
          </div>
          
          {!useCurrentLocation && (
            <div className="flex space-x-2">
              <div className="flex-1 relative">
                <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter city, address, or postal code..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          <button
            onClick={handleSearch}
            disabled={loading || (!useCurrentLocation && !location.trim())}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>Find {serviceInfo.name}</span>
              </>
            )}
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start space-x-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-medium text-red-800">Search Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Found {results.length} {serviceInfo.name.toLowerCase()} nearby
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {results.map((service, index) => (
                  <ServiceResult key={service.id || index} service={service} />
                ))}
              </div>
            </div>
          )}

          {!loading && !error && results.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <MapPinIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Enter a location to find {serviceInfo.name.toLowerCase()} near you</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LocationSearch