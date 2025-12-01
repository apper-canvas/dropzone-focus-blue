import { motion, AnimatePresence } from "framer-motion"
import FileCard from "@/components/molecules/FileCard"

const FileList = ({ files, onUpload, onRemove, onRetry }) => {
  if (files.length === 0) return null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
<h2 className="text-xl font-semibold text-gray-800">File Manager</h2>
        <div className="text-sm text-gray-500">
          {files.length} file{files.length > 1 ? "s" : ""}
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {files.map((file, index) => (
            <motion.div
              key={file.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -100, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.05,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
              layout
            >
              <FileCard
                file={file}
                onUpload={onUpload}
                onRemove={onRemove}
                onRetry={onRetry}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default FileList