import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const Empty = ({ 
  title = "No files yet", 
  message = "Start by uploading your first file to get started.", 
  icon = "Upload",
  action,
  actionLabel = "Upload Files",
  showAction = true 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="min-h-64 flex flex-col items-center justify-center space-y-6 p-8"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/20 rounded-full flex items-center justify-center"
      >
        <ApperIcon name={icon} className="w-10 h-10 text-primary" />
      </motion.div>

      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">{message}</p>
      </div>

      {showAction && action && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={action} variant="primary">
            <ApperIcon name="Plus" className="w-4 h-4 mr-2" />
            {actionLabel}
          </Button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 gap-4 text-center text-sm text-gray-400 max-w-sm">
        <div className="flex items-center space-x-2">
          <ApperIcon name="Image" className="w-4 h-4" />
          <span>Images</span>
        </div>
        <div className="flex items-center space-x-2">
          <ApperIcon name="FileText" className="w-4 h-4" />
          <span>Documents</span>
        </div>
        <div className="flex items-center space-x-2">
          <ApperIcon name="Archive" className="w-4 h-4" />
          <span>Archives</span>
        </div>
        <div className="flex items-center space-x-2">
          <ApperIcon name="File" className="w-4 h-4" />
          <span>Other files</span>
        </div>
      </div>
    </motion.div>
  )
}

export default Empty