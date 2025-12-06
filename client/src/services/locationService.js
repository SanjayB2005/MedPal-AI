// OpenStreetMap + Overpass API Service for finding professional services
class LocationService {
  constructor() {
    this.overpassUrl = 'https://overpass-api.de/api/interpreter'
    this.nominatimUrl = 'https://nominatim.openstreetmap.org/search'
    this.cache = new Map()
    this.lastRequestTime = 0
    this.minRequestInterval = 1000 // 1 second between requests
    this.maxRetries = 2
  }

  // Cache key generator
  generateCacheKey(lat, lon, serviceType, radiusKm) {
    return `${serviceType}_${lat.toFixed(3)}_${lon.toFixed(3)}_${radiusKm}`
  }

  // Rate limiting helper
  async waitForRateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    this.lastRequestTime = Date.now()
  }

  // Retry helper with exponential backoff
  async retryWithBackoff(fn, maxRetries = this.maxRetries) {
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries) throw error
        
        // If rate limited, wait longer
        if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
          const waitTime = Math.min(1000 * Math.pow(2, i), 10000) // Max 10 seconds
          await new Promise(resolve => setTimeout(resolve, waitTime))
        } else {
          throw error // Don't retry non-rate-limit errors
        }
      }
    }
  }

  // Get user's current location
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy
          })
        },
        (error) => {
          reject(new Error(`Location access denied: ${error.message}`))
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      )
    })
  }

  // Convert address to coordinates using Nominatim
  async geocodeAddress(address) {
    try {
      const response = await fetch(
        `${this.nominatimUrl}?format=json&q=${encodeURIComponent(address)}&limit=1`
      )
      const data = await response.json()
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          display_name: data[0].display_name
        }
      }
      throw new Error('Address not found')
    } catch (error) {
      throw new Error(`Geocoding failed: ${error.message}`)
    }
  }

  // Build Overpass query for different service types
  buildOverpassQuery(lat, lon, serviceType, radiusKm = 10) {
    const radiusMeters = radiusKm * 1000
    
    const serviceQueries = {
      hospital: `
        [out:json][timeout:25];
        (
          node["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
          way["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
          relation["amenity"="hospital"](around:${radiusMeters},${lat},${lon});
        );
        out center meta;
      `,
      clinic: `
        [out:json][timeout:25];
        (
          node["amenity"~"^(clinic|doctors)$"](around:${radiusMeters},${lat},${lon});
          way["amenity"~"^(clinic|doctors)$"](around:${radiusMeters},${lat},${lon});
          relation["amenity"~"^(clinic|doctors)$"](around:${radiusMeters},${lat},${lon});
        );
        out center meta;
      `,
      pharmacy: `
        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
          way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
          relation["amenity"="pharmacy"](around:${radiusMeters},${lat},${lon});
        );
        out center meta;
      `,
      electrician: `
        [out:json][timeout:25];
        (
          node["craft"="electrician"](around:${radiusMeters},${lat},${lon});
          way["craft"="electrician"](around:${radiusMeters},${lat},${lon});
          relation["craft"="electrician"](around:${radiusMeters},${lat},${lon});
          node["shop"="electrical"](around:${radiusMeters},${lat},${lon});
          way["shop"="electrical"](around:${radiusMeters},${lat},${lon});
        );
        out center meta;
      `,
      plumber: `
        [out:json][timeout:25];
        (
          node["craft"="plumber"](around:${radiusMeters},${lat},${lon});
          way["craft"="plumber"](around:${radiusMeters},${lat},${lon});
          relation["craft"="plumber"](around:${radiusMeters},${lat},${lon});
          node["shop"="plumbing"](around:${radiusMeters},${lat},${lon});
          way["shop"="plumbing"](around:${radiusMeters},${lat},${lon});
        );
        out center meta;
      `,
      mechanic: `
        [out:json][timeout:25];
        (
          node["shop"="car_repair"](around:${radiusMeters},${lat},${lon});
          way["shop"="car_repair"](around:${radiusMeters},${lat},${lon});
          node["amenity"="car_repair"](around:${radiusMeters},${lat},${lon});
          way["amenity"="car_repair"](around:${radiusMeters},${lat},${lon});
        );
        out center meta;
      `,
      dental: `
        [out:json][timeout:25];
        (
          node["amenity"="dentist"](around:${radiusMeters},${lat},${lon});
          way["amenity"="dentist"](around:${radiusMeters},${lat},${lon});
          relation["amenity"="dentist"](around:${radiusMeters},${lat},${lon});
        );
        out center meta;
      `,
      hardware: `
        [out:json][timeout:25];
        (
          node["shop"="hardware"](around:${radiusMeters},${lat},${lon});
          way["shop"="hardware"](around:${radiusMeters},${lat},${lon});
          node["shop"="doityourself"](around:${radiusMeters},${lat},${lon});
          way["shop"="doityourself"](around:${radiusMeters},${lat},${lon});
          node["shop"="trade"](around:${radiusMeters},${lat},${lon});
          way["shop"="trade"](around:${radiusMeters},${lat},${lon});
          node["shop"="building_supplies"](around:${radiusMeters},${lat},${lon});
          way["shop"="building_supplies"](around:${radiusMeters},${lat},${lon});
          node["shop"="electrical"](around:${radiusMeters},${lat},${lon});
          way["shop"="electrical"](around:${radiusMeters},${lat},${lon});
          node["name"~"home depot|lowes|menards|ace hardware"]["shop"](around:${radiusMeters},${lat},${lon});
          way["name"~"home depot|lowes|menards|ace hardware"]["shop"](around:${radiusMeters},${lat},${lon});
        );
        out center meta;
      `
    }

    return serviceQueries[serviceType] || serviceQueries.hardware
  }

  // Search for professional services
  async findProfessionalServices(lat, lon, serviceType, radiusKm = 10) {
    const cacheKey = this.generateCacheKey(lat, lon, serviceType, radiusKm)
    
    // Check cache first (valid for 10 minutes)
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey)
      if (Date.now() - cached.timestamp < 10 * 60 * 1000) {
        return cached.data
      } else {
        this.cache.delete(cacheKey)
      }
    }

    try {
      // Use retry logic for the API call
      const results = await this.retryWithBackoff(async () => {
        await this.waitForRateLimit()
        
        const query = this.buildOverpassQuery(lat, lon, serviceType, radiusKm)
        
        const response = await fetch(this.overpassUrl, {
          method: 'POST',
          body: query,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'HomeAssistantBot/1.0'
          },
          signal: AbortSignal.timeout(15000) // 15 second timeout
        })

        if (!response.ok) {
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Please wait a moment and try again.')
          }
          if (response.status === 504) {
            throw new Error('Service timeout. The location service is temporarily overloaded.')
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        return this.processOverpassResults(data.elements, lat, lon)
      })

      // Cache the results
      this.cache.set(cacheKey, {
        data: results,
        timestamp: Date.now()
      })

      return results
    } catch (error) {
      // Provide fallback suggestions for various error types
      if (error.message.includes('Rate limit') || 
          error.message.includes('429') ||
          error.message.includes('timeout') ||
          error.message.includes('504') ||
          error.name === 'TimeoutError' ||
          error.name === 'AbortError') {
        return this.getFallbackSuggestions(serviceType)
      }
      throw new Error(`Service search failed: ${error.message}`)
    }
  }

  // Process and format Overpass API results
  processOverpassResults(elements, userLat, userLon) {
    return elements.map(element => {
      const lat = element.lat || element.center?.lat
      const lon = element.lon || element.center?.lon
      const tags = element.tags || {}

      // Calculate distance
      const distance = this.calculateDistance(userLat, userLon, lat, lon)

      return {
        id: element.id,
        name: tags.name || tags.operator || 'Unknown Name',
        type: tags.amenity || tags.craft || tags.shop || 'service',
        address: this.formatAddress(tags),
        phone: tags.phone || tags['contact:phone'] || null,
        website: tags.website || tags['contact:website'] || null,
        email: tags.email || tags['contact:email'] || null,
        openingHours: tags.opening_hours || null,
        wheelchair: tags.wheelchair === 'yes',
        lat: lat,
        lon: lon,
        distance: distance,
        googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`,
        osmUrl: `https://www.openstreetmap.org/${element.type}/${element.id}`,
        directionsUrl: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`
      }
    }).sort((a, b) => a.distance - b.distance) // Sort by distance
  }

  // Format address from OSM tags
  formatAddress(tags) {
    const addressParts = []
    
    if (tags['addr:housenumber']) addressParts.push(tags['addr:housenumber'])
    if (tags['addr:street']) addressParts.push(tags['addr:street'])
    if (tags['addr:city']) addressParts.push(tags['addr:city'])
    if (tags['addr:postcode']) addressParts.push(tags['addr:postcode'])
    
    return addressParts.join(', ') || 'Address not available'
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371 // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1)
    const dLon = this.toRadians(lon2 - lon1)
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
              Math.sin(dLon/2) * Math.sin(dLon/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return Math.round(R * c * 100) / 100 // Round to 2 decimal places
  }

  toRadians(degrees) {
    return degrees * (Math.PI / 180)
  }

  // Get service type emoji and display name
  getServiceInfo(serviceType) {
    const serviceInfo = {
      hospital: { emoji: '🏥', name: 'Hospitals', description: 'Emergency and medical care' },
      clinic: { emoji: '🩺', name: 'Clinics & Doctors', description: 'General healthcare services' },
      pharmacy: { emoji: '💊', name: 'Pharmacies', description: 'Medications and health products' },
      dental: { emoji: '🦷', name: 'Dental Clinics', description: 'Dental care services' },
      electrician: { emoji: '⚡', name: 'Electricians', description: 'Electrical repair services' },
      plumber: { emoji: '🔧', name: 'Plumbers', description: 'Plumbing repair services' },
      mechanic: { emoji: '🔧', name: 'Auto Repair', description: 'Vehicle repair services' },
      hardware: { emoji: '🛠️', name: 'Hardware Stores', description: 'Tools, supplies, and DIY materials' }
    }
    
    return serviceInfo[serviceType] || { emoji: '🏢', name: 'Services', description: 'Professional services' }
  }

  // Fallback suggestions when API is rate limited
  getFallbackSuggestions(serviceType) {
    const serviceInfo = this.getServiceInfo(serviceType)
    
    return [
      {
        id: 'fallback-google',
        name: `Find ${serviceInfo.name} on Google Maps`,
        type: 'search',
        address: 'Search Google Maps for nearby locations',
        phone: null,
        website: null,
        email: null,
        openingHours: 'Search for current hours',
        wheelchair: false,
        lat: 0,
        lon: 0,
        distance: 0,
        googleMapsUrl: `https://www.google.com/maps/search/${encodeURIComponent(serviceInfo.name + ' near me')}`,
        osmUrl: '#',
        directionsUrl: `https://www.google.com/maps/search/${encodeURIComponent(serviceInfo.name + ' near me')}`
      },
      {
        id: 'fallback-yelp',
        name: `Browse ${serviceInfo.name} on Yelp`,
        type: 'search',
        address: 'View reviews and contact information',
        phone: null,
        website: 'https://www.yelp.com',
        email: null,
        openingHours: 'Check individual listings',
        wheelchair: false,
        lat: 0,
        lon: 0,
        distance: 0,
        googleMapsUrl: `https://www.yelp.com/search?find_desc=${encodeURIComponent(serviceInfo.name)}&find_loc=near%20me`,
        osmUrl: '#',
        directionsUrl: `https://www.yelp.com/search?find_desc=${encodeURIComponent(serviceInfo.name)}&find_loc=near%20me`
      }
    ]
  }
}

export default new LocationService()