// File Upload Utility using Supabase Storage
import { supabase } from './supabase-config.js';

class FileUploadManager {
  static async uploadFile(file, userId) {
    try {
      // Create a unique file name to prevent conflicts
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { data, error } = await supabase
        .storage
        .from('notehive-uploads')
        .upload(fileName, file);
      
      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }
      
      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase
        .storage
        .from('notehive-uploads')
        .getPublicUrl(fileName);
      
      return {
        success: true,
        url: publicUrl,
        path: data.path
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  static async deleteFile(filePath) {
    try {
      const { error } = await supabase
        .storage
        .from('notehive-uploads')
        .remove([filePath]);
      
      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
      
      return { success: true };
    } catch (error) {
      console.error('File delete error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  static async listFiles(userId) {
    try {
      const { data, error } = await supabase
        .storage
        .from('notehive-uploads')
        .list(userId);
      
      if (error) {
        throw new Error(`List failed: ${error.message}`);
      }
      
      return {
        success: true,
        files: data
      };
    } catch (error) {
      console.error('File listing error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export for use in other modules
window.fileUploadManager = FileUploadManager;