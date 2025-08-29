// js/audio.js — гучніший і сумісний з iOS/Chrome
class ClockAudio {
  constructor(){ this.ctx=null; this.enabled=false; this.mode='tick'; }
  ensure(){
    if(!this.ctx) this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    if(this.ctx.state === 'suspended') this.ctx.resume();
  }
  setMode(m){ this.mode = m; }
  toggle(on){
    this.enabled = (on===undefined) ? !this.enabled : on;
    if(this.enabled) this.ensure();
    return this.enabled;
  }
  play(){
    if(!this.enabled) return;
    this.ensure();
    const ctx = this.ctx;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();

    const isBeep = this.mode === 'beep';
    osc.type = isBeep ? 'square' : 'sine';
    osc.frequency.value = isBeep ? 880 : 480;

    // Гучність/енвелоп: чіткий короткий клік ~90 мс
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.06,  ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.00001,ctx.currentTime + 0.09);

    osc.connect(g).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.095);
  }
}
window.ClockAudio = ClockAudio;
