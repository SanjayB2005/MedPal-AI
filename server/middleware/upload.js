import multer from 'multer'

// Configure multer for memory storage (process files in memory)
const storage = multer.memoryStorage()

// File filter to accept only images and PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG) and PDF files are allowed!'), false)
  }
}

// Multer upload configuration
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
})
