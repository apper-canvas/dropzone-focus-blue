import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"

const ErrorView = ({ 
  title = "Something went wrong", 
  message = "We encountered an error while loading your data.", 
  onRetry,
  showRetry = true 
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
        className="w-16 h-16 bg-gradient-to-br from-error/20 to-error/30 rounded-full flex items-center justify-center"
      >
        <ApperIcon name="AlertTriangle" className="w-8 h-8 text-error" />
      </motion.div>

      <div className="text-center space-y-2 max-w-md">
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">{message}</p>
      </div>

      {showRetry && onRetry && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={onRetry} variant="primary">
            <ApperIcon name="RotateCcw" className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      )}

      <div className="text-sm text-gray-400 text-center">
        <p>If this problem persists, please refresh the page</p>
      </div>
    </motion.div>
  )
}

export default ErrorView