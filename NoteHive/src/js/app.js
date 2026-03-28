// Main Application Module using Supabase
import { supabase } from './supabase-config.js';

class NoteHiveApp {
  constructor(user) {
    this.notes = [];
    this.filteredNotes = [];
    this.tags = new Set();
    this.currentView = 'notes';
    this.currentUser = user;
    
    this.initializeElements();
    this.attachEventListeners();
  }

  static init(user) {
    if (!window.NoteHiveApp) {
      window.NoteHiveApp = new NoteHiveApp(user);
    } else {
      window.NoteHiveApp.currentUser = user;
      window.NoteHiveApp.loadNotes();
    }
  }

  initializeElements() {
    // Navigation elements
    this.navItems = document.querySelectorAll('.nav-item');
    this.views = document.querySelectorAll('.view');
    
    // Note elements
    this.notesGrid = document.getElementById('notes-grid');
    this.newNoteBtn = document.getElementById('new-note-btn');
    this.sortNotesSelect = document.getElementById('sort-notes');
    
    // Search elements
    this.searchInput = document.getElementById('search-input');
    
    // Tags elements
    this.tagsList = document.getElementById('tags-list');
  }

  attachEventListeners() {
    // Navigation
    this.navItems.forEach(item => {
      item.addEventListener('click', (e) => this.switchView(e.currentTarget.dataset.view));
    });
    
    // Note actions
    this.newNoteBtn.addEventListener('click', () => this.openEditor());
    this.sortNotesSelect.addEventListener('change', () => this.renderNotes());
    
    // Search
    this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    
    // Initialize data
    this.loadNotes();
  }

  switchView(viewName) {
    // Update navigation
    this.navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Show selected view
    this.views.forEach(view => {
      view.classList.toggle('active', view.id === `${viewName}-view`);
    });
    
    this.currentView = viewName;
    
    // Load data for the view if needed
    if (viewName === 'notes') {
      this.renderNotes();
    } else if (viewName === 'todos') {
      window.todosManager.loadTodos();
    } else if (viewName === 'stats') {
      window.statsManager.loadStats();
    }
  }

  async loadNotes() {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('modified_at', { ascending: false });
      
      if (error) throw error;
      
      this.notes = data || [];
      this.tags.clear();
      
      // Collect tags
      this.notes.forEach(note => {
        if (note.tags) {
          note.tags.forEach(tag => this.tags.add(tag));
        }
      });
      
      this.filteredNotes = [...this.notes];
      this.renderNotes();
      this.renderTags();
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  }

  renderNotes() {
    const sortBy = this.sortNotesSelect.value;
    let sortedNotes = [...this.filteredNotes];
    
    // Sort notes based on selection
    switch (sortBy) {
      case 'created':
        sortedNotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'title':
        sortedNotes.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'modified':
      default:
        sortedNotes.sort((a, b) => new Date(b.modified_at) - new Date(a.modified_at));
        break;
    }
    
    this.notesGrid.innerHTML = '';
    
    if (sortedNotes.length === 0) {
      this.notesGrid.innerHTML = `
        <div class="empty-state">
          <p>No notes found. Create your first note!</p>
          <button id="create-first-note" class="btn primary">Create Note</button>
        </div>
      `;
      document.getElementById('create-first-note').addEventListener('click', () => this.openEditor());
      return;
    }
    
    sortedNotes.forEach(note => {
      const noteElement = this.createNoteCard(note);
      this.notesGrid.appendChild(noteElement);
    });
  }

  createNoteCard(note) {
    const card = document.createElement('div');
    card.className = 'note-card';
    card.dataset.id = note.id;
    
    // Format date
    const date = new Date(note.modified_at);
    const dateString = date.toLocaleDateString();
    
    // Truncate content
    const contentPreview = note.content.length > 100 ? 
      note.content.substring(0, 100) + '...' : 
      note.content;
    
    // Check if note has files
    const hasFiles = note.files && note.files.length > 0;
    const filesIndicator = hasFiles ? 
      `<div class="note-card-files"><i class="fas fa-paperclip"></i> ${note.files.length} file(s)</div>` : 
      '';
    
    card.innerHTML = `
      <div class="note-card-header">
        <div class="note-card-title">${note.title || 'Untitled'}</div>
        <div class="note-card-date">${dateString}</div>
      </div>
      <div class="note-card-content">${contentPreview}</div>
      ${filesIndicator}
      <div class="note-card-tags">
        ${(note.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
      </div>
    `;
    
    card.addEventListener('click', () => this.openEditor(note));
    return card;
  }

  renderTags() {
    this.tagsList.innerHTML = '';
    
    Array.from(this.tags).forEach(tag => {
      const tagElement = document.createElement('span');
      tagElement.className = 'tag';
      tagElement.textContent = tag;
      tagElement.addEventListener('click', () => {
        this.searchInput.value = `#${tag}`;
        this.handleSearch(`#${tag}`);
      });
      this.tagsList.appendChild(tagElement);
    });
  }

  handleSearch(query) {
    if (!query) {
      this.filteredNotes = [...this.notes];
    } else {
      const isTagSearch = query.startsWith('#');
      const searchTerm = isTagSearch ? query.substring(1) : query.toLowerCase();
      
      this.filteredNotes = this.notes.filter(note => {
        if (isTagSearch) {
          return note.tags && note.tags.includes(searchTerm);
        } else {
          return (note.title && note.title.toLowerCase().includes(searchTerm)) || 
                 (note.content && note.content.toLowerCase().includes(searchTerm));
        }
      });
    }
    
    this.renderNotes();
  }

  openEditor(note = null) {
    window.editorManager.open(note);
  }

  async saveNote(noteData) {
    try {
      const notePayload = {
        title: noteData.title,
        content: noteData.content,
        tags: noteData.tags || [],
        files: noteData.files || [],
        user_id: this.currentUser.id,
        modified_at: new Date().toISOString()
      };
      
      let result;
      
      if (noteData.id) {
        // Update existing note
        result = await supabase
          .from('notes')
          .update(notePayload)
          .eq('id', noteData.id)
          .select()
          .single();
      } else {
        // Create new note
        notePayload.created_at = new Date().toISOString();
        result = await supabase
          .from('notes')
          .insert([notePayload])
          .select()
          .single();
      }
      
      if (result.error) throw result.error;
      
      // Reload notes
      this.loadNotes();
      return true;
    } catch (error) {
      console.error('Error saving note:', error);
      return false;
    }
  }

  async deleteNote(noteId) {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);
      
      if (error) throw error;
      
      this.loadNotes();
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // NoteHiveApp will be initialized by AuthManager after successful login
});