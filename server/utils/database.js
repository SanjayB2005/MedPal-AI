import mongoose from 'mongoose'

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-home-assistant'
    
    const options = {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }

    await mongoose.connect(mongoURI, options)
    console.log('✅ Connected to MongoDB')
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err)
    })

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected')
    })

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected')
    })

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message)
    process.exit(1)
  }
}

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close()
    console.log('✅ MongoDB connection closed')
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error.message)
  }
}