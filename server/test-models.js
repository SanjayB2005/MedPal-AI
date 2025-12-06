import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config()

async function testModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    
    // Try to list models
    console.log('Attempting to list available models...')
    
    try {
      // This should work according to the docs
      const models = await genAI.listModels()
      console.log('Available models:')
      models.forEach(model => {
        console.log('- ', model.name, '(', model.supportedGenerationMethods?.join(', '), ')')
      })
    } catch (error) {
      console.log('Could not list models:', error.message)
    }
    
    // Try some basic model names
    const testModels = [
      'models/gemini-1.5-flash',
      'models/gemini-1.5-pro', 
      'models/gemini-pro',
      'gemini-1.5-flash',
      'gemini-1.5-pro',
      'gemini-pro',
      'gemini-1.5-flash-001',
      'gemini-1.5-pro-001'
    ]
    
    for (const modelName of testModels) {
      try {
        console.log(`Testing model: ${modelName}`)
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent('Hello')
        console.log(`✅ ${modelName} works! Response:`, result.response.text())
        break // Stop on first working model
      } catch (error) {
        console.log(`❌ ${modelName} failed:`, error.message)
      }
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

testModels()