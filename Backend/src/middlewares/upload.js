import multer from 'multer'

// Factory function to create multer upload middlewares
const createMulterUpload = ({ allowedMimes, maxSize, multiple = false, fieldName }) => {
  const storage = multer.memoryStorage()

  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true)
      } else {
        cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file type'))
      }
    },
    limits: { fileSize: maxSize }
  })

  return multiple ? upload.array(fieldName) : upload.single(fieldName)
}

// Profile photo upload (single file)
export const uploadProfilePhoto = createMulterUpload({
  allowedMimes: ['image/jpeg', 'image/png'],
  maxSize: 5 * 1024 * 1024, // 5MB
  multiple: false,
  fieldName: 'profile'
})

// Event photos upload (multiple files)
export const uploadEventPhotos = createMulterUpload({
  allowedMimes: ['image/jpeg', 'image/png'],
  maxSize: 10 * 1024 * 1024, // 10MB per photo
  multiple: true,
  fieldName: 'photos'
})

// NGO documents upload (multiple files)
export const uploadNgoDocuments = createMulterUpload({
  allowedMimes: ['image/jpeg', 'image/png', 'application/pdf'],
  maxSize: 20 * 1024 * 1024, // 20MB per file
  multiple: true,
  fieldName: 'files'
})

// Middleware to handle multer errors
export const handleMulterErrors = (uploadType) => (req, res, next) => {
  let uploadFunc

  switch (uploadType) {
    case 'profile':
      uploadFunc = uploadProfilePhoto
      break
    case 'event':
      uploadFunc = uploadEventPhotos
      break
    case 'documents':
      uploadFunc = uploadNgoDocuments
      break
    default:
      return res.status(500).json({ success: false, message: 'Invalid upload type' })
  }

  uploadFunc(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      let message = err.message
      if (err.code === 'LIMIT_FILE_SIZE') {
        message = `File too large. Max size is ${
          uploadType === 'profile' ? 5 : uploadType === 'event' ? 10 : 20
        }MB`
      }
      return res.status(400).json({ success: false, message:err.message })
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message })
    }
    next()
  })
}

export default createMulterUpload
