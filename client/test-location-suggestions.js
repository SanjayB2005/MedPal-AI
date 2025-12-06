// Test script to verify location suggestion functionality
import LocationService from '../src/services/locationService.js'

async function testLocationSuggestions() {
  console.log('Testing Location Suggestion Functionality...\n')

  try {
    // Test coordinates (example: San Francisco, CA)
    const testLat = 37.7749
    const testLon = -122.4194

    console.log('1. Testing Hardware Store Search...')
    const hardwareStores = await LocationService.findProfessionalServices(
      testLat, 
      testLon, 
      'hardware', 
      10
    )
    console.log(`Found ${hardwareStores.length} hardware stores`)
    if (hardwareStores.length > 0) {
      console.log('First result:', hardwareStores[0].name)
    }

    console.log('\n2. Testing Electrician Search...')
    const electricians = await LocationService.findProfessionalServices(
      testLat, 
      testLon, 
      'electrician', 
      10
    )
    console.log(`Found ${electricians.length} electricians`)
    if (electricians.length > 0) {
      console.log('First result:', electricians[0].name)
    }

    console.log('\n3. Testing Service Info...')
    const hardwareInfo = LocationService.getServiceInfo('hardware')
    console.log('Hardware Info:', hardwareInfo)

    const electricianInfo = LocationService.getServiceInfo('electrician')
    console.log('Electrician Info:', electricianInfo)

    console.log('\n✅ All tests completed successfully!')

  } catch (error) {
    console.error('❌ Test failed:', error.message)
  }
}

// Only run if this file is executed directly (not imported)
if (typeof window === 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  testLocationSuggestions()
}

export { testLocationSuggestions }