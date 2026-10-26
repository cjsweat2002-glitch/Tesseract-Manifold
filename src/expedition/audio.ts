/** Audio is created only after a user gesture, and is optional throughout. */
export class ExpeditionAudio {
  private context?: AudioContext;
  private master?: GainNode;
  private drone?: OscillatorNode;
  async start(muted: boolean) {
    try {
      if (!this.context) {
        this.context = new AudioContext();
        this.master = this.context.createGain();
        this.master.connect(this.context.destination);
        this.drone = this.context.createOscillator();
        this.drone.type = 'sine';
        this.drone.frequency.value = 55;
        const gain = this.context.createGain();
        gain.gain.value = 0.12;
        this.drone.connect(gain);
        gain.connect(this.master);
        this.drone.start();
      }
      this.mute(muted);
      await this.context.resume();
    } catch {
      /* The expedition remains playable when audio is unavailable. */
    }
  }
  mute(muted: boolean) {
    if (this.context && this.master)
      this.master.gain.setTargetAtTime(
        muted ? 0 : 0.2,
        this.context.currentTime,
        0.08,
      );
  }
  cue(kind: 'fold' | 'memory' | 'tether' | 'danger') {
    const ctx = this.context;
    if (!ctx || !this.master || ctx.state !== 'running') return;
    const notes =
      kind === 'memory'
        ? [220, 330, 440, 554.37]
        : kind === 'danger'
          ? [65.4, 69.3]
          : kind === 'fold'
            ? [110, 164.81]
            : [330];
    notes.forEach((frequency, i) => {
      const oscillator = ctx.createOscillator(),
        gain = ctx.createGain();
      const at = ctx.currentTime + i * 0.08;
      oscillator.frequency.setValueAtTime(frequency, at);
      oscillator.type = 'sine';
      gain.gain.setValueAtTime(0, at);
      gain.gain.linearRampToValueAtTime(0.3, at + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, at + 1.3);
      oscillator.connect(gain);
      gain.connect(this.master!);
      oscillator.start(at);
      oscillator.stop(at + 1.4);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    });
  }
  pause() {
    void this.context?.suspend().catch(() => {});
  }
  dispose() {
    this.drone?.stop();
    void this.context?.close().catch(() => {});
  }
}
