class NotificationSoundService {
  constructor() {
    this.audioContext = null;
    this.isMuted = this.getMuteState();
    this.initializeAudio();
  }

  initializeAudio() {
    try {
      // Create audio context for better browser compatibility
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  getMuteState() {
    const stored = localStorage.getItem('notificationSoundMuted');
    return stored === 'true';
  }

  setMuteState(isMuted) {
    this.isMuted = isMuted;
    localStorage.setItem('notificationSoundMuted', isMuted.toString());
  }

  toggleMute() {
    this.setMuteState(!this.isMuted);
    return this.isMuted;
  }

  playNotificationSound() {
    if (this.isMuted) {
      return;
    }

    try {
      // Create a simple notification sound using Web Audio API
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      if (this.audioContext) {
        this.createBeepSound();
      } else {
        // Fallback to HTML5 Audio if Web Audio API is not available
        this.playFallbackSound();
      }
    } catch (error) {
      console.warn('Failed to play notification sound:', error);
    }
  }

  createBeepSound() {
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    // Create a pleasant notification sound
    oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.2);

    gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.3);
  }

  playFallbackSound() {
    // Create a simple beep using HTML5 Audio
    const audio = new Audio();
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  isMutedState() {
    return this.isMuted;
  }
}

// Create a singleton instance
const notificationSoundService = new NotificationSoundService();

export default notificationSoundService;
