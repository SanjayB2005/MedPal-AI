import express from 'express'
import { 
  uploadRecord, 
  getRecords, 
  getRecord, 
  updateRecord, 
  toggleStar, 
  deleteRecord
} from '../controllers/medicalRecordController.js'
import { authenticateToken } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateToken)

// Routes
router.post('/', upload.single('file'), uploadRecord)
router.get('/', getRecords)
router.get('/:id', getRecord)
router.put('/:id', updateRecord)
router.patch('/:id/star', toggleStar)
router.delete('/:id', deleteRecord)

export default router
