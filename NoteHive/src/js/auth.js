// Authentication Module using Supabase
import { supabase } from './supabase-config.js';

class AuthManager {
  constructor() {
    this.initializeElements();
    this.attachEventListeners();
    this.checkAuthState();
  }

  initializeElements() {
    this.authScreen = document.getElementById('auth-screen');
    this.appScreen = document.getElementById('app-screen');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.loginBtn = document.getElementById('login-btn');
    this.signupBtn = document.getElementById('signup-btn');
    this.googleLoginBtn = document.getElementById('google-login-btn');
    this.logoutBtn = document.getElementById('logout-btn');
    this.authMessage = document.getElementById('auth-message');
    this.userName = document.getElementById('user-name');
    this.userEmail = document.getElementById('user-email');
    this.userAvatar = document.getElementById('user-avatar');
  }

  attachEventListeners() {
    this.loginBtn.addEventListener('click', () => this.login());
    this.signupBtn.addEventListener('click', () => this.signUp());
    this.googleLoginBtn.addEventListener('click', () => this.googleSignIn());
    this.logoutBtn.addEventListener('click', () => this.logout());
  }

  async checkAuthState() {
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    
    if (user) {
      this.handleAuthSuccess(user);
    } else {
      this.showAuthScreen();
    }
    
    // Listen for auth state changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        this.handleAuthSuccess(session.user);
      } else {
        this.showAuthScreen();
      }
    });
  }

  showAuthScreen() {
    this.authScreen.classList.add('active');
    this.appScreen.classList.remove('active');
  }

  showAppScreen() {
    this.authScreen.classList.remove('active');
    this.appScreen.classList.add('active');
  }

  handleAuthSuccess(user) {
    this.showAppScreen();
    this.updateUserProfile(user);
    // Initialize the rest of the app
    window.NoteHiveApp.init(user);
  }

  updateUserProfile(user) {
    this.userName.textContent = user.user_metadata?.name || user.email.split('@')[0];
    this.userEmail.textContent = user.email;
    this.userAvatar.textContent = user.user_metadata?.name ? user.user_metadata.name.charAt(0) : user.email.charAt(0);
  }

  async login() {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;

    if (!email || !password) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      this.showMessage('Login successful!', 'success');
      this.handleAuthSuccess(data.user);
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  async signUp() {
    const email = this.emailInput.value;
    const password = this.passwordInput.value;

    if (!email || !password) {
      this.showMessage('Please fill in all fields', 'error');
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.session) {
        this.showMessage('Account created successfully!', 'success');
        this.handleAuthSuccess(data.user);
      } else {
        this.showMessage('Check your email to confirm your account!', 'success');
        this.showAuthScreen();
      }
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  async googleSignIn() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });

      if (error) throw error;
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      this.showMessage('Logged out successfully', 'success');
      this.showAuthScreen();
    } catch (error) {
      this.showMessage(error.message, 'error');
    }
  }

  showMessage(message, type) {
    this.authMessage.textContent = message;
    this.authMessage.className = `message ${type}`;
    
    // Clear message after 3 seconds
    setTimeout(() => {
      this.authMessage.textContent = '';
      this.authMessage.className = 'message';
    }, 3000);
  }
}

// Initialize Auth Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});