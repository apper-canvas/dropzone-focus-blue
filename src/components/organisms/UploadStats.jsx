import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import StatCard from "@/components/molecules/StatCard"

const UploadStats = ({ files, onUploadAll, onClearAll }) => {
  const totalFiles = files.length
  const uploadedFiles = files.filter(f => f.status === "success").length
  const failedFiles = files.filter(f => f.status === "error").length
  const pendingFiles = files.filter(f => f.status === "pending").length
  const uploadingFiles = files.filter(f => f.status === "uploading").length
  
  const totalSize = files.reduce((acc, file) => acc + (file.size || 0), 0)
  const uploadedSize = files
    .filter(f => f.status === "success")
    .reduce((acc, file) => acc + (file.size || 0), 0)
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  if (totalFiles === 0) return null

  const stats = [
    {
      label: "Total Files",
      value: totalFiles,
      icon: "Files",
      color: "text-gray-600",
      bgColor: "from-gray-100 to-gray-200"
    },
    {
      label: "Uploaded",
      value: uploadedFiles,
      icon: "CheckCircle",
      color: "text-success",
      bgColor: "from-success/10 to-success/20"
    },
    {
      label: "Failed",
      value: failedFiles,
      icon: "XCircle",
      color: "text-error",
      bgColor: "from-error/10 to-error/20"
    },
    {
      label: "Total Size",
      value: formatFileSize(totalSize),
      icon: "HardDrive",
      color: "text-primary",
      bgColor: "from-primary/10 to-primary/20"
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Progress Summary */}
      {totalFiles > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Upload Progress</h3>
            <span className="text-sm text-gray-500">
              {uploadedFiles} of {totalFiles} completed
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-success to-success/80"
              initial={{ width: 0 }}
              animate={{ width: `${totalFiles > 0 ? (uploadedFiles / totalFiles) * 100 : 0}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          <div className="text-xs text-gray-500 mb-4">
            {uploadedSize > 0 && (
              <span>
                {formatFileSize(uploadedSize)} of {formatFileSize(totalSize)} uploaded
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            {(pendingFiles > 0 || uploadingFiles > 0) && (
              <Button
                onClick={onUploadAll}
                variant="primary"
                size="md"
                disabled={pendingFiles === 0}
                className="flex-1"
              >
                <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
                Upload {pendingFiles > 0 ? `${pendingFiles} Files` : "All"}
              </Button>
            )}
            
            <Button
              onClick={onClearAll}
              variant="outline"
              size="md"
              className="flex-1 sm:flex-initial"
            >
              <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default UploadStats