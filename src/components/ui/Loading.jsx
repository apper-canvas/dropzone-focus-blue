import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-64 flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center"
      >
        <ApperIcon name="Loader" className="w-6 h-6 text-white" />
      </motion.div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-medium text-gray-700">Loading</h3>
        <p className="text-gray-500">{message}</p>
      </div>

      {/* Skeleton Content */}
      <div className="w-full max-w-md space-y-3">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg"
            animate={{ backgroundPosition: ["0% 50%", "100% 50%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ backgroundSize: "200% 100%" }}
          />
        ))}
      </div>
    </div>
  )
}

export default Loading