import { motion } from "framer-motion"
import { cn } from "@/utils/cn"

const ProgressBar = ({ progress = 0, status = "pending", animated = false, className }) => {
  const getProgressColor = (status) => {
    switch (status) {
      case "uploading": return "from-info to-info/80"
      case "success": return "from-success to-success/80"
      case "error": return "from-error to-error/80"
      default: return "from-gray-400 to-gray-400/80"
    }
  }

  return (
    <div className={cn("w-full bg-gray-200 rounded-full h-2 overflow-hidden", className)}>
      <motion.div
        className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(status)} ${animated ? "animate-pulse" : ""}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  )
}

export default ProgressBar