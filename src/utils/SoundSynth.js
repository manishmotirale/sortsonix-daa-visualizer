// ==========================================
// SOUND SYNTHESIZER (WEB AUDIO API)
// ==========================================
class SoundSynth {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.muted = false;
    this.volume = 0.2;
    this.scale = 'pentatonic';
  }

  init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(vol) {
    this.volume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : vol, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.muted;
  }

  freqForValue(val, maxVal) {
    const ratio = Math.max(0, Math.min(1, (val - 1) / (maxVal || 1)));
    if (this.scale === 'chromatic') {
      const semitone = Math.floor(ratio * 40);
      return 130.81 * Math.pow(2, semitone / 12);
    }
    // Pentatonic scale
    const pentatonic = [0, 2, 4, 7, 9];
    const noteIdx = Math.floor(ratio * 35);
    const octave = Math.floor(noteIdx / 5);
    const pitch = octave * 12 + pentatonic[noteIdx % 5];
    return 130.81 * Math.pow(2, pitch / 12);
  }

  playTone(val, maxVal, family = 'elementary', durationMs = 50) {
    if (this.muted) return;
    this.init();
    if (!this.ctx || !this.masterGain) return;

    try {
      const now = this.ctx.currentTime;
      const freq = this.freqForValue(val, maxVal);
      const dur = Math.max(0.02, durationMs / 1000);

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      switch (family) {
        case 'divide': {
          osc.type = 'sawtooth';
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(this.volume * 0.75, now + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
          break;
        }
        case 'noncomp': {
          osc.type = 'square';
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(this.volume * 0.45, now + 0.003);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + dur * 0.8);
          break;
        }
        case 'exotic': {
          osc.type = 'sine';
          const mod = this.ctx.createOscillator();
          const modGain = this.ctx.createGain();
          mod.frequency.setValueAtTime(freq * 1.5, now);
          modGain.gain.setValueAtTime(freq * 0.25, now);
          mod.connect(modGain);
          modGain.connect(osc.frequency);
          mod.start(now);
          mod.stop(now + dur);
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(this.volume * 0.8, now + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
          break;
        }
        case 'elementary':
        default: {
          osc.type = 'triangle';
          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(this.volume, now + 0.006);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + dur);
          break;
        }
      }

      osc.frequency.setValueAtTime(freq, now);
      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + dur * 1.2);
    } catch {
      // Audio playback safety catch
    }
  }
}

export const synth = new SoundSynth();
