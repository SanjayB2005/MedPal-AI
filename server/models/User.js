import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters long'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[\w\.-]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email']
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'es', 'fr', 'de']
    },
    preferredContactMethod: {
      type: String,
      default: 'email',
      enum: ['email', 'phone', 'none']
    },
    safetyReminders: {
      type: Boolean,
      default: true
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    professionalRecommendations: {
      type: Boolean,
      default: true
    }
  },
  lastLogin: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.passwordHash
      delete ret.__v
      return ret
    }
  }
})

// Pre-save middleware to hash password
userSchema.pre('save', async function() {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('passwordHash')) return

  try {
    // Hash password with cost of 12
    const saltRounds = 12
    this.passwordHash = await bcrypt.hash(this.passwordHash, saltRounds)
  } catch (error) {
    throw error
  }
})

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.passwordHash)
  } catch (error) {
    throw new Error('Password comparison failed')
  }
}

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date()
  return await this.save()
}

// Static method to find user by email
userSchema.statics.findByEmail = async function(email) {
  return await this.findOne({ email: email.toLowerCase() })
}

// Virtual for full name (if needed later)
userSchema.virtual('displayName').get(function() {
  return this.name || this.email.split('@')[0]
})

const User = mongoose.model('User', userSchema)

export default User