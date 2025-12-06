import { create } from 'zustand'

const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  currentQuery: '',
  
  addMessage: (message) => {
    set(state => ({
      messages: [...state.messages, {
        ...message,
        id: Date.now(),
        timestamp: new Date().toISOString()
      }]
    }))
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  setCurrentQuery: (query) => set({ currentQuery: query }),
  
  clearMessages: () => set({ messages: [] }),
  
  // Add a message pair (user question + AI response)
  addMessagePair: (userMessage, aiResponse) => {
    const timestamp = new Date().toISOString()
    set(state => ({
      messages: [
        ...state.messages,
        {
          id: Date.now(),
          type: 'user',
          content: userMessage,
          timestamp
        },
        {
          id: Date.now() + 1,
          type: 'assistant',
          content: aiResponse.answer_text,
          steps: aiResponse.steps,
          difficulty: aiResponse.difficulty,
          safetyWarnings: aiResponse.safety_warnings,
          suggestProfessional: aiResponse.suggest_professional,
          confidenceScore: aiResponse.confidence_score,
          formatted_response: aiResponse.formatted_response || false,
          suggest_location_search: aiResponse.suggest_location_search,
          location_service_type: aiResponse.location_service_type,
          location_message: aiResponse.location_message,
          showLocationSuggestions: aiResponse.showLocationSuggestions,
          timestamp
        }
      ]
    }))
  }
}))

export { useChatStore }