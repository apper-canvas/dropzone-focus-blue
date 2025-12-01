import { motion } from "framer-motion"
import ApperIcon from "@/components/ApperIcon"

const StatCard = ({ label, value, icon, color, bgColor }) => {
  return (
    <motion.div
      className={`bg-gradient-to-br ${bgColor} rounded-xl p-4 border border-white/50 shadow-sm`}
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
            {label}
          </p>
          <p className={`text-2xl font-bold ${color} mt-1`}>
            {value}
          </p>
        </div>
        <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
          <ApperIcon name={icon} className={`w-5 h-5 ${color}`} />
        </div>
      </div>
    </motion.div>
  )
}

export default StatCard