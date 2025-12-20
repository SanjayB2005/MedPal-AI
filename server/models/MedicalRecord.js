import mongoose from 'mongoose'

const medicalRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  recordType: {
    type: String,
    enum: ['blood_test', 'xray', 'mri', 'prescription', 'lab_report', 'discharge_summary', 'other'],
    default: 'other'
  },
  fileUrl: {
    type: String,
    required: true
  },
  publicId: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  recordDate: {
    type: Date
  },
  tags: [{
    type: String,
    trim: true
  }],
  aiAnalysis: {
    analyzed: {
      type: Boolean,
      default: false
    },
    summary: String,
    keyFindings: [String],
    analyzedAt: Date
  },
  isStarred: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
})

// Index for efficient queries
medicalRecordSchema.index({ userId: 1, uploadDate: -1 })
medicalRecordSchema.index({ userId: 1, recordType: 1 })
medicalRecordSchema.index({ userId: 1, isStarred: 1 })

// Method to toggle star
medicalRecordSchema.methods.toggleStar = function() {
  this.isStarred = !this.isStarred
  return this.save()
}

const MedicalRecord = mongoose.model('MedicalRecord', medicalRecordSchema)

export default MedicalRecord
