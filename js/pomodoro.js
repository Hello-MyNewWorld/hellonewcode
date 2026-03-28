// Pomodoro Timer Module
class PomodoroTimer {
  constructor() {
    this.timerDisplay = document.getElementById('pomodoro-display');
    this.startBtn = document.getElementById('start-timer-btn');
    this.pauseBtn = document.getElementById('pause-timer-btn');
    this.resetBtn = document.getElementById('reset-timer-btn');
    
    this.initialTime = 25 * 60; // 25 minutes in seconds
    this.currentTime = this.initialTime;
    this.timerInterval = null;
    this.isRunning = false;
    
    this.attachEventListeners();
    this.updateDisplay();
  }

  attachEventListeners() {
    this.startBtn.addEventListener('click', () => this.start());
    this.pauseBtn.addEventListener('click', () => this.pause());
    this.resetBtn.addEventListener('click', () => this.reset());
  }

  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.timerInterval = setInterval(() => {
      this.currentTime--;
      this.updateDisplay();
      
      if (this.currentTime <= 0) {
        this.finish();
      }
    }, 1000);
  }

  pause() {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    clearInterval(this.timerInterval);
  }

  reset() {
    this.pause();
    this.currentTime = this.initialTime;
    this.updateDisplay();
  }

  finish() {
    this.pause();
    this.currentTime = this.initialTime;
    this.updateDisplay();
    
    // Play sound or notification
    alert('Pomodoro completed! Take a break.');
  }

  updateDisplay() {
    const minutes = Math.floor(this.currentTime / 60);
    const seconds = this.currentTime % 60;
    this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
}

// Initialize Pomodoro Timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pomodoroTimer = new PomodoroTimer();
});