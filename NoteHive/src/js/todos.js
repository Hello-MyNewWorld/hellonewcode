// Todos Module using Supabase
import { supabase } from './supabase-config.js';

class TodosManager {
  constructor() {
    this.todos = [];
    this.currentUser = null;
    this.initializeElements();
    this.attachEventListeners();
  }

  initializeElements() {
    this.todosContainer = document.getElementById('todos-container');
    this.addTodoBtn = document.getElementById('add-todo-btn');
  }

  attachEventListeners() {
    this.addTodoBtn.addEventListener('click', () => this.addTodo());
  }

  setCurrentUser(user) {
    this.currentUser = user;
  }

  async loadTodos() {
    if (!this.currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', this.currentUser.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      this.todos = data || [];
      this.renderTodos();
    } catch (error) {
      console.error('Error loading todos:', error);
    }
  }

  renderTodos() {
    if (this.todos.length === 0) {
      this.todosContainer.innerHTML = `
        <div class="empty-state">
          <p>No todos yet. Add your first task!</p>
        </div>
      `;
      return;
    }
    
    this.todosContainer.innerHTML = '';
    
    this.todos.forEach(todo => {
      const todoElement = this.createTodoElement(todo);
      this.todosContainer.appendChild(todoElement);
    });
  }

  createTodoElement(todo) {
    const div = document.createElement('div');
    div.className = 'todo-item';
    div.dataset.id = todo.id;
    
    div.innerHTML = `
      <input type="checkbox" class="todo-checkbox" ${todo.completed ? 'checked' : ''}>
      <div class="todo-text ${todo.completed ? 'completed' : ''}">${todo.text}</div>
      <div class="todo-actions">
        <button class="delete-todo"><i class="fas fa-trash"></i></button>
      </div>
    `;
    
    const checkbox = div.querySelector('.todo-checkbox');
    const deleteBtn = div.querySelector('.delete-todo');
    const textElement = div.querySelector('.todo-text');
    
    checkbox.addEventListener('change', () => this.toggleTodo(todo.id, checkbox.checked, textElement));
    deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
    
    return div;
  }

  async addTodo() {
    if (!this.currentUser) return;
    
    const text = prompt('Enter todo text:');
    if (!text) return;
    
    try {
      const { data, error } = await supabase
        .from('todos')
        .insert([
          {
            user_id: this.currentUser.id,
            text: text,
            completed: false,
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      this.loadTodos();
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  }

  async toggleTodo(todoId, completed, textElement) {
    try {
      const { data, error } = await supabase
        .from('todos')
        .update({ completed: completed })
        .eq('id', todoId)
        .select()
        .single();
      
      if (error) throw error;
      
      textElement.classList.toggle('completed', completed);
      
      // Update local state
      const todo = this.todos.find(t => t.id === todoId);
      if (todo) {
        todo.completed = completed;
      }
    } catch (error) {
      console.error('Error toggling todo:', error);
    }
  }

  async deleteTodo(todoId) {
    if (!confirm('Are you sure you want to delete this todo?')) return;
    
    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', todoId);
      
      if (error) throw error;
      
      this.loadTodos();
    } catch (error) {
      console.error('Error deleting todo:', error);
    }
  }
}

// Initialize Todos Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.todosManager = new TodosManager();
});