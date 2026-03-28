// Theme Management Module
class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById('theme-toggle');
    this.currentTheme = this.getStoredTheme() || 'light';
    this.initializeTheme();
    this.attachEventListeners();
  }

  initializeTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.themeToggle.checked = this.currentTheme === 'dark';
  }

  attachEventListeners() {
    this.themeToggle.addEventListener('change', () => {
      this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.setTheme(this.currentTheme);
    });
  }

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.storeTheme(theme);
  }

  storeTheme(theme) {
    localStorage.setItem('notehive-theme', theme);
  }

  getStoredTheme() {
    return localStorage.getItem('notehive-theme');
  }
}

// Initialize Theme Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.themeManager = new ThemeManager();
});