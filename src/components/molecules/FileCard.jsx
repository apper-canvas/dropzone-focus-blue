import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import ProgressBar from "@/components/atoms/ProgressBar"

const FileCard = ({ file, onUpload, onRemove, onRetry }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  const getFileIcon = (type) => {
    if (type.startsWith("image/")) return "Image"
    if (type === "application/pdf") return "FileText"
    if (type.includes("document") || type.includes("word")) return "FileText"
    if (type.includes("zip") || type.includes("archive")) return "Archive"
    return "File"
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "uploading": return "text-info"
      case "success": return "text-success"
      case "error": return "text-error"
      default: return "text-gray-500"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "uploading": return "Loader"
      case "success": return "CheckCircle"
      case "error": return "XCircle"
      default: return "Clock"
    }
  }

  return (
    <motion.div
      className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all duration-300"
      whileHover={{ y: -2, shadow: "0 4px 12px rgba(0,0,0,0.1)" }}
      layout
    >
      <div className="flex items-center space-x-4">
        {/* File Thumbnail/Icon */}
        <div className="flex-shrink-0">
          {file.thumbnail ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
              <ApperIcon 
                name={getFileIcon(file.type)} 
                className="w-6 h-6 text-gray-500" 
              />
            </div>
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 truncate pr-2">
              {file.name}
            </h4>
            <div className="flex items-center space-x-2">
              <motion.div
                className={`flex items-center space-x-1 ${getStatusColor(file.status)}`}
                animate={file.status === "uploading" ? { rotate: 360 } : { rotate: 0 }}
                transition={{ duration: 2, repeat: file.status === "uploading" ? Infinity : 0, ease: "linear" }}
              >
                <ApperIcon 
                  name={getStatusIcon(file.status)} 
                  className="w-4 h-4" 
                />
              </motion.div>
            </div>
          </div>

<div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-500">
              {formatFileSize(file.size)} • {file.type?.split("/")[1]?.toUpperCase() || "FILE"}
            </span>
            {file.status === "uploading" && (
              <span className="text-xs font-medium text-info">
                {file.progress}%
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {(file.status === "uploading" || file.status === "success") && (
            <div className="mt-2">
              <ProgressBar 
                progress={file.progress} 
                status={file.status}
                animated={file.status === "uploading"}
              />
            </div>
          )}

          {/* Error Message */}
          {file.status === "error" && file.error && (
            <div className="mt-2 text-xs text-error bg-error/10 px-2 py-1 rounded">
              {file.error}
            </div>
          )}

          {/* Upload Time */}
          {file.uploadedAt && (
            <div className="mt-1 text-xs text-gray-400">
              Uploaded {new Date(file.uploadedAt).toLocaleTimeString()}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {file.status === "pending" && (
            <Button
              onClick={() => onUpload(file.id)}
              variant="primary"
              size="sm"
            >
              <ApperIcon name="Upload" className="w-3 h-3" />
            </Button>
          )}

          {file.status === "error" && (
            <Button
              onClick={() => onRetry(file.id)}
              variant="outline"
              size="sm"
            >
              <ApperIcon name="RotateCcw" className="w-3 h-3" />
            </Button>
          )}

          <Button
            onClick={() => onRemove(file.id)}
            variant="outline"
            size="sm"
            className="text-error hover:text-error hover:border-error/20"
          >
            <ApperIcon name="X" className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}

export default FileCard