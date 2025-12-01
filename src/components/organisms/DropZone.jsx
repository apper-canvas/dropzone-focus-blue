import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const DropZone = ({ 
  dragActive, 
  onDrop, 
  onDragOver, 
  onDragLeave, 
  onFileSelect, 
  fileCount 
}) => {
  return (
    <motion.div
      className={`
        relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 
        ${dragActive 
          ? "border-accent bg-gradient-to-br from-accent/5 to-secondary/5 scale-[1.02] shadow-lg" 
          : "border-primary/30 bg-gradient-to-br from-primary/5 to-secondary/5 hover:border-primary/50 hover:bg-gradient-to-br hover:from-primary/10 hover:to-secondary/10"
        }
      `}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="space-y-6">
        <motion.div
          className={`
            w-20 h-20 mx-auto rounded-full flex items-center justify-center
            ${dragActive 
              ? "bg-gradient-to-br from-accent to-secondary/80" 
              : "bg-gradient-to-br from-primary to-secondary"
            }
          `}
          animate={dragActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.6, repeat: dragActive ? Infinity : 0 }}
        >
          <ApperIcon 
            name={dragActive ? "FileUp" : "Upload"} 
            className="w-10 h-10 text-white" 
          />
        </motion.div>

        <div className="space-y-2">
          <h3 className={`text-xl font-semibold ${dragActive ? "text-accent" : "text-gray-700"}`}>
            {dragActive ? "Drop files here!" : "Drag & drop files here"}
          </h3>
          <p className="text-gray-500">
            or click below to browse your files
          </p>
        </div>

        <Button
          onClick={onFileSelect}
          variant="primary"
          size="lg"
          className="font-medium"
        >
          <ApperIcon name="FolderOpen" className="w-5 h-5 mr-2" />
          Choose Files
        </Button>

        <div className="text-sm text-gray-400 space-y-1">
          <p>Supports: Images, PDF, Documents, Text files, ZIP archives</p>
          <p>Maximum file size: 10MB each</p>
          {fileCount > 0 && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-primary font-medium"
            >
              {fileCount} file{fileCount > 1 ? "s" : ""} ready
            </motion.p>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default DropZone