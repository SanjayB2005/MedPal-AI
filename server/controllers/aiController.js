import { body, validationResult } from 'express-validator'
import GeminiService from '../services/geminiService.js'
import History from '../models/History.js'
import { asyncHandler, APIError } from '../middleware/errorHandler.js'
import { createRequire } from 'module'

// Import CommonJS module pdf-parse
const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

// Function to get Gemini service instance
const getGeminiService = () => {
  return new GeminiService()
}

// Validation rules (query is optional when file is uploaded)
export const validateQuery = [
  body('query')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Query cannot exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['pharmacy', 'cooking', 'electrical', 'household', 'general'])
    .withMessage('Invalid category')
]

// Helper function to extract text from PDF
const extractTextFromPDF = async (buffer) => {
  try {
    const data = await pdfParse(buffer)
    return data.text
  } catch (error) {
    throw new Error('Failed to extract text from PDF')
  }
}

// Helper function to convert image buffer to base64
const imageToBase64 = (buffer) => {
  return buffer.toString('base64')
}

// Helper function to auto-detect category from query
const detectCategory = (query) => {
  const query_lower = query.toLowerCase()
  
  // Cooking keywords
  const cookingKeywords = [
    'cook', 'recipe', 'bake', 'fry', 'boil', 'grill', 'roast', 'steam', 'simmer',
    'ingredients', 'dish', 'meal', 'food', 'kitchen', 'oven', 'stove', 'pan',
    'pot', 'spice', 'flavor', 'taste', 'sauce', 'soup', 'curry', 'pasta', 'rice',
    'chicken', 'meat', 'vegetables', 'dessert', 'cake', 'bread', 'tea', 'coffee',
    'breakfast', 'lunch', 'dinner', 'snack', 'appetizer', 'salad', 'sandwich',
    'pizza', 'burger', 'noodles', 'biriyani', 'biryani', 'chapati', 'roti'
  ]
  
  // Pharmacy/health keywords
  const pharmacyKeywords = [
    'medicine', 'medication', 'drug', 'pill', 'tablet', 'capsule', 'prescription',
    'pharmacy', 'health', 'symptom', 'pain', 'fever', 'headache', 'cold', 'flu',
    'cough', 'allergy', 'vitamin', 'supplement', 'antibiotic', 'painkiller',
    'blood pressure', 'diabetes', 'insulin', 'medical', 'doctor', 'treatment',
    'dose', 'dosage', 'side effect', 'interaction', 'disease', 'illness'
  ]
  
  // Electrical keywords
  const electricalKeywords = [
    'electric', 'electrical', 'electricity', 'power', 'outlet', 'socket', 'plug',
    'wire', 'wiring', 'circuit', 'breaker', 'fuse', 'switch', 'light', 'bulb',
    'lamp', 'voltage', 'current', 'shock', 'sparks', 'short circuit', 'electrician',
    'appliance', 'fan', 'ac', 'air conditioner', 'heater', 'charger', 'battery'
  ]
  
  // Household keywords
  const householdKeywords = [
    'clean', 'cleaning', 'wash', 'laundry', 'stain', 'dirt', 'dust', 'mop',
    'vacuum', 'sweep', 'scrub', 'polish', 'organize', 'storage', 'furniture',
    'paint', 'repair', 'fix', 'maintain', 'plumbing', 'leak', 'drain', 'pipe',
    'faucet', 'toilet', 'sink', 'shower', 'door', 'window', 'lock', 'hinge',
    'wall', 'floor', 'ceiling', 'roof', 'garden', 'yard', 'lawn'
  ]
  
  // Count matches for each category
  const counts = {
    cooking: cookingKeywords.filter(kw => query_lower.includes(kw)).length,
    pharmacy: pharmacyKeywords.filter(kw => query_lower.includes(kw)).length,
    electrical: electricalKeywords.filter(kw => query_lower.includes(kw)).length,
    household: householdKeywords.filter(kw => query_lower.includes(kw)).length
  }
  
  // Find category with highest match count
  const maxCount = Math.max(...Object.values(counts))
  
  // If we have at least 1 match, return that category
  if (maxCount > 0) {
    for (const [category, count] of Object.entries(counts)) {
      if (count === maxCount) {
        return category
      }
    }
  }
  
  // Default to general if no strong match
  return 'general'
}

