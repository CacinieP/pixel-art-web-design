const NOTES = [261.63, 329.63, 392, 523.25, 392, 329.63, 293.66, 392];

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.beat = 0;
    this.nextNote = 0;
  }

  unlock() {
    if (!this.enabled) return;
    const Ctx = window.AudioContext ?? window.webkitAudioContext;
    if (!Ctx) return;
    if (!this.ctx) {
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") this.ctx.resume();
  }

  setEnabled(enabled) {
    this.enabled = enabled;
    if (this.master) this.master.gain.value = enabled ? 0.5 : 0;
    if (enabled) this.unlock();
  }

  tone(freq, duration, type = "square", volume = 0.08, delay = 0) {
    if (!this.enabled || !this.ctx || this.ctx.state !== "running") return;
    const start = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  effect(name) {
    switch (name) {
      case "pickup":
        this.tone(660, 0.08, "square", 0.06);
        this.tone(880, 0.12, "square", 0.06, 0.07);
        break;
      case "deliver":
        this.tone(523.25, 0.1, "triangle", 0.1);
        this.tone(659.25, 0.1, "triangle", 0.1, 0.09);
        this.tone(783.99, 0.22, "triangle", 0.1, 0.18);
        break;
      case "dash":
        this.tone(220, 0.12, "sawtooth", 0.04);
        break;
      case "hurt":
        this.tone(130.81, 0.2, "square", 0.09);
        this.tone(98, 0.25, "square", 0.07, 0.08);
        break;
      case "portal":
        [392, 523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, 0.18, "triangle", 0.09, i * 0.09));
        break;
      case "win":
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.3, "triangle", 0.1, i * 0.14));
        break;
      case "lose":
        [392, 329.63, 261.63, 196].forEach((f, i) => this.tone(f, 0.3, "triangle", 0.08, i * 0.16));
        break;
      case "ui":
        this.tone(440, 0.05, "square", 0.04);
        break;
    }
  }

  music(now, playing) {
    if (!playing || !this.enabled || !this.ctx || this.ctx.state !== "running") return;
    if (now < this.nextNote) return;
    this.nextNote = now + 0.62;
    const note = NOTES[this.beat % NOTES.length];
    this.tone(note, 0.5, "triangle", 0.018);
    if (this.beat % 4 === 0) this.tone(note / 2, 0.8, "sine", 0.02);
    this.beat += 1;
  }
}