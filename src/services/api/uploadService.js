import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

class UploadService {
  constructor() {
    this.config = {
      maxFileSize: 10485760, // 10MB
      allowedTypes: [
        "image/jpeg",
        "image/png", 
        "image/gif",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "application/zip",
        "application/x-zip-compressed"
      ],
      maxFiles: 50
    };
  }

  // Validate file against configuration
  validateFile(file) {
    const { maxFileSize, allowedTypes } = this.config;

    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      return {
        isValid: false,
        error: `File size exceeds ${maxSizeMB}MB limit`
      };
    }

    const fileExtension = file.name.split(".").pop()?.toLowerCase();
    const mimeType = file.type;

    const isAllowed = allowedTypes.some(type => {
      if (type.startsWith("*.")) {
        return fileExtension === type.slice(2);
      }
      return mimeType === type || mimeType.startsWith(type.split("/")[0] + "/");
    });

    if (!isAllowed) {
      return {
        isValid: false,
        error: "File type not supported"
      };
    }

    return { isValid: true, error: null };
  }

  // Generate thumbnail for image files
  async generateThumbnail(file) {
    return new Promise((resolve) => {
      if (!file.type.startsWith("image/")) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          
          // Set thumbnail size
          const maxSize = 100;
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // Create file record using ApperClient
  async createFileRecord(fileData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      // Prepare the file record with Files type fields
      const fileFiles = fileData.file ? [fileData.file] : [];
      const thumbnailFiles = fileData.thumbnail_c || [];

      const params = {
        records: [{
          Name: fileData.Name,
          size_c: fileData.size_c,
          type_c: fileData.type_c,
          status_c: fileData.status_c || "pending",
          progress_c: fileData.progress_c || 0,
          error_c: fileData.error_c || "",
          Tags: fileData.Tags || "",
          file_c: fileFiles.length > 0 ? fileFiles : undefined,
          thumbnail_c: thumbnailFiles.length > 0 ? thumbnailFiles : undefined
        }]
      };

      const response = await apperClient.createRecord('uploaded_file_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} file records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error creating file record:", error);
      toast.error("Failed to create file record");
      return null;
    }
  }

  // Update file record using ApperClient
  async updateFileRecord(id, updateData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        records: [{
          Id: id,
          ...updateData
        }]
      };

      const response = await apperClient.updateRecord('uploaded_file_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} file records:`, failed);
          failed.forEach(record => {
            record.errors?.forEach(error => toast.error(`${error.fieldLabel}: ${error}`));
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }

      return null;
    } catch (error) {
      console.error("Error updating file record:", error);
      toast.error("Failed to update file record");
      return null;
    }
  }

  // Get all file records using ApperClient
  async getAllFileRecords() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          {"field": {"Name": "Id"}},
          {"field": {"Name": "Name"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "progress_c"}},
          {"field": {"Name": "error_c"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "file_c"}},
          {"field": {"Name": "thumbnail_c"}},
          {"field": {"Name": "uploaded_at_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        orderBy: [{
          "fieldName": "CreatedOn",
          "sorttype": "DESC"
        }]
      };

      const response = await apperClient.fetchRecords('uploaded_file_c', params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching file records:", error);
      return [];
    }
  }

  // Delete file record using ApperClient
  async deleteFileRecord(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = { 
        RecordIds: [id]
      };

      const response = await apperClient.deleteRecord('uploaded_file_c', params);
      
      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} file records:`, failed);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }
        
        return successful.length > 0;
      }

      return false;
    } catch (error) {
      console.error("Error deleting file record:", error);
      toast.error("Failed to delete file record");
      return false;
    }
  }

  // Simulate file upload with progress (for UI purposes)
  async simulateUpload(onProgress) {
    return new Promise((resolve, reject) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 100) progress = 100;
        
        onProgress(Math.round(progress));
        
        if (progress >= 100) {
          clearInterval(interval);
          
          // Simulate occasional failures (5% chance)
          if (Math.random() < 0.05) {
            reject(new Error("Network error occurred"));
          } else {
            setTimeout(() => resolve({ success: true }), 300);
          }
        }
      }, 200);
    });
  }

  // Get upload configuration
  getConfig() {
    return { ...this.config };
  }
}
export const uploadService = new UploadService();