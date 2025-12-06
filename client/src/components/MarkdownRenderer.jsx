import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PhoneIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'
import LocationSuggestions from './LocationSuggestions'

const MarkdownRenderer = ({ 
  content, 
  difficulty, 
  suggestProfessional, 
  confidenceScore,
  suggestLocationSearch,
  locationServiceType,
  locationMessage,
  userLocation
}) => {
  const DifficultyBadge = ({ difficulty }) => {
    const colors = {
      easy: 'bg-green-100 text-green-700 border-green-200',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      hard: 'bg-red-100 text-red-700 border-red-200'
    }
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${colors[difficulty]}`}>
        {difficulty} difficulty
      </span>
    )
  }

  // Simple markdown components
  const markdownComponents = {
    h1: ({ children }) => <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4 first:mt-0">{children}</h1>,
    h2: ({ children }) => <h2 className="text-xl font-bold text-gray-900 mt-6 mb-3 first:mt-0 border-b border-gray-200 pb-2">{children}</h2>,
    h3: ({ children }) => <h3 className="text-lg font-bold text-gray-900 mt-6 mb-3 first:mt-0">{children}</h3>,
    h4: ({ children }) => <h4 className="text-base font-bold text-gray-900 mt-4 mb-2 first:mt-0">{children}</h4>,
    p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
    strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
    em: ({ children }) => <em className="italic text-gray-600">{children}</em>,
    code: ({ children }) => <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600">{children}</code>,
    ol: ({ children }) => <ol className="my-4 space-y-2 ml-6 list-decimal">{children}</ol>,
    ul: ({ children }) => <ul className="my-4 space-y-2 ml-6 list-disc">{children}</ul>,
    li: ({ children }) => <li className="text-gray-700 leading-relaxed">{children}</li>,
    blockquote: ({ children }) => {
      const content = String(children).toLowerCase()
      const isWarning = content.includes('warning') || content.includes('danger') || content.includes('⚠️')
      const isMedical = content.includes('medical') || content.includes('disclaimer')
      
      return (
        <div className={`p-4 rounded-xl border-l-4 my-4 ${
          isWarning 
            ? 'bg-red-50 border-red-500 text-red-800'
            : isMedical
            ? 'bg-blue-50 border-blue-500 text-blue-800'
            : 'bg-yellow-50 border-yellow-500 text-yellow-800'
        }`}>
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
              isWarning ? 'text-red-600' : isMedical ? 'text-blue-600' : 'text-yellow-600'
            }`} />
            <div className="text-sm leading-relaxed">
              {children}
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="max-w-full w-full">
      {/* Main Response */}
      <div className="message-bubble message-assistant">
        <div className="prose prose-gray max-w-full">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Professional Recommendation */}
      {suggestProfessional && (
        <div className="mt-3 bg-accent-50 border border-accent-200 rounded-xl p-4">
          <h4 className="font-medium text-accent-900 mb-2 flex items-center">
            <PhoneIcon className="h-5 w-5 text-accent-600 mr-2" />
            Professional Recommendation
          </h4>
          <p className="text-accent-800 text-sm">
            For this type of problem, we recommend consulting with a certified professional for safety and best results.
          </p>
        </div>
      )}

      {/* Location Suggestions */}
      {suggestLocationSearch && locationServiceType && (
        <LocationSuggestions 
          serviceType={locationServiceType}
          userLocation={userLocation}
        />
      )}

      {/* Difficulty & Confidence */}
      <div className="flex items-center justify-between mt-3">
        {difficulty && <DifficultyBadge difficulty={difficulty} />}
        {confidenceScore !== undefined && (
          <div className="text-xs text-gray-500">
            Confidence: {Math.round(confidenceScore * 100)}%
          </div>
        )}
      </div>
    </div>
  )
}

export default MarkdownRenderer