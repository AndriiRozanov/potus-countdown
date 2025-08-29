class ClockAudio{
  constructor(){ this.ctx=null; this.enabled=false; this.mode='tick'; }
  ensure(){ if(!this.ctx) this.ctx=new (window.AudioContext||window.webkitAudioContext)(); }
  setMode(m){ this.mode=m; }
  toggle(on){ this.enabled=(on===undefined)?!this.enabled:on; if(this.enabled) this.ensure(); return this.enabled; }
  playTick(){
    if(!this.enabled) return;
    this.ensure();
    const o=this.ctx.createOscillator(), g=this.ctx.createGain();
    o.type='square'; o.frequency.value=(this.mode==='beep')?880:220;
    g.gain.value=0.001; g.gain.exponentialRampToValueAtTime(0.00001,this.ctx.currentTime+0.08);
    o.connect(g).connect(this.ctx.destination); o.start(); o.stop(this.ctx.currentTime+0.08);
  }
}
window.ClockAudio=ClockAudio;
