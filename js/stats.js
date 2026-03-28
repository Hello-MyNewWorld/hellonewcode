// Statistics Module using Supabase
import { supabase } from './supabase-config.js';

class StatsManager {
  constructor() {
    this.chart = null;
    this.currentUser = null;
    this.initializeElements();
  }

  initializeElements() {
    this.totalNotesEl = document.getElementById('total-notes');
    this.totalTodosEl = document.getElementById('total-todos');
    this.completedTodosEl = document.getElementById('completed-todos');
    this.mostUsedTagEl = document.getElementById('most-used-tag');
    this.chartCtx = document.getElementById('notes-chart');
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  async loadStats() {
    await this.loadNoteStats();
    await this.loadTodoStats();
    await this.loadTagStats();
    this.renderChart();
  }

  async loadNoteStats() {
    if (!this.currentUser) return;
    
    try {
      const { count, error } = await supabase
        .from('notes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', this.currentUser.id);
      
      if (error) throw error;
      
      this.totalNotesEl.textContent = count || 0;
    } catch (error) {
      console.error('Error loading note stats:', error);
    }
  }

  async loadTodoStats() {
    if (!this.currentUser) return;
    
    try {
      const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', this.currentUser.id);
      
      if (error) throw error;
      
      const totalCount = todos?.length || 0;
      const completedCount = todos?.filter(todo => todo.completed)?.length || 0;
      
      this.totalTodosEl.textContent = totalCount;
      this.completedTodosEl.textContent = completedCount;
    } catch (error) {
      console.error('Error loading todo stats:', error);
    }
  }

  async loadTagStats() {
    if (!this.currentUser) return;
    
    try {
      const { data: notes, error } = await supabase
        .from('notes')
        .select('tags')
        .eq('user_id', this.currentUser.id);
      
      if (error) throw error;
      
      // Count tag frequency
      const tagCounts = {};
      
      notes?.forEach(note => {
        const tags = note.tags || [];
        tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      
      // Find most used tag
      let mostUsedTag = 'None';
      let maxCount = 0;
      
      for (const [tag, count] of Object.entries(tagCounts)) {
        if (count > maxCount) {
          mostUsedTag = tag;
          maxCount = count;
        }
      }
      
      this.mostUsedTagEl.textContent = mostUsedTag;
    } catch (error) {
      console.error('Error loading tag stats:', error);
    }
  }

  renderChart() {
    // Destroy existing chart if it exists
    if (this.chart) {
      this.chart.destroy();
    }
    
    const ctx = this.chartCtx.getContext('2d');
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Notes Created',
          data: [12, 19, 3, 5, 2, 3],
          borderColor: '#ff9800',
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}

// Initialize Stats Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.statsManager = new StatsManager();
});
