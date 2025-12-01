import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-slate-50 to-blue-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6 px-4"
      >
        <div className="space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-error/20 to-accent/20 rounded-full flex items-center justify-center mx-auto">
            <ApperIcon name="FileX" className="w-12 h-12 text-error" />
          </div>
          <h1 className="text-6xl font-bold text-gray-800">404</h1>
          <h2 className="text-2xl font-semibold text-gray-600">Page Not Found</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            The page you're looking for doesn't exist. Let's get you back to uploading files!
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            to="/" 
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <ApperIcon name="ArrowLeft" className="w-4 h-4" />
            <span>Back to DropZone</span>
          </Link>
          
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-400">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <span>•</span>
            <span>File Upload Tool</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default NotFound