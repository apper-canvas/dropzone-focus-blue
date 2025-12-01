import { useState, useCallback, useRef, useEffect } from "react"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import DropZone from "@/components/organisms/DropZone"
import FileList from "@/components/organisms/FileList"
import UploadStats from "@/components/organisms/UploadStats"
import { uploadService } from "@/services/api/uploadService"

const HomePage = () => {
  const [files, setFiles] = useState([])
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

  // Load upload history on mount
  useEffect(() => {
    const savedFiles = uploadService.getUploadHistory()
    if (savedFiles.length > 0) {
      setFiles(savedFiles)
    }
  }, [])

  const handleFiles = useCallback((newFiles) => {
    const processedFiles = Array.from(newFiles).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
      progress: 0,
      error: null,
      thumbnail: null,
      uploadedAt: null
    }))

    // Validate files
    const validFiles = []
    processedFiles.forEach(fileData => {
      const validation = uploadService.validateFile(fileData.file)
      if (validation.isValid) {
        validFiles.push(fileData)
        // Generate thumbnail for images
        if (fileData.type.startsWith("image/")) {
          uploadService.generateThumbnail(fileData.file).then(thumbnail => {
            setFiles(prev => prev.map(f => 
              f.id === fileData.id ? { ...f, thumbnail } : f
            ))
          })
        }
      } else {
        toast.error(`${fileData.name}: ${validation.error}`)
      }
    })

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
      toast.success(`Added ${validFiles.length} file${validFiles.length > 1 ? "s" : ""} to upload queue`)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
    
    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles)
    }
  }, [handleFiles])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileInput = useCallback((e) => {
    const selectedFiles = e.target.files
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles)
      e.target.value = ""
    }
  }, [handleFiles])

  const uploadFile = useCallback(async (fileId) => {
    const fileData = files.find(f => f.id === fileId)
    if (!fileData) return

    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: "uploading", progress: 0 } : f
    ))

    try {
      await uploadService.uploadFile(fileData.file, (progress) => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ))
      })

      const updatedFile = {
        ...fileData,
        status: "success",
        progress: 100,
        uploadedAt: new Date()
      }

      setFiles(prev => {
        const updated = prev.map(f => f.id === fileId ? updatedFile : f)
        uploadService.saveUploadHistory(updated)
        return updated
      })

      toast.success(`${fileData.name} uploaded successfully!`)
    } catch (error) {
      const errorMessage = error.message || "Upload failed"
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "error", error: errorMessage } : f
      ))
      toast.error(`Failed to upload ${fileData.name}: ${errorMessage}`)
    }
  }, [files])

  const uploadAllFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === "pending")
    if (pendingFiles.length === 0) {
      toast.info("No files to upload")
      return
    }

    toast.info(`Starting upload of ${pendingFiles.length} files...`)
    
    // Upload files one by one to avoid overwhelming the system
    for (const file of pendingFiles) {
      await uploadFile(file.id)
    }
  }, [files, uploadFile])

  const removeFile = useCallback((fileId) => {
    setFiles(prev => {
      const updated = prev.filter(f => f.id !== fileId)
      uploadService.saveUploadHistory(updated)
      return updated
    })
    toast.info("File removed from queue")
  }, [])

  const clearAll = useCallback(() => {
    setFiles([])
    uploadService.clearUploadHistory()
    toast.info("All files cleared")
  }, [])

  const retryUpload = useCallback((fileId) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: "pending", error: null, progress: 0 } : f
    ))
    uploadFile(fileId)
  }, [uploadFile])

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
            <ApperIcon name="Upload" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            DropZone
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Upload files quickly with visual feedback and preview capabilities. Drag and drop or click to browse.
        </p>
      </motion.div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <DropZone
          dragActive={dragActive}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onFileSelect={() => fileInputRef.current?.click()}
          fileCount={files.length}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          className="hidden"
        />
      </motion.div>

      {/* Upload Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <UploadStats files={files} onUploadAll={uploadAllFiles} onClearAll={clearAll} />
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <FileList
              files={files}
              onUpload={uploadFile}
              onRemove={removeFile}
              onRetry={retryUpload}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default HomePage