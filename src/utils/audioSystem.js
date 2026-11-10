// Comprehensive Web Audio API Arcade Sound System
// Provides high-fidelity chiptune sound effects & synthesized cheerful birthday background music

class ArcadeAudioSystem {
  constructor() {
    this.ctx = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.masterGain = null;
    this.isMusicPlaying = false;
    this.isMuted = false;
    this.musicVolume = 0.35;
    this.sfxVolume = 0.6;
    this.musicTimer = null;
    this.currentNoteIndex = 0;
    this.melodyOscs = [];
    this.audioElement = null;
    this.customTrackUrl = null;
    this.trackName = null;

    // Upbeat 8-bit "Happy Birthday" melody with arcade bounce
    // Note format: [noteNameOrFreq, durationInSixteenths]
    this.birthdayMelody = [
      ['C4', 3], ['C4', 1], ['D4', 4], ['C4', 4], ['F4', 4], ['E4', 8],
      ['C4', 3], ['C4', 1], ['D4', 4], ['C4', 4], ['G4', 4], ['F4', 8],
      ['C4', 3], ['C4', 1], ['C5', 4], ['A4', 4], ['F4', 4], ['E4', 4], ['D4', 8],
      ['Bb4', 3], ['Bb4', 1], ['A4', 4], ['F4', 4], ['G4', 4], ['F4', 12]
    ];

    this.bassLine = [
      ['F3', 4], ['A3', 4], ['C4', 4], ['A3', 4],
      ['C3', 4], ['E3', 4], ['G3', 4], ['E3', 4],
      ['C3', 4], ['E3', 4], ['G3', 4], ['E3', 4],
      ['F3', 4], ['A3', 4], ['C4', 4], ['F3', 4]
    ];

    this.noteFreqs = {
      'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'Bb3': 233.08, 'B3': 246.94,
      'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'Bb4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'Bb5': 932.33, 'C6': 1046.50
    };
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.muted = this.isMuted;
      if (!this.isMuted && this.isMusicPlaying && this.audioElement.paused) {
        this.audioElement.play().catch(() => { });
      }
    }
    return this.isMuted;
  }

  setMusicVolume(vol) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
    if (this.audioElement) {
      this.audioElement.volume = this.isMuted ? 0 : this.musicVolume;
    }
  }

  setSfxVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  // Set and play a custom MP3/audio track
  setCustomMusic(urlOrBlob, name = '') {
    this.customTrackUrl = urlOrBlob;
    this.trackName = name;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement = null;
      } catch (e) { }
    }
    if (this.isMusicPlaying) {
      this.stopMusic();
      this.startMusic();
    }
  }

  // Background music player
  startMusic() {
    this.init();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Prioritize custom track, then /assets/bgm.mp3
    const targetSrc = this.customTrackUrl || '/assets/bgm.mp3';

    try {
      if (!this.audioElement || (this.audioElement.src && !this.audioElement.src.includes(targetSrc))) {
        if (this.audioElement) {
          try { this.audioElement.pause(); } catch (e) { }
        }
        this.audioElement = new Audio(targetSrc);
        this.audioElement.volume = this.isMuted ? 0 : this.musicVolume;
        this.audioElement.muted = this.isMuted;

        const isBgmTrack = targetSrc.includes('bgm.mp3');
        // If official bgm.mp3: loop seamlessly from "Happy Birthday" singing line (15.35s to 33.36s)
        if (isBgmTrack) {
          this.audioElement.loop = false; // Managed via loop points
          const HAPPY_BIRTHDAY_LINE_START = 15.35; // Monkeys start singing "Happy Birthday to you"
          const HAPPY_BIRTHDAY_LINE_END = 33.35;   // Song finishes before silent outro

          this.audioElement.addEventListener('timeupdate', () => {
            if (this.audioElement && this.audioElement.currentTime >= HAPPY_BIRTHDAY_LINE_END) {
              // After the song finishes for the first time, loop continuously from the Happy Birthday line!
              this.audioElement.currentTime = HAPPY_BIRTHDAY_LINE_START;
              if (this.isMusicPlaying && !this.isMuted && this.audioElement.paused) {
                this.audioElement.play().catch(() => { });
              }
            }
          });

          this.audioElement.addEventListener('ended', () => {
            if (this.audioElement) {
              this.audioElement.currentTime = HAPPY_BIRTHDAY_LINE_START;
              if (this.isMusicPlaying && !this.isMuted) {
                this.audioElement.play().catch(() => { });
              }
            }
          });
        } else {
          this.audioElement.loop = true;
        }

        this.audioElement.addEventListener('error', (err) => {
          console.warn('BGM file failed to load, falling back to procedural chiptune:', err);
          this.audioElement = null;
          if (this.isMusicPlaying) {
            this.playMelodyLoop();
          }
        });
      }

      this.audioElement.muted = this.isMuted;
      this.audioElement.volume = this.isMuted ? 0 : this.musicVolume;

      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          // If browser blocked autoplay before user click, don't destroy audioElement!
          console.warn('BGM autoplay waiting for user interaction:', err);
        });
      }
    } catch (e) {
      console.warn('Audio element error:', e);
      this.audioElement = null;
      this.playMelodyLoop();
    }
  }

  stopMusic() {
    this.isMusicPlaying = false;
    if (this.audioElement) {
      try {
        this.audioElement.pause();
        this.audioElement.currentTime = 0;
      } catch (e) { }
    }
    if (this.musicTimer) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
    this.melodyOscs.forEach(o => {
      try { o.stop(); } catch (e) { }
    });
    this.melodyOscs = [];
  }

  playMelodyLoop() {
    if (!this.isMusicPlaying || !this.ctx) return;
    const tempo = 136; // cheerful lively bpm
    const beatSec = 60 / tempo;
    const sixteenthSec = beatSec / 4;

    let totalDuration = 0;
    const startTime = this.ctx.currentTime + 0.05;

    // Schedule melody
    let curTime = startTime;
    this.birthdayMelody.forEach(([note, dur]) => {
      const duration = dur * sixteenthSec;
      const freq = this.noteFreqs[note] || 440;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, curTime);

      gain.gain.setValueAtTime(0.09, curTime);
      gain.gain.exponentialRampToValueAtTime(0.001, curTime + duration * 0.88);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(curTime);
      osc.stop(curTime + duration * 0.95);

      this.melodyOscs.push(osc);
      curTime += duration;
    });

    totalDuration = curTime - startTime;

    // Bassline accompaniment
    let bassTime = startTime;
    let bIdx = 0;
    while (bassTime < curTime) {
      const [bNote, bDur] = this.bassLine[bIdx % this.bassLine.length];
      const duration = bDur * sixteenthSec;
      const bFreq = this.noteFreqs[bNote] || 130;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(bFreq, bassTime);

      gain.gain.setValueAtTime(0.12, bassTime);
      gain.gain.exponentialRampToValueAtTime(0.005, bassTime + duration * 0.8);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(bassTime);
      osc.stop(bassTime + duration * 0.9);
      this.melodyOscs.push(osc);

      bassTime += duration;
      bIdx++;
    }

    // Schedule next loop
    this.musicTimer = setTimeout(() => {
      this.melodyOscs = [];
      if (this.isMusicPlaying) {
        this.playMelodyLoop();
      }
    }, totalDuration * 1000);
  }

  // SFX: UI Click
  playClick() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.06);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // SFX: Scanner Beep (Level 1)
  playScanBeep() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 400, now);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // SFX: Laser scanning whoosh
  playLaser() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.25);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // SFX: Collision / Obstacle Bonk
  playCollision() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  // SFX: Satellite Thruster
  playThruster() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(350, now + 0.08);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  // SFX: Car Parking Horn / Ding
  playCarHonk() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    // Two quick cheerful beeps
    [0, 0.12].forEach(offset => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, now + offset);

      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + offset);
      osc.stop(now + offset + 0.08);
    });
  }

  // SFX: Item Pickup (Stars, Gifts, Cakes)
  playPickup() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.1);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // SFX: Power-Up Activated (Sunscreen Shield, Turbo, Magnet)
  playPowerUp() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [330, 440, 554, 660, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.22, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.12);
    });
  }

  // SFX: Scooter Horn
  playScooterHorn() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    [0, 0.1].forEach(offset => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(587.33, now + offset);

      gain.gain.setValueAtTime(0.2, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.01, now + offset + 0.08);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + offset);
      osc.stop(now + offset + 0.08);
    });
  }

  // SFX: Satellite Touchdown / Landing Success
  playLandingSuccess() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.25, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.07 + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.15);
    });
  }

  // SFX: Level Complete Chime
  playLevelComplete() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const notes = [392, 523.25, 659.25, 783.99, 1046.50]; // C major fanfare
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.22, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.09 + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.3);
    });
  }

  // SFX: Grand Birthday Fanfare
  playCelebrationFanfare() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const chords = [
      { notes: [523.25, 659.25, 783.99], time: 0, dur: 0.2 },
      { notes: [523.25, 659.25, 783.99], time: 0.22, dur: 0.2 },
      { notes: [523.25, 659.25, 783.99], time: 0.44, dur: 0.2 },
      { notes: [587.33, 739.99, 880.00], time: 0.68, dur: 0.4 },
      { notes: [659.25, 783.99, 1046.50], time: 1.12, dur: 0.7 }
    ];

    chords.forEach(({ notes, time, dur }) => {
      notes.forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now + time);

        gain.gain.setValueAtTime(0.18, now + time);
        gain.gain.exponentialRampToValueAtTime(0.01, now + time + dur);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now + time);
        osc.stop(now + time + dur);
      });
    });
  }
}

export const audioSystem = new ArcadeAudioSystem();

