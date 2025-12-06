import { GoogleGenerativeAI } from '@google/generative-ai'
import { promptTemplates } from './promptTemplates.js'
import { knowledgeBase } from './knowledgeBase.js'

class GeminiService {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is required')
    }
    
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Initialize with a model that should work
    // Note: We'll handle the actual model setup in processQuery
    this.modelName = 'gemini-pro'

    // Safety settings
    this.safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ]
  }

  /**
   * Process user query and return structured response
   */
  async processQuery(userQuery, category = 'general') {
    try {
      // Retrieve relevant knowledge from knowledge base
      const relevantKnowledge = this.retrieveKnowledge(userQuery, category)
      
      // Construct prompt using template
      const prompt = this.constructPrompt(userQuery, category, relevantKnowledge)
      
      // Generate response with retry logic
      const response = await this.generateWithRetry(prompt)
      
      // Parse and validate response
      const structuredResponse = this.parseResponse(response)
      
      // Add metadata
      structuredResponse.category = category
      structuredResponse.timestamp = new Date().toISOString()
      
      return structuredResponse
      
    } catch (error) {
      console.error('Error processing query:', error)
      throw this.handleGeminiError(error)
    }
  }

  /**
   * Retrieve relevant knowledge snippets using simple keyword matching
   */
  retrieveKnowledge(query, category) {
    const queryLower = query.toLowerCase()
    const categoryKnowledge = knowledgeBase[category] || knowledgeBase.general
    
    // Simple keyword matching - could be enhanced with vector search
    const relevantSnippets = categoryKnowledge.filter(snippet => {
      const keywords = snippet.keywords || []
      return keywords.some(keyword => queryLower.includes(keyword.toLowerCase()))
    })

    return relevantSnippets.slice(0, 3) // Limit to top 3 relevant snippets
  }

  /**
   * Construct prompt using template and context
   */
  constructPrompt(userQuery, category, knowledge) {
    const template = promptTemplates[category] || promptTemplates.general
    
    let knowledgeContext = ''
    if (knowledge.length > 0) {
      knowledgeContext = 'Relevant information:\\n' + 
        knowledge.map(k => `- ${k.content}`).join('\\n') + '\\n\\n'
    }

    const prompt = template
      .replace('{knowledge_context}', knowledgeContext)
      .replace('{user_query}', userQuery)

    return prompt
  }

  /**
   * Generate response with exponential backoff retry
   */
  async generateWithRetry(prompt, maxRetries = 3) {
    // Use the current available model names from Google AI (December 2025)
    const modelNames = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-2.0-flash-001',
      'gemini-2.5-pro',
      'gemini-2.0-flash-lite'
    ];
    
    for (const modelName of modelNames) {
      console.log(`Trying model: ${modelName}`)
      
      try {
        const model = this.genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: this.generationConfig,
          safetySettings: this.safetySettings,
        })
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const result = await model.generateContent({
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
            })

            if (!result.response) {
              throw new Error('No response received from Gemini')
            }

            console.log(`✅ Successfully used model: ${modelName}`)
            return result.response.text()
            
          } catch (error) {
            if (error.message?.includes('429') && attempt < maxRetries) {
              // Exponential backoff for rate limiting
              const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000
              console.log(`Rate limited, retrying in ${delay}ms...`)
              await new Promise(resolve => setTimeout(resolve, delay))
              continue
            }
            if (attempt === maxRetries) {
              throw error
            }
          }
        }
      } catch (error) {
        console.log(`❌ Model ${modelName} not available: ${error.message}`)
        continue
      }
    }
    
    throw new Error('No working Gemini model found')
  }

  /**
   * Parse response - now handles natural language format
   */
  parseResponse(responseText) {
    try {
      // Check if it's still JSON format (for backward compatibility)
      const jsonMatch = responseText.match(/```json\\n([\\s\\S]*?)\\n```/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1])
      }

      if (responseText.trim().startsWith('{')) {
        return JSON.parse(responseText)
      }

      // Handle new natural language format
      return this.parseNaturalResponse(responseText)
      
    } catch (error) {
      console.warn('Failed to parse response, using natural language format:', error.message)
      return this.parseNaturalResponse(responseText)
    }
  }

  /**
   * Parse natural language response into structured format
   */
  parseNaturalResponse(text) {
    // For natural language responses, we'll return the full text
    // and let the frontend handle markdown rendering
    
    // Extract some basic metadata for compatibility
    const suggestProfessional = text.toLowerCase().includes('professional') ||
                               text.toLowerCase().includes('electrician') ||
                               text.toLowerCase().includes('doctor') ||
                               text.toLowerCase().includes('expert') ||
                               text.toLowerCase().includes('licensed') ||
                               text.toLowerCase().includes('certified')

    // Check for safety content
    const hasSafetyWarnings = text.toLowerCase().includes('warning') ||
                             text.toLowerCase().includes('danger') ||
                             text.toLowerCase().includes('safety') ||
                             text.toLowerCase().includes('caution')

    // Estimate difficulty based on content complexity
    let difficulty = 'easy'
    if (text.toLowerCase().includes('complex') || 
        text.toLowerCase().includes('difficult') ||
        text.toLowerCase().includes('advanced') ||
        suggestProfessional) {
      difficulty = 'hard'
    } else if (text.toLowerCase().includes('moderate') || 
               text.length > 800) {
      difficulty = 'medium'
    }

    return {
      answer_text: text,
      steps: [], // Steps are now embedded in the natural text
      difficulty: difficulty,
      safety_warnings: [], // Warnings are now embedded in the natural text
      suggest_professional: suggestProfessional,
      confidence_score: 0.85, // Default confidence
      formatted_response: true // Flag to indicate this is formatted markdown
    }
  }

  /**
   * Create fallback response structure
   */
  createFallbackResponse(text) {
    // Extract steps if they exist
    const steps = []
    const stepMatches = text.match(/\\d+\\..+/g)
    if (stepMatches) {
      steps.push(...stepMatches.map(step => step.replace(/^\\d+\\.\\s*/, '')))
    }

    // Extract safety warnings
    const safetyWarnings = []
    if (text.toLowerCase().includes('warning') || text.toLowerCase().includes('danger') || text.toLowerCase().includes('safety')) {
      safetyWarnings.push('Please exercise caution when following these instructions.')
    }

    // Determine if professional help is suggested
    const suggestProfessional = text.toLowerCase().includes('professional') ||
                               text.toLowerCase().includes('electrician') ||
                               text.toLowerCase().includes('doctor') ||
                               text.toLowerCase().includes('expert')

    // Estimate difficulty
    let difficulty = 'easy'
    if (text.toLowerCase().includes('complex') || text.toLowerCase().includes('difficult')) {
      difficulty = 'hard'
    } else if (text.toLowerCase().includes('moderate') || steps.length > 5) {
      difficulty = 'medium'
    }

    return {
      answer_text: text,
      steps: steps,
      difficulty: difficulty,
      safety_warnings: safetyWarnings,
      suggest_professional: suggestProfessional,
      confidence_score: 0.7 // Default confidence for fallback
    }
  }

  /**
   * Handle Gemini-specific errors
   */
  handleGeminiError(error) {
    if (error.message?.includes('429')) {
      return new Error('AI service is temporarily busy. Please try again in a moment.')
    }
    
    if (error.message?.includes('quota')) {
      return new Error('AI service quota exceeded. Please try again later.')
    }
    
    if (error.message?.includes('safety')) {
      return new Error('Query was blocked for safety reasons. Please rephrase your question.')
    }

    return new Error('AI service temporarily unavailable. Please try again.')
  }
}

export { GeminiService }
export default GeminiService