// Helper function to detect if user needs professional services or shop recommendations
const detectProfessionalServiceNeed = (query, category) => {
  const query_lower = query.toLowerCase()
  const category_lower = (category || '').toLowerCase()
  
  // Define service detection patterns
  const servicePatterns = {
    hospital: [
      'hospital', 'emergency', 'urgent care', 'serious injury', 'chest pain', 
      'heart attack', 'stroke', 'broken bone', 'emergency room', 'ambulance',
      'severe pain', 'bleeding', 'unconscious', 'trauma', 'accident', 'emergency medical'
    ],
    clinic: [
      'doctor', 'see a doctor', 'medical advice', 'prescription', 'checkup',
      'symptoms', 'fever', 'pain', 'illness', 'sick', 'clinic', 'medical center',
      'health issue', 'medical problem', 'consultation', 'examination', 'diagnosis',
      'treatment', 'medical care', 'family doctor', 'general practitioner'
    ],
    pharmacy: [
      'pharmacy', 'medicine', 'prescription', 'medication', 'drug store',
      'pills', 'tablets', 'pharmacy near me', 'medication refill', 'prescription refill',
      'over the counter', 'otc', 'medicine store', 'pharmaceutical', 'drug interaction',
      'medication advice', 'pharmacist', 'prescription pickup'
    ],
    dental: [
      'dentist', 'tooth', 'dental', 'teeth', 'oral', 'gum', 'cavity',
      'tooth pain', 'dental care'
    ],
    electrician: [
      'electrician', 'electrical problem', 'power outage', 'wiring', 'circuit breaker',
      'electrical repair', 'sparks', 'electrical emergency', 'electrical work', 'outlet',
      'switch', 'fuse', 'electrical outlet', 'light switch', 'electrical installation',
      'electrical maintenance', 'socket', 'plug', 'electrical fault'
    ],
    hardware: [
      'hardware store', 'tools', 'screws', 'nails', 'bolts', 'drill', 'hammer',
      'screwdriver', 'hardware shop', 'nuts and bolts', 'fasteners', 'hinges',
      'locks', 'handles', 'brackets', 'construction materials', 'home improvement',
      'diy supplies', 'building materials', 'repair parts', 'fix', 'repair',
      'broken', 'replace', 'install', 'mount', 'assembly', 'maintenance'
    ],
    plumber: [
      'plumber', 'plumbing', 'leak', 'pipe', 'toilet', 'drain', 'water damage',
      'plumbing emergency', 'no hot water', 'plumbing repair'
    ]
  }
  
  // Exclude only cooking-related questions (keep medical suggestions)
  const cookingKeywords = [
    'cook', 'recipe', 'bake', 'kitchen', 'food', 'meal', 'ingredient', 'cuisine',
    'dish', 'cooking', 'baking', 'frying', 'roasting', 'boiling', 'seasoning',
    'flavor', 'taste', 'restaurant', 'eat', 'eating', 'dinner', 'lunch', 'breakfast',
    'spice', 'sauce', 'dessert', 'appetizer'
  ]
  
  const isCookingQuery = cookingKeywords.some(keyword => query_lower.includes(keyword))
  if (isCookingQuery) {
    return null // Don't suggest locations for cooking questions
  }
  
  // Check for service needs
  for (const [serviceType, patterns] of Object.entries(servicePatterns)) {
    if (patterns.some(pattern => query_lower.includes(pattern))) {
      return serviceType
    }
  }
  
  // Category-based detection
  if (category_lower === 'pharmacy') return 'pharmacy'
  if (category_lower === 'electrical') return 'electrician'
  if (category_lower === 'household') return 'hardware'
  
  return null
}

// Helper function to check validation results
const checkValidation = (req) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg)
    throw new APIError(`Validation failed: ${errorMessages.join(', ')}`, 400)
  }
}

