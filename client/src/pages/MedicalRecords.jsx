import { useState, useEffect } from 'react'
import { medicalRecordsAPI } from '../services/api'
import {
  DocumentIcon,
  StarIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CloudArrowUpIcon,
  EyeIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

const MedicalRecords = () => {
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState({ total: 0, starred: 0, byType: {} })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [filePreview, setFilePreview] = useState(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showStarredOnly, setShowStarredOnly] = useState(false)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    recordType: 'other',
    recordDate: new Date().toISOString().split('T')[0],
    tags: '',
    notes: ''
  })

  const recordTypes = [
    { value: 'blood_test', label: '🩸 Blood Test', color: 'red' },
    { value: 'xray', label: '🦴 X-Ray', color: 'blue' },
    { value: 'mri', label: '🧠 MRI/CT Scan', color: 'purple' },
    { value: 'prescription', label: '💊 Prescription', color: 'green' },
    { value: 'lab_report', label: '🔬 Lab Report', color: 'yellow' },
    { value: 'discharge_summary', label: '📋 Discharge Summary', color: 'indigo' },
    { value: 'other', label: '📄 Other', color: 'gray' }
  ]

  useEffect(() => {
    fetchRecords()
  }, [filterType, showStarredOnly])

  const fetchRecords = async () => {
    try {
      setLoading(true)
      const params = {
        recordType: filterType,
        isStarred: showStarredOnly ? 'true' : undefined,
        search: searchQuery || undefined
      }
      const response = await medicalRecordsAPI.getAll(params)
      setRecords(response.records)
      setStats(response.stats)
    } catch (error) {
      console.error('Failed to fetch records:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!validTypes.includes(file.type)) {
      alert('Please select a valid file (JPG, PNG, or PDF)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB')
      return
    }

    setSelectedFile(file)

    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => setFilePreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      setFilePreview(null)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile || !formData.title) {
      alert('Please select a file and enter a title')
      return
    }

    try {
      setUploading(true)
      const uploadData = new FormData()
      uploadData.append('file', selectedFile)
      uploadData.append('title', formData.title)
      uploadData.append('description', formData.description)
      uploadData.append('recordType', formData.recordType)
      uploadData.append('recordDate', formData.recordDate)
      uploadData.append('tags', JSON.stringify(formData.tags.split(',').map(t => t.trim()).filter(Boolean)))
      uploadData.append('notes', formData.notes)

      await medicalRecordsAPI.upload(uploadData)
      
      setShowUploadModal(false)
      setSelectedFile(null)
      setFilePreview(null)
      setFormData({
        title: '',
        description: '',
        recordType: 'other',
        recordDate: new Date().toISOString().split('T')[0],
        tags: '',
        notes: ''
      })
      
      fetchRecords()
    } catch (error) {
      console.error('Upload failed:', error)
      alert('Failed to upload record')
    } finally {
      setUploading(false)
    }
  }

  const handleToggleStar = async (id) => {
    try {
      await medicalRecordsAPI.toggleStar(id)
      fetchRecords()
    } catch (error) {
      console.error('Failed to toggle star:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this record?')) return
    
    try {
      await medicalRecordsAPI.delete(id)
      fetchRecords()
    } catch (error) {
      console.error('Failed to delete record:', error)
    }
  }

  const handleView = (record) => {
    window.open(record.fileUrl, '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📁 Medical Records</h1>
          <p className="text-gray-600">Store and manage your medical documents securely</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Records</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <DocumentIcon className="h-12 w-12 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Starred</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.starred}</p>
              </div>
              <StarIconSolid className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Blood Tests</p>
                <p className="text-3xl font-bold text-red-600">{stats.byType?.blood_test || 0}</p>
              </div>
              <div className="text-4xl">🩸</div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Prescriptions</p>
                <p className="text-3xl font-bold text-green-600">{stats.byType?.prescription || 0}</p>
              </div>
              <div className="text-4xl">💊</div>
            </div>
          </div>
        </div>

        {/* Filters and Upload */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 flex flex-col md:flex-row gap-4 w-full">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search records..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && fetchRecords()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {recordTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <button
                onClick={() => setShowStarredOnly(!showStarredOnly)}
                className={`px-4 py-2 rounded-lg border transition-colors ${
                  showStarredOnly 
                    ? 'bg-yellow-100 border-yellow-300 text-yellow-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <StarIcon className="h-5 w-5 inline-block mr-2" />
                Starred Only
              </button>
            </div>

            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              Upload Record
            </button>
          </div>
        </div>

        {/* Records Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-200">
            <DocumentIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No records yet</h3>
            <p className="text-gray-500 mb-6">Upload your first medical record to get started</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Upload Record
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {records.map(record => {
              const typeInfo = recordTypes.find(t => t.value === record.recordType)
              return (
                <div key={record._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  <div className={`h-48 bg-gradient-to-br from-${typeInfo?.color}-100 to-${typeInfo?.color}-200 flex items-center justify-center relative`}>
                    {record.fileType.startsWith('image/') ? (
                      <img src={record.fileUrl} alt={record.title} className="w-full h-full object-cover" />
                    ) : (
                      <DocumentIcon className={`h-20 w-20 text-${typeInfo?.color}-600`} />
                    )}
                    <button
                      onClick={() => handleToggleStar(record._id)}
                      className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                    >
                      {record.isStarred ? (
                        <StarIconSolid className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <StarIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 flex-1">{record.title}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full bg-${typeInfo?.color}-100 text-${typeInfo?.color}-700`}>
                        {typeInfo?.label}
                      </span>
                    </div>
                    
                    {record.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{record.description}</p>
                    )}

                    <div className="text-xs text-gray-500 mb-4">
                      <p>📅 {new Date(record.recordDate).toLocaleDateString()}</p>
                      <p>📎 {(record.fileSize / 1024).toFixed(2)} KB</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleView(record)}
                        className="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <EyeIcon className="h-4 w-4" />
                        View
                      </button>
                      <button
                        onClick={() => handleDelete(record._id)}
                        className="bg-red-50 text-red-600 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Upload Medical Record</h2>
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleUpload} className="p-6">
                {/* File Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File *
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                    {filePreview ? (
                      <div className="relative">
                        <img src={filePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedFile(null)
                            setFilePreview(null)
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <DocumentIcon className="h-12 w-12 text-blue-600" />
                        <div className="text-left">
                          <p className="font-medium text-gray-900">{selectedFile.name}</p>
                          <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-600 mb-2">Click to upload or drag and drop</p>
                        <p className="text-sm text-gray-500">JPG, PNG, or PDF (max 10MB)</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    {!selectedFile && (
                      <label
                        htmlFor="file-upload"
                        className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-600"
                      >
                        Choose File
                      </label>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Blood Test Results"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Record Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Record Type
                  </label>
                  <select
                    value={formData.recordType}
                    onChange={(e) => setFormData({ ...formData, recordType: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {recordTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Add any additional details..."
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Record Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Record Date
                  </label>
                  <input
                    type="date"
                    value={formData.recordDate}
                    onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Tags */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="e.g., diabetes, heart, annual checkup"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedFile || !formData.title || uploading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : 'Upload Record'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicalRecords
