import { useState, useEffect, useRef, useMemo } from 'react';

const ApperFileFieldComponent = ({ elementId, config }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  
  const mountedRef = useRef(false);
  const elementIdRef = useRef(elementId);
  const existingFilesRef = useRef([]);

  // Update elementId ref when it changes
  useEffect(() => {
    elementIdRef.current = elementId;
  }, [elementId]);

  // Memoized existingFiles to prevent unnecessary re-renders
  const memoizedExistingFiles = useMemo(() => {
    const files = config.existingFiles || [];
    
    // Return empty array if no files or same length and first file ID matches
    if (!files.length || 
        (files.length === existingFilesRef.current.length && 
         files[0]?.Id === existingFilesRef.current[0]?.Id)) {
      return existingFilesRef.current.length === 0 ? [] : existingFilesRef.current;
    }
    
    return files;
  }, [config.existingFiles]);

  // Initial mount effect
  useEffect(() => {
    const initializeSDK = async () => {
      try {
        // Wait for ApperSDK to load
        let attempts = 0;
        const maxAttempts = 50;
        
        while (!window.ApperSDK && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }
        
        if (!window.ApperSDK) {
          throw new Error('ApperSDK not loaded. Please ensure the SDK script is included before this component.');
        }

        const { ApperFileUploader } = window.ApperSDK;
        elementIdRef.current = `file-uploader-${elementId}`;
        
        await ApperFileUploader.FileField.mount(elementIdRef.current, {
          ...config,
          existingFiles: memoizedExistingFiles
        });
        
        mountedRef.current = true;
        setIsReady(true);
        setError(null);
        
      } catch (err) {
        console.error('Error initializing ApperFileFieldComponent:', err);
        setError(err.message);
        setIsReady(false);
      }
    };

    initializeSDK();

    // Cleanup
    return () => {
      try {
        if (mountedRef.current && window.ApperSDK) {
          const { ApperFileUploader } = window.ApperSDK;
          ApperFileUploader.FileField.unmount(elementIdRef.current);
          mountedRef.current = false;
        }
      } catch (err) {
        console.error('Error unmounting ApperFileFieldComponent:', err);
      }
      setIsReady(false);
    };
  }, [elementId, config.fieldKey]);

  // File update effect
  useEffect(() => {
    if (!isReady || !window.ApperSDK || !config.fieldKey) return;
    
    try {
      const { ApperFileUploader } = window.ApperSDK;
      
      // Deep equality check
      const currentFiles = JSON.stringify(memoizedExistingFiles);
      const previousFiles = JSON.stringify(existingFilesRef.current);
      
      if (currentFiles === previousFiles) return;
      
      // Update the ref
      existingFilesRef.current = memoizedExistingFiles;
      
      // Detect format and convert if needed
      let filesToUpdate = memoizedExistingFiles;
      if (filesToUpdate.length > 0 && filesToUpdate[0].Id !== undefined) {
        filesToUpdate = ApperFileUploader.toUIFormat(filesToUpdate);
      }
      
      if (filesToUpdate.length > 0) {
        ApperFileUploader.FileField.updateFiles(config.fieldKey, filesToUpdate);
      } else {
        ApperFileUploader.FileField.clearField(config.fieldKey);
      }
      
    } catch (err) {
      console.error('Error updating files:', err);
      setError(err.message);
    }
  }, [memoizedExistingFiles, isReady, config.fieldKey]);

  if (error) {
    return (
      <div className="p-4 border border-red-200 rounded-md bg-red-50">
        <div className="text-red-800 text-sm">
          Error loading file uploader: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div id={`file-uploader-${elementId}`} className="w-full">
        {!isReady && (
          <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
            <div className="text-gray-600 text-sm">
              Loading file uploader...
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApperFileFieldComponent;