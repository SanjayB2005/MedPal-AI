import MedicalRecord from '../models/MedicalRecord.js'
import cloudinary from '../config/cloudinary.js'
import { Readable } from 'stream'
import mongoose from 'mongoose'

// Upload medical record
export const uploadRecord = async (req, res) => {
  try {
    console.log('Upload request received')
    console.log('Body:', req.body)
    console.log('File:', req.file)
    
    const { title, description, recordType, recordDate, tags, notes } = req.body
    const userId = req.user._id
    const file = req.file

    if (!file) {
      console.error('No file in request')
      return res.status(400).json({ error: 'No file uploaded' })
    }

    if (!title) {
      console.error('No title provided')
      return res.status(400).json({ error: 'Title is required' })
    }

    console.log('Starting Cloudinary upload...')
    
    // Upload to Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `medpal/medical-records/${userId}`,
        resource_type: 'auto',
        format: file.mimetype === 'application/pdf' ? 'pdf' : undefined,
      },
      async (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error)
          return res.status(500).json({ error: 'Failed to upload file to cloud storage', details: error.message })
        }

        console.log('Cloudinary upload successful:', result.secure_url)

        try {
          // Create medical record in database
          const medicalRecord = await MedicalRecord.create({
            userId,
            title,
            description,
            recordType: recordType || 'other',
            fileUrl: result.secure_url,
            publicId: result.public_id,
            fileType: file.mimetype,
            fileSize: file.size,
            recordDate: recordDate || new Date(),
            tags: tags ? JSON.parse(tags) : [],
            notes
          })

          console.log('Database record created:', medicalRecord._id)

          res.status(201).json({
            success: true,
            record: medicalRecord
          })
        } catch (dbError) {
          console.error('Database error:', dbError)
          // Delete uploaded file if database save fails
          await cloudinary.uploader.destroy(result.public_id)
          res.status(500).json({ error: 'Failed to save record to database', details: dbError.message })
        }
      }
    )

    // Convert buffer to stream and pipe to Cloudinary
    const bufferStream = Readable.from(file.buffer)
    bufferStream.pipe(uploadStream)

  } catch (error) {
    console.error('Upload record error:', error)
    res.status(500).json({ error: 'Failed to upload medical record', details: error.message })
  }
}

// Get all records for user
export const getRecords = async (req, res) => {
  try {
    const userId = req.user._id
    const { recordType, isStarred, search, sortBy = 'uploadDate', order = 'desc' } = req.query

    // Build query
    const query = { userId }
    
    if (recordType && recordType !== 'all') {
      query.recordType = recordType
    }
    
    if (isStarred === 'true') {
      query.isStarred = true
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Get records with sorting
    const records = await MedicalRecord.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .select('-__v')

    // Get statistics
    const stats = await MedicalRecord.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$recordType',
          count: { $sum: 1 }
        }
      }
    ])

    const totalRecords = await MedicalRecord.countDocuments({ userId })
    const starredRecords = await MedicalRecord.countDocuments({ userId, isStarred: true })

    res.json({
      success: true,
      records,
      stats: {
        total: totalRecords,
        starred: starredRecords,
        byType: stats.reduce((acc, item) => {
          acc[item._id] = item.count
          return acc
        }, {})
      }
    })
  } catch (error) {
    console.error('Get records error:', error)
    res.status(500).json({ error: 'Failed to fetch medical records' })
  }
}

// Get single record
export const getRecord = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const record = await MedicalRecord.findOne({ _id: id, userId })

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }

    res.json({ success: true, record })
  } catch (error) {
    console.error('Get record error:', error)
    res.status(500).json({ error: 'Failed to fetch record' })
  }
}

// Update record
export const updateRecord = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const { title, description, recordType, recordDate, tags, notes } = req.body

    const record = await MedicalRecord.findOne({ _id: id, userId })

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }

    // Update fields
    if (title) record.title = title
    if (description !== undefined) record.description = description
    if (recordType) record.recordType = recordType
    if (recordDate) record.recordDate = recordDate
    if (tags) record.tags = JSON.parse(tags)
    if (notes !== undefined) record.notes = notes

    await record.save()

    res.json({ success: true, record })
  } catch (error) {
    console.error('Update record error:', error)
    res.status(500).json({ error: 'Failed to update record' })
  }
}

// Toggle star
export const toggleStar = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const record = await MedicalRecord.findOne({ _id: id, userId })

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }

    await record.toggleStar()

    res.json({ success: true, record })
  } catch (error) {
    console.error('Toggle star error:', error)
    res.status(500).json({ error: 'Failed to toggle star' })
  }
}

// Delete record
export const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const record = await MedicalRecord.findOne({ _id: id, userId })

    if (!record) {
      return res.status(404).json({ error: 'Record not found' })
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(record.publicId)

    // Delete from database
    await record.deleteOne()

    res.json({ success: true, message: 'Record deleted successfully' })
  } catch (error) {
    console.error('Delete record error:', error)
    res.status(500).json({ error: 'Failed to delete record' })
  }
}
