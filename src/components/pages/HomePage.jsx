import { useState, useCallback, useRef, useEffect } from "react"
import { toast } from "react-toastify"
import { motion, AnimatePresence } from "framer-motion"
import { useSelector } from "react-redux"
import ApperIcon from "@/components/ApperIcon"
import DropZone from "@/components/organisms/DropZone"
import FileList from "@/components/organisms/FileList"
import UploadStats from "@/components/organisms/UploadStats"
import ApperFileFieldComponent from "@/components/atoms/FileUploader/ApperFileFieldComponent"
import { uploadService } from "@/services/api/uploadService"

const HomePage = () => {
  const { user, isAuthenticated } = useSelector((state) => state.user);
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Load file records on mount
  useEffect(() => {
    loadFileRecords();
  }, [isAuthenticated]);

  const loadFileRecords = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const records = await uploadService.getAllFileRecords();
      const formattedFiles = records.map(record => ({
        id: record.Id,
        file: null, // Database record doesn't have the original file object
        name: record.Name,
        size: record.size_c,
        type: record.type_c,
        status: record.status_c,
        progress: record.progress_c || 0,
        error: record.error_c || null,
        thumbnail: record.thumbnail_c?.[0]?.Path ? record.thumbnail_c[0].Path : null,
        uploadedAt: record.uploaded_at_c || record.CreatedOn,
        dbRecord: record // Store the full database record
      }));
      setFiles(formattedFiles);
    } catch (error) {
      console.error("Error loading file records:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = useCallback((newFiles) => {
    if (!isAuthenticated) {
      toast.error("Please login to upload files");
      return;
    }

    const processedFiles = Array.from(newFiles).map(file => ({
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      status: "pending",
      progress: 0,
      error: null,
      thumbnail: null,
      uploadedAt: null,
      dbRecord: null
    }));

    // Validate files
    const validFiles = [];
    processedFiles.forEach(fileData => {
      const validation = uploadService.validateFile(fileData.file);
      if (validation.isValid) {
        validFiles.push(fileData);
        // Generate thumbnail for images
        if (fileData.type.startsWith("image/")) {
          uploadService.generateThumbnail(fileData.file).then(thumbnail => {
            setFiles(prev => prev.map(f => 
              f.id === fileData.id ? { ...f, thumbnail } : f
            ));
          });
        }
      } else {
        toast.error(`${fileData.name}: ${validation.error}`);
      }
    });

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      toast.success(`Added ${validFiles.length} file${validFiles.length > 1 ? "s" : ""} to upload queue`);
    }
  }, [isAuthenticated]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragActive(false);
  }, []);

  const handleFileInput = useCallback((e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles.length > 0) {
      handleFiles(selectedFiles);
      e.target.value = "";
    }
  }, [handleFiles]);

  const uploadFile = useCallback(async (fileId) => {
    if (!isAuthenticated) {
      toast.error("Please login to upload files");
      return;
    }

    const fileData = files.find(f => f.id === fileId);
    if (!fileData) return;

    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: "uploading", progress: 0 } : f
    ));

    try {
      // Create database record first
      const dbRecord = await uploadService.createFileRecord({
        Name: fileData.name,
        size_c: fileData.size,
        type_c: fileData.type,
        status_c: "uploading",
        progress_c: 0,
        file_c: fileData.file ? [fileData.file] : [],
        thumbnail_c: fileData.thumbnail ? [fileData.thumbnail] : []
      });

      if (!dbRecord) {
        throw new Error("Failed to create file record");
      }

      // Simulate upload progress
      await uploadService.simulateUpload((progress) => {
        setFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, progress } : f
        ));
        
        // Update database record with progress
        uploadService.updateFileRecord(dbRecord.Id, {
          progress_c: progress,
          status_c: progress === 100 ? "success" : "uploading"
        });
      });

      // Update final status
      const updatedRecord = await uploadService.updateFileRecord(dbRecord.Id, {
        status_c: "success",
        progress_c: 100,
        uploaded_at_c: new Date().toISOString()
      });

      const updatedFile = {
        ...fileData,
        status: "success",
        progress: 100,
        uploadedAt: new Date(),
        dbRecord: updatedRecord
      };

      setFiles(prev => prev.map(f => f.id === fileId ? updatedFile : f));
      toast.success(`${fileData.name} uploaded successfully!`);

    } catch (error) {
      const errorMessage = error.message || "Upload failed";
      
      // Update database record with error
      if (fileData.dbRecord) {
        uploadService.updateFileRecord(fileData.dbRecord.Id, {
          status_c: "error",
          error_c: errorMessage
        });
      }
      
      setFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: "error", error: errorMessage } : f
      ));
      toast.error(`Failed to upload ${fileData.name}: ${errorMessage}`);
    }
  }, [files, isAuthenticated]);

  const uploadAllFiles = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Please login to upload files");
      return;
    }

    const pendingFiles = files.filter(f => f.status === "pending");
    if (pendingFiles.length === 0) {
      toast.info("No files to upload");
      return;
    }

    toast.info(`Starting upload of ${pendingFiles.length} files...`);
    
    // Upload files one by one to avoid overwhelming the system
    for (const file of pendingFiles) {
      await uploadFile(file.id);
    }
  }, [files, uploadFile, isAuthenticated]);

  const removeFile = useCallback(async (fileId) => {
    const fileData = files.find(f => f.id === fileId);
    
    // Delete from database if it exists
    if (fileData?.dbRecord?.Id) {
      await uploadService.deleteFileRecord(fileData.dbRecord.Id);
    }
    
    setFiles(prev => prev.filter(f => f.id !== fileId));
    toast.info("File removed");
  }, [files]);

  const clearAll = useCallback(async () => {
    if (!isAuthenticated) return;

    // Delete all database records
    const recordsToDelete = files.filter(f => f.dbRecord?.Id).map(f => f.dbRecord.Id);
    for (const id of recordsToDelete) {
      await uploadService.deleteFileRecord(id);
    }
    
    setFiles([]);
    toast.info("All files cleared");
  }, [files, isAuthenticated]);

  const retryUpload = useCallback((fileId) => {
    setFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status: "pending", error: null, progress: 0 } : f
    ));
    uploadFile(fileId);
  }, [uploadFile]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg mx-auto">
            <ApperIcon name="Upload" className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to DropZone</h1>
            <p className="text-gray-600 mb-6">Please sign in to upload and manage your files</p>
            <a 
              href="/login" 
              className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              <ApperIcon name="LogIn" className="w-5 h-5 mr-2" />
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
            <ApperIcon name="Upload" className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            DropZone
          </h1>
        </div>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Upload files quickly with visual feedback and preview capabilities. Drag and drop or click to browse.
        </p>
        {user && (
          <p className="text-sm text-gray-500">
            Welcome back, {user.firstName || user.emailAddress}!
          </p>
        )}
      </motion.div>

      {/* Drop Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <DropZone
          dragActive={dragActive}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onFileSelect={() => fileInputRef.current?.click()}
          fileCount={files.length}
        />
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          accept="image/*,.pdf,.doc,.docx,.txt,.zip"
          className="hidden"
        />
      </motion.div>

      {/* Upload Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <UploadStats files={files} onUploadAll={uploadAllFiles} onClearAll={clearAll} />
      </motion.div>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <FileList
              files={files}
              onUpload={uploadFile}
              onRemove={removeFile}
              onRetry={retryUpload}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2">
            <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-gray-600">Loading files...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;