// Process AI query
export const processQuery = asyncHandler(async (req, res) => {
  console.log('=== AI Query endpoint hit ===')
  console.log('User:', req.user ? req.user._id : 'No user found')
  console.log('Body:', JSON.stringify(req.body, null, 2))
  console.log('File:', req.file ? `${req.file.originalname} (${req.file.mimetype})` : 'No file')
  
  try {
    checkValidation(req)
  } catch (validationError) {
    console.error('Validation error:', validationError.message)
    throw validationError
  }
  
  const { query, category = 'general' } = req.body
  const userId = req.user ? req.user._id : null
  const file = req.file // File from multer middleware

  // Auto-detect category if it's 'general' and we have a query
  let detectedCategory = category
  if (category === 'general' && query && query.trim()) {
    detectedCategory = detectCategory(query)
    console.log('Auto-detected category:', detectedCategory)
  }

  let enhancedQuery = query || ''
  let fileAnalysisResult = null

  // Handle file upload (image or PDF)
  if (file) {
    console.log('Processing uploaded file:', file.originalname)
    const fileType = file.mimetype

    if (fileType === 'application/pdf') {
      // Extract text from PDF
      console.log('Extracting text from PDF...')
      const extractedText = await extractTextFromPDF(file.buffer)
      fileAnalysisResult = {
        type: 'pdf',
        extractedText: extractedText.substring(0, 10000) // Limit to 10k chars
      }
      
      enhancedQuery = `I have uploaded a medical report/document (PDF). Here is the extracted text:\n\n${fileAnalysisResult.extractedText}\n\nUser's question: ${query || 'Please explain this medical report in simple terms that I can easily understand.'}`
      console.log('PDF text extracted, length:', extractedText.length)
    } else if (fileType.startsWith('image/')) {
      // Prepare image for Gemini Vision API
      console.log('Processing image for Vision API...')
      fileAnalysisResult = {
        type: 'image',
        base64: imageToBase64(file.buffer),
        mimeType: file.mimetype
      }
      
      enhancedQuery = query || 'Please analyze this medical report/test result image and explain it in simple, easy-to-understand terms.'
      console.log('Image prepared for Vision API')
    }
  }

  console.log('Processing query for user:', userId || 'anonymous')
  console.log('Query text:', enhancedQuery.substring(0, 200))
  console.log('Category:', detectedCategory)

  const startTime = Date.now()

  try {
    console.log('Creating Gemini service...')
    const geminiService = getGeminiService()
    console.log('Processing query with Gemini...')
    
    let aiResponse
    
    // Use Vision API for images
    if (fileAnalysisResult && fileAnalysisResult.type === 'image') {
      console.log('Using Gemini Vision API for image analysis...')
      aiResponse = await geminiService.processImageQuery(
        enhancedQuery, 
        fileAnalysisResult.base64, 
        fileAnalysisResult.mimeType
      )
    } else {
      // Use regular text API for text and PDF
      aiResponse = await geminiService.processQuery(enhancedQuery, detectedCategory)
    }
    
    console.log('Gemini response received:', aiResponse ? 'YES' : 'NO')
    
    const responseTime = Date.now() - startTime

    // Check if user needs professional services or shop recommendations
    const neededService = detectProfessionalServiceNeed(query, detectedCategory)
    if (neededService) {
      aiResponse.suggest_location_search = true
      aiResponse.location_service_type = neededService
      
      // Customize message based on service type
      if (neededService === 'hardware') {
        aiResponse.location_message = `Find hardware stores and shops near you for tools, parts, and supplies needed for this project.`
      } else if (neededService === 'electrician') {
        aiResponse.location_message = `For electrical work, I recommend finding certified electricians and electrical supply stores in your area.`
      } else if (neededService === 'pharmacy') {
        aiResponse.location_message = `Find nearby pharmacies for medications, prescriptions, and health-related products.`
      } else if (neededService === 'hospital') {
        aiResponse.location_message = `For emergencies or serious medical issues, find the nearest hospitals and emergency care facilities.`
      } else if (neededService === 'clinic') {
        aiResponse.location_message = `Find nearby clinics and medical centers for consultations, checkups, and general healthcare.`
      } else if (neededService === 'dental') {
        aiResponse.location_message = `Find dental clinics and dentists in your area for dental care and oral health services.`
      } else {
        aiResponse.location_message = `I recommend finding a local ${neededService} for professional assistance with this issue.`
      }
    }

    // Save to history - user is guaranteed to exist due to auth middleware
    const historyEntry = new History({
      userId,
      category: detectedCategory,
      userQuery: query || 'Medical report analysis',
      assistantSummary: aiResponse.answer_text.length > 2000 
        ? aiResponse.answer_text.substring(0, 1997) + '...'
        : aiResponse.answer_text,
      structuredResponse: {
        answer_text: aiResponse.answer_text,
        steps: aiResponse.steps || [],
        difficulty: aiResponse.difficulty || 'medium',
        safety_warnings: aiResponse.safety_warnings || [],
        suggest_professional: aiResponse.suggest_professional || false,
        confidence_score: aiResponse.confidence_score || 0.7,
        key_findings: aiResponse.key_findings || [],
        medical_terms_explained: aiResponse.medical_terms_explained || [],
        recommendations: aiResponse.recommendations || []
      },
      metadata: {
        responseTime,
        modelUsed: 'gemini-1.5-flash',
        hasFile: !!file,
        fileType: file ? file.mimetype : null,
        fileName: file ? file.originalname : null
      }
    })

    // Only save history if user is logged in
    let historyId = null
    if (userId) {
      console.log('Saving history entry for user:', userId)
      await historyEntry.save()
      console.log('History entry saved successfully:', historyEntry._id)
      historyId = historyEntry._id
    } else {
      console.log('Skipping history save - no user logged in')
    }
    
    // Return structured response
    res.json({
      message: 'Query processed successfully',
      ...aiResponse,
      historyId,
      responseTime
    })

  } catch (error) {
    console.error('AI query processing error:', error)
    
    // If it's a Gemini-specific error, pass it through
    if (error.message.includes('AI service') || error.message.includes('quota') || error.message.includes('429')) {
      throw error
    }
    
    // Generic fallback for other errors
    throw new APIError('Unable to process your query right now. Please try again.', 503)
  }
})

