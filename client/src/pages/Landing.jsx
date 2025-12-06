import { Link } from 'react-router-dom'
import { 
  ChatBubbleLeftIcon, 
  ShieldCheckIcon, 
  ClockIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import Header from '../components/Header'

const Landing = () => {
  const features = [
    {
      icon: ChatBubbleLeftIcon,
      title: 'AI-Powered Assistance',
      description: 'Get instant help with household problems using advanced AI technology.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Safety First',
      description: 'Always prioritizes your safety with professional recommendations when needed.'
    },
    {
      icon: ClockIcon,
      title: 'Available 24/7',
      description: 'Get help anytime, day or night, for all your household questions.'
    },
    {
      icon: UserGroupIcon,
      title: 'Expert Network',
      description: 'Connect with certified professionals when DIY solutions are not enough.'
    }
  ]

  const categories = [
    { name: '💊 Pharmacy', description: 'Medication guidance and health questions' },
    { name: '🍳 Cooking', description: 'Recipes, fixes, and kitchen troubleshooting' },
    { name: '⚡ Electrical', description: 'Safe electrical maintenance and repairs' },
    { name: '🏠 Household', description: 'General maintenance and home improvement' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <Header showAuth={true} />

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-bold text-neutral-900 mb-6">
            Your Smart Home
            <span className="text-primary-500 block">Assistant</span>
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto">
            Get instant, AI-powered help with pharmacy questions, cooking problems, 
            electrical issues, and general household maintenance. Safety-first guidance 
            with professional recommendations when needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn-primary text-lg px-8 py-4 inline-flex items-center"
            >
              Start Getting Help
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/login"
              className="btn-secondary text-lg px-8 py-4"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">
              Why Choose Our AI Assistant?
            </h3>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              Built with safety and practicality in mind, our AI assistant provides 
              reliable guidance for everyday household challenges.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-100 text-primary-600 rounded-xl mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-neutral-600">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-neutral-900 mb-4">
              Get Help With Everything
            </h3>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              From pharmacy guidance to electrical safety, we've got you covered 
              across all household categories.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <div key={index} className="card hover:shadow-md transition-shadow">
                <h4 className="text-lg font-semibold text-neutral-900 mb-2">
                  {category.name}
                </h4>
                <p className="text-neutral-600 text-sm">
                  {category.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-neutral-900 mb-4">
            Ready to Get Started?
          </h3>
          <p className="text-lg text-neutral-600 mb-8">
            Join thousands of users who rely on our AI assistant for their daily household needs.
          </p>
          <Link
            to="/register"
            className="btn-primary text-lg px-8 py-4 inline-flex items-center"
          >
            Create Your Account
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h4 className="text-lg font-semibold mb-4">🏠 Med Pal</h4>
          <p className="text-neutral-400 mb-4">
            Your trusted companion for household problem-solving.
          </p>
          <p className="text-sm text-neutral-500">
            Always consult professionals for medical, electrical, or safety concerns. 
            This service provides general guidance only.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Landing