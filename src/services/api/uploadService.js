import uploadConfig from "@/services/mockData/uploadConfig.json"

class UploadService {
  constructor() {
    this.config = uploadConfig
  }

  // Validate file against configuration
  validateFile(file) {
    const { maxFileSize, allowedTypes } = this.config

    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024))
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      }
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase()
    const mimeType = file.type

    const isAllowed = allowedTypes.some(type => {
      if (type.startsWith("*.")) {
        return fileExtension === type.slice(2)
      }
      return mimeType === type || mimeType.startsWith(type.split("/")[0] + "/")
    })

    if (!isAllowed) {
      return {
        isValid: false,
        error: "File type not supported"
      }
    }

    return { isValid: true, error: null }
  }

  // Generate thumbnail for image files
  async generateThumbnail(file) {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(null)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          
          // Set thumbnail size
          const maxSize = 100
          let { width, height } = img
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width
              width = maxSize
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height
              height = maxSize
            }
          }
          
          canvas.width = width
          canvas.height = height
          
          ctx.drawImage(img, 0, 0, width, height)
          resolve(canvas.toDataURL("image/jpeg", 0.8))
        }
        img.src = e.target.result
      }
      reader.readAsDataURL(file)
    })
  }

  // Simulate file upload with progress
  async uploadFile(file, onProgress) {
    return new Promise((resolve, reject) => {
      let progress = 0
      const interval = setInterval(() => {
        progress += Math.random() * 15
        if (progress > 100) progress = 100
        
        onProgress(Math.round(progress))
        
        if (progress >= 100) {
          clearInterval(interval)
          
          // Simulate occasional failures (5% chance)
          if (Math.random() < 0.05) {
            reject(new Error("Network error occurred"))
          } else {
            setTimeout(() => resolve({ success: true }), 300)
          }
        }
      }, 200)
    })
  }

  // Save upload history to localStorage
  saveUploadHistory(files) {
    try {
      const history = files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        status: file.status,
        progress: file.progress,
        error: file.error,
        thumbnail: file.thumbnail,
        uploadedAt: file.uploadedAt
      }))
      localStorage.setItem("uploadHistory", JSON.stringify(history))
    } catch (error) {
      console.warn("Failed to save upload history:", error)
    }
  }

  // Load upload history from localStorage
  getUploadHistory() {
    try {
      const history = localStorage.getItem("uploadHistory")
      return history ? JSON.parse(history) : []
    } catch (error) {
      console.warn("Failed to load upload history:", error)
      return []
    }
  }

  // Clear upload history
  clearUploadHistory() {
    try {
      localStorage.removeItem("uploadHistory")
    } catch (error) {
      console.warn("Failed to clear upload history:", error)
    }
  }

  // Get upload configuration
  getConfig() {
    return { ...this.config }
  }
}

export const uploadService = new UploadService()