// Get query suggestions based on category
export const getSuggestions = asyncHandler(async (req, res) => {
  const { category } = req.params

  const suggestions = {
    pharmacy: [
      "Can I take ibuprofen with my blood pressure medication?",
      "How should I store my medications properly?",
      "What are common drug interactions to avoid?",
      "When should I see a doctor vs. a pharmacist?"
    ],
    cooking: [
      "My cake sank in the center, what went wrong?",
      "How do I fix oversalted soup?",
      "Best way to sharpen kitchen knives?",
      "How to prevent pasta from sticking?"
    ],
    electrical: [
      "My outlet stopped working, what should I check?",
      "How do I safely replace a light switch?",
      "Why does my circuit breaker keep tripping?",
      "When should I call an electrician?"
    ],
    household: [
      "How do I unclog a slow drain?",
      "Best way to remove carpet stains?",
      "How to organize a small space?",
      "DIY furniture repair techniques?"
    ],
    general: [
      "How do I know when to call a professional?",
      "What basic tools should every homeowner have?",
      "How to prioritize home maintenance tasks?",
      "Safety tips for DIY home repairs?"
    ]
  }

  const categorySuggestions = suggestions[category] || suggestions.general

  res.json({
    message: 'Suggestions retrieved successfully',
    category,
    suggestions: categorySuggestions
  })
})

// Get popular queries by category
export const getPopularQueries = asyncHandler(async (req, res) => {
  const { category } = req.query

  let matchStage = {}
  if (category && category !== 'all') {
    matchStage.category = category
  }

  // Get most frequent queries from last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  matchStage.createdAt = { $gte: thirtyDaysAgo }

  const popularQueries = await History.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: {
          query: { $substr: ['$userQuery', 0, 100] }, // First 100 chars
          category: '$category'
        },
        count: { $sum: 1 },
        avgConfidence: { $avg: '$structuredResponse.confidence_score' },
        lastAsked: { $max: '$createdAt' }
      }
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
    {
      $project: {
        query: '$_id.query',
        category: '$_id.category',
        count: 1,
        avgConfidence: { $round: ['$avgConfidence', 2] },
        lastAsked: 1,
        _id: 0
      }
    }
  ])

  res.json({
    message: 'Popular queries retrieved successfully',
    queries: popularQueries
  })
})

// Health check for AI service
export const healthCheck = asyncHandler(async (req, res) => {
  try {
    // Test a simple query to verify AI service is working
    const geminiService = getGeminiService()
    const testResponse = await geminiService.processQuery(
      'Test connectivity', 
      'general'
    )

    res.json({
      message: 'AI service is healthy',
      status: 'operational',
      timestamp: new Date().toISOString(),
      testSuccess: !!testResponse
    })
  } catch (error) {
    res.status(503).json({
      message: 'AI service health check failed',
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error.message
    })
  }
})