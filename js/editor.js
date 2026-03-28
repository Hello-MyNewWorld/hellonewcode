// Note Editor Module
import { supabase } from './supabase-config.js';

class EditorManager {
  constructor() {
    this.attachedFiles = [];
    this.currentUser = null;
    this.initializeElements();
    this.attachEventListeners();
  }
  
  setCurrentUser(user) {
    this.currentUser = user;
  }

  initializeElements() {
    this.editorOverlay = document.getElementById('note-editor');
    this.noteTitle = document.getElementById('note-title');
    this.noteTags = document.getElementById('note-tags');
    this.noteContent = document.getElementById('note-content');
    this.saveNoteBtn = document.getElementById('save-note-btn');
    this.closeEditorBtn = document.getElementById('close-editor-btn');
    this.attachFileBtn = document.getElementById('attach-file-btn');
    this.fileInput = document.getElementById('file-input');
    this.attachedFilesList = document.getElementById('attached-files-list');
    this.editorFilesContainer = document.getElementById('editor-files-container');
    this.currentNote = null;
  }

  attachEventListeners() {
    this.saveNoteBtn.addEventListener('click', () => this.saveNote());
    this.closeEditorBtn.addEventListener('click', () => this.close());
    this.attachFileBtn.addEventListener('click', () => this.triggerFileInput());
    this.fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
    
    // Close editor when clicking outside
    this.editorOverlay.addEventListener('click', (e) => {
      if (e.target === this.editorOverlay) {
        this.close();
      }
    });
  }

  triggerFileInput() {
    this.fileInput.click();
  }

  handleFileSelection(event) {
    const file = event.target.files[0];
    if (file) {
      this.attachFile(file);
    }
    // Reset input to allow selecting the same file again
    this.fileInput.value = '';
  }

  attachFile(file) {
    // Add file to attached files array
    const fileId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    const fileObj = {
      id: fileId,
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    };
    
    this.attachedFiles.push(fileObj);
    this.renderAttachedFiles();
  }

  removeAttachedFile(fileId) {
    this.attachedFiles = this.attachedFiles.filter(file => file.id !== fileId);
    this.renderAttachedFiles();
  }

  renderAttachedFiles() {
    if (this.attachedFiles.length === 0) {
      this.editorFilesContainer.style.display = 'none';
      return;
    }
    
    this.editorFilesContainer.style.display = 'block';
    this.attachedFilesList.innerHTML = '';
    
    this.attachedFiles.forEach(fileObj => {
      const fileElement = document.createElement('div');
      fileElement.className = 'attached-file';
      fileElement.innerHTML = `
        <div class="file-info">
          <i class="fas fa-file"></i>
          <span class="file-name">${fileObj.name}</span>
          <span class="file-size">(${this.formatFileSize(fileObj.size)})</span>
        </div>
        <button class="remove-file-btn" data-file-id="${fileObj.id}">
          <i class="fas fa-times"></i>
        </button>
      `;
      
      this.attachedFilesList.appendChild(fileElement);
      
      // Add event listener to remove button
      const removeBtn = fileElement.querySelector('.remove-file-btn');
      removeBtn.addEventListener('click', () => {
        this.removeAttachedFile(fileObj.id);
      });
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  open(note = null) {
    this.currentNote = note;
    this.attachedFiles = []; // Reset attached files
    
    if (note) {
      this.noteTitle.value = note.title || '';
      this.noteTags.value = (note.tags || []).join(', ');
      this.noteContent.value = note.content || '';
      
      // Load attached files if they exist
      if (note.files && note.files.length > 0) {
        note.files.forEach(fileInfo => {
          // We'll represent existing files differently
          const fileObj = {
            id: fileInfo.id || Date.now() + '-' + Math.random().toString(36).substr(2, 9),
            name: fileInfo.name,
            url: fileInfo.url,
            isExisting: true
          };
          this.attachedFiles.push(fileObj);
        });
        this.renderAttachedFiles();
      }
    } else {
      this.noteTitle.value = '';
      this.noteTags.value = '';
      this.noteContent.value = '';
      this.renderAttachedFiles(); // Will hide the container
    }
    
    this.editorOverlay.classList.add('active');
    this.noteTitle.focus();
  }

  close() {
    this.editorOverlay.classList.remove('active');
    this.currentNote = null;
    this.attachedFiles = [];
  }

  async saveNote() {
    const title = this.noteTitle.value.trim();
    const content = this.noteContent.value.trim();
    const tags = this.parseTags(this.noteTags.value);
    
    if (!title && !content) {
      alert('Note cannot be empty!');
      return;
    }
    
    // Upload files first if there are any
    let fileUrls = [];
    if (this.attachedFiles.length > 0) {
      const uploadResults = await this.uploadAttachedFiles();
      if (!uploadResults.success) {
        alert('Failed to upload files: ' + uploadResults.error);
        return;
      }
      fileUrls = uploadResults.fileUrls;
    }
    
    const noteData = {
      id: this.currentNote ? this.currentNote.id : null,
      title: title || 'Untitled',
      content: content,
      tags: tags,
      files: fileUrls // Include file URLs in note data
    };
    
    const success = await window.NoteHiveApp.saveNote(noteData);
    
    if (success) {
      this.close();
    } else {
      alert('Failed to save note. Please try again.');
    }
  }

  async uploadAttachedFiles() {
    try {
      const fileUrls = [];
      
      // Filter out existing files (they're already uploaded)
      const newFiles = this.attachedFiles.filter(file => !file.isExisting);
      
      // Upload each new file
      for (const fileObj of newFiles) {
        const result = await fileUploadManager.uploadFile(fileObj.file, window.NoteHiveApp.currentUser.id);
        if (result.success) {
          fileUrls.push({
            id: fileObj.id,
            name: fileObj.name,
            url: result.url,
            path: result.path
          });
        } else {
          throw new Error(result.error);
        }
      }
      
      // Include existing files in the result
      const existingFiles = this.attachedFiles
        .filter(file => file.isExisting)
        .map(file => ({
          id: file.id,
          name: file.name,
          url: file.url
        }));
      
      return {
        success: true,
        fileUrls: [...existingFiles, ...fileUrls]
      };
    } catch (error) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  parseTags(tagsString) {
    if (!tagsString.trim()) return [];
    
    return tagsString
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);
  }
}

// Initialize Editor Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.editorManager = new EditorManager();
});