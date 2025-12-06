import { VALIDATION_PATTERNS } from './constants'

// Validate email
export const validateEmail = (email) => {
  if (!email) return { isValid: false, message: 'Email is required' }
  if (!VALIDATION_PATTERNS.EMAIL.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' }
  }
  return { isValid: true, message: '' }
}

// Validate password
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Password is required' }
  if (password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long' }
  }
  if (!VALIDATION_PATTERNS.PASSWORD.test(password)) {
    return { 
      isValid: false, 
      message: 'Password must contain uppercase, lowercase, and number' 
    }
  }
  return { isValid: true, message: '' }
}

// Validate name
export const validateName = (name) => {
  if (!name) return { isValid: false, message: 'Name is required' }
  if (name.length < 2) {
    return { isValid: false, message: 'Name must be at least 2 characters long' }
  }
  if (name.length > 50) {
    return { isValid: false, message: 'Name must be less than 50 characters long' }
  }
  if (!VALIDATION_PATTERNS.NAME.test(name)) {
    return { isValid: false, message: 'Name can only contain letters and spaces' }
  }
  return { isValid: true, message: '' }
}

// Validate phone number
export const validatePhone = (phone) => {
  if (!phone) return { isValid: true, message: '' } // Phone is optional
  
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, message: 'Please enter a valid phone number' }
  }
  return { isValid: true, message: '' }
}

// Validate confirm password
export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' }
  }
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' }
  }
  return { isValid: true, message: '' }
}

// Validate query text
export const validateQuery = (query) => {
  if (!query || !query.trim()) {
    return { isValid: false, message: 'Please enter a question' }
  }
  if (query.length < 3) {
    return { isValid: false, message: 'Question must be at least 3 characters long' }
  }
  if (query.length > 1000) {
    return { isValid: false, message: 'Question must be less than 1000 characters long' }
  }
  return { isValid: true, message: '' }
}

// Validate registration form
export const validateRegistrationForm = (formData) => {
  const errors = {}
  
  const nameValidation = validateName(formData.fullName)
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.message
  }
  
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message
  }
  
  const passwordValidation = validatePassword(formData.password)
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.message
  }
  
  const confirmPasswordValidation = validateConfirmPassword(
    formData.password, 
    formData.confirmPassword
  )
  if (!confirmPasswordValidation.isValid) {
    errors.confirmPassword = confirmPasswordValidation.message
  }
  
  const phoneValidation = validatePhone(formData.phone)
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validate login form
export const validateLoginForm = (formData) => {
  const errors = {}
  
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message
  }
  
  if (!formData.password) {
    errors.password = 'Password is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validate profile update form
export const validateProfileForm = (formData) => {
  const errors = {}
  
  const nameValidation = validateName(formData.fullName)
  if (!nameValidation.isValid) {
    errors.fullName = nameValidation.message
  }
  
  const emailValidation = validateEmail(formData.email)
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message
  }
  
  const phoneValidation = validatePhone(formData.phone)
  if (!phoneValidation.isValid) {
    errors.phone = phoneValidation.message
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Validate password change form
export const validatePasswordChangeForm = (formData) => {
  const errors = {}
  
  if (!formData.currentPassword) {
    errors.currentPassword = 'Current password is required'
  }
  
  const newPasswordValidation = validatePassword(formData.newPassword)
  if (!newPasswordValidation.isValid) {
    errors.newPassword = newPasswordValidation.message
  }
  
  const confirmPasswordValidation = validateConfirmPassword(
    formData.newPassword,
    formData.confirmNewPassword
  )
  if (!confirmPasswordValidation.isValid) {
    errors.confirmNewPassword = confirmPasswordValidation.message
  }
  
  if (formData.currentPassword === formData.newPassword) {
    errors.newPassword = 'New password must be different from current password'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

// Sanitize HTML to prevent XSS
export const sanitizeHTML = (str) => {
  if (!str) return ''
  
  const temp = document.createElement('div')
  temp.textContent = str
  return temp.innerHTML
}

// Validate file upload
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif'],
    required = false
  } = options
  
  if (!file) {
    return { 
      isValid: !required, 
      message: required ? 'File is required' : '' 
    }
  }
  
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      message: `File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB` 
    }
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      message: `File type must be one of: ${allowedTypes.join(', ')}` 
    }
  }
  
  return { isValid: true, message: '' }
}

// Validate URL
export const validateURL = (url) => {
  if (!url) return { isValid: true, message: '' } // URL is optional
  
  try {
    new URL(url)
    return { isValid: true, message: '' }
  } catch (err) {
    return { isValid: false, message: 'Please enter a valid URL' }
  }
}

// Generic form validator
export const validateForm = (formData, validationRules) => {
  const errors = {}
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field]
    const value = formData[field]
    
    // Check if field is required
    if (rules.required && (!value || value.toString().trim() === '')) {
      errors[field] = rules.requiredMessage || `${field} is required`
      return
    }
    
    // Skip other validations if field is empty and not required
    if (!value && !rules.required) return
    
    // Check minimum length
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = rules.minLengthMessage || 
        `${field} must be at least ${rules.minLength} characters long`
      return
    }
    
    // Check maximum length
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = rules.maxLengthMessage || 
        `${field} must be less than ${rules.maxLength} characters long`
      return
    }
    
    // Check pattern
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || `${field} format is invalid`
      return
    }
    
    // Check custom validation
    if (rules.custom) {
      const customResult = rules.custom(value, formData)
      if (!customResult.isValid) {
        errors[field] = customResult.message
        return
      }
    }
  })
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}