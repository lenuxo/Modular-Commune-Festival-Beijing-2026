import {copyPhrase, FEELINGS, makePhrase, PHRASE_STEPS} from './model'
import type {Feeling, Note, Phrase} from './model'
import {presetEvents} from './presets'

export type Session = {phrase: Phrase | null; previous: Phrase | null; feeling: Feeling; muted: boolean}
export type AudioSnapshot = {playing: boolean; step: number; pulse: number; energy: number; space: number; feeling: Feeling; pending: Feeling | null; hasPhrase: boolean; canUndo: boolean}

/** Small look-ahead sequencer. AudioContext is created only in a user gesture. */
export class ThumbAudio {
  private context: AudioContext | null = null
  private master: GainNode | null = null
  private bus: GainNode | null = null
  private delaySend: GainNode | null = null
  private delay: DelayNode | null = null
  private noise: AudioBuffer | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private nextTime = 0
  private step = 0
  private revision = 0
  private active = false
  private holding = false
  private lead: Note | null = null
  private take: Phrase = []
  private phrase: Phrase | null
  private previous: Phrase | null
  private replacement: Phrase | null = null
  private undoPending = false
  private feeling: Feeling
  private pending: Feeling | null = null
  private muted: boolean
  private disposed = false
  private voices = new Set<AudioScheduledSourceNode>()
  private events: {time: number; step: number; energy: number; space: number}[] = []
  constructor(session?: Session) {
    this.phrase = copyPhrase(session?.phrase ?? null)
    this.previous = copyPhrase(session?.previous ?? null)
    this.feeling = session?.feeling ?? 'bounce'
    this.muted = session?.muted ?? false
  }
  get session(): Session {return {phrase: copyPhrase(this.phrase), previous: copyPhrase(this.previous), feeling: this.feeling, muted: this.muted}}
  get snapshot(): AudioSnapshot {
    const now = this.context?.currentTime ?? 0
    while (this.events.length > 1 && this.events[1].time <= now) this.events.shift()
    const event = this.events[0]
    return {playing: this.active, step: event?.step ?? 0, pulse: this.active && event ? Math.exp(-Math.max(0, now - event.time) * 13) : 0,
      energy: this.holding ? this.lead?.energy ?? .2 : event?.energy ?? .2,
      space: this.holding ? this.lead?.space ?? .3 : event?.space ?? .3,
      feeling: this.feeling, pending: this.pending, hasPhrase: !!this.phrase || !!this.replacement, canUndo: !!this.previous}
  }
  private setup() {
    if (this.context) return
    const Context = window.AudioContext ?? (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext
    if (!Context) throw new Error('当前浏览器暂时不能播放，请换个浏览器试试。')
    const ctx = this.context = new Context({latencyHint: 'interactive'})
    const compressor = ctx.createDynamicsCompressor()
    compressor.threshold.value = -19; compressor.knee.value = 12; compressor.ratio.value = 5
    compressor.attack.value = .005; compressor.release.value = .18
    const master = this.master = ctx.createGain(); master.gain.value = 0
    const bus = this.bus = ctx.createGain(); bus.gain.value = .7
    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -4; limiter.knee.value = 0; limiter.ratio.value = 20
    limiter.attack.value = 0; limiter.release.value = .06
    bus.connect(compressor); compressor.connect(limiter); limiter.connect(master); master.connect(ctx.destination)
    const send = this.delaySend = ctx.createGain(); send.gain.value = .16
    const delay = this.delay = ctx.createDelay(2); delay.delayTime.value = 60 / this.bpm * .75
    const feedback = ctx.createGain(); feedback.gain.value = .25
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2600
    send.connect(delay); delay.connect(filter); filter.connect(bus); filter.connect(feedback); feedback.connect(delay)
    this.noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const data = this.noise.getChannelData(0)
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    ctx.onstatechange = () => {
      if (ctx.state !== 'running' && this.active) this.stop()
    }
  }
  private get bpm() {return FEELINGS.find(f => f.id === this.feeling)!.bpm}
  async start() {
    if (this.disposed) return
    this.setup()
    const revision = ++this.revision
    await this.context!.resume()
    if (this.disposed || revision !== this.revision) return
    if (this.context!.state !== 'running') throw new Error('声音还没启动，点一下「开始」再试试。')
    if (this.active) return
    this.active = true; this.step = 0; this.events = []
    this.nextTime = this.context!.currentTime + .035
    this.master!.gain.setTargetAtTime(this.muted ? 0 : .76, this.context!.currentTime, .02)
    this.schedule()
    this.timer = setInterval(() => this.schedule(), 25)
  }
  begin(note: Note) {
    if (this.holding) return
    // A pending take remains undoable when a new gesture starts before the boundary.
    if (this.replacement) this.commitReplacement()
    this.holding = true; this.lead = note; this.take = [{...note}]
  }
  update(note: Note | null) {this.lead = note}
  release() {
    if (!this.holding) return
    this.holding = false; this.lead = null
    if (this.take.some(Boolean)) this.replacement = makePhrase(this.take)
    this.take = []
  }
  cancel() {this.holding = false; this.lead = null; this.take = []}
  private commitReplacement() {
    if (!this.replacement) return
    this.previous = copyPhrase(this.phrase); this.phrase = this.replacement; this.replacement = null
  }
  setFeeling(feeling: Feeling) {
    if (this.active) this.pending = feeling === this.feeling ? null : feeling
    else {this.feeling = feeling; this.pending = null}
  }
  setMuted(muted: boolean) {
    this.muted = muted
    if (this.context && this.master) this.master.gain.setTargetAtTime(this.active && !muted ? .76 : 0, this.context.currentTime, .02)
  }
  undo() {
    if (!this.previous) return
    if (this.active) this.undoPending = true
    else {this.phrase = this.previous; this.previous = null; this.replacement = null}
  }
  stop() {
    ++this.revision; this.cancel(); this.commitReplacement()
    if (this.pending) {this.feeling = this.pending; this.pending = null}
    this.active = false
    this.undoPending = false
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    if (this.context && this.master) {
      this.master.gain.cancelScheduledValues(this.context.currentTime)
      this.master.gain.setTargetAtTime(0, this.context.currentTime, .012)
      for (const voice of this.voices) {try {voice.stop(this.context.currentTime + .05)} catch {/* already ended */}}
      // Suspend after a short release; a subsequent start invalidates this operation.
      const revision = this.revision
      setTimeout(() => {if (!this.disposed && revision === this.revision && !this.active) void this.context?.suspend().catch(() => {})}, 90)
    }
  }
  dispose() {
    this.stop(); this.disposed = true
    if (this.context) {this.context.onstatechange = null; void this.context.close().catch(() => {})}
    this.voices.clear()
  }
  private schedule() {
    const ctx = this.context
    if (!ctx || !this.active) return
    if (this.nextTime < ctx.currentTime - .05) this.nextTime = ctx.currentTime + .015
    while (this.nextTime < ctx.currentTime + .09) {
      // The first tiny phrase answers immediately on the next grid tick.
      if (!this.holding && !this.phrase && this.replacement) {this.commitReplacement(); this.step = 0}
      const step = this.step % PHRASE_STEPS
      // Style changes remain responsive at the next bar, while takes replace at eight-bar boundaries.
      if (step % 16 === 0 && this.pending) {this.feeling = this.pending; this.pending = null; this.delay?.delayTime.setTargetAtTime(60 / this.bpm * .75, this.nextTime, .1)}
      if (step === 0) {
        if (!this.holding) this.commitReplacement()
        if (this.undoPending && this.previous) {this.phrase = this.previous; this.previous = null; this.replacement = null; this.undoPending = false}
      }
      const note = this.holding ? this.lead : this.phrase?.[step] ?? null
      if (this.holding) {this.take.push(note ? {...note} : null); if (this.take.length > PHRASE_STEPS) this.take.shift()}
      const energy = note?.energy ?? .2, space = note?.space ?? .3
      this.delaySend?.gain.setTargetAtTime(.08 + space * .22, this.nextTime, .04)
      this.accompany(step, this.nextTime, energy, !!note)
      if (note) this.melody(note, this.nextTime)
      this.events.push({time: this.nextTime, step, energy, space})
      if (this.events.length > 12) this.events.splice(0, this.events.length - 12)
      this.nextTime += 60 / this.bpm / 4
      this.step++
    }
  }
  private track(source: AudioScheduledSourceNode, end: number, nodes: AudioNode[]) {
    this.voices.add(source)
    source.onended = () => {this.voices.delete(source); source.disconnect(); for (const node of nodes) node.disconnect()}
    source.stop(end)
  }
  private synth(midi: number, time: number, duration: number, volume: number, type: OscillatorType, cutoff: number, echo = false) {
    const ctx = this.context!, osc = ctx.createOscillator(), gain = ctx.createGain(), filter = ctx.createBiquadFilter()
    osc.type = type; osc.frequency.setValueAtTime(440 * 2 ** ((midi - 69) / 12), time)
    filter.type = 'lowpass'; filter.Q.value = .8
    filter.frequency.setValueAtTime(cutoff, time); filter.frequency.exponentialRampToValueAtTime(Math.max(160, cutoff * .38), time + duration)
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(volume, time + .009)
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration)
    osc.connect(filter); filter.connect(gain); gain.connect(this.bus!)
    if (echo) gain.connect(this.delaySend!)
    osc.start(time); this.track(osc, time + duration + .01, [filter, gain])
  }
  private melody(note: Note, time: number) {
    const duration = this.feeling === 'float' ? .26 : this.feeling === 'night' ? .14 : .22
    this.synth(note.pitch, time, duration, .11, this.feeling === 'night' ? 'square' : 'sawtooth', 650 + note.tone * 3800 + note.energy * 500, true)
    if (this.feeling === 'float') this.synth(note.pitch + 12, time + .025, .5, .025, 'sine', 3000, true)
  }
  private kick(time: number, volume: number) {
    const ctx = this.context!, osc = ctx.createOscillator(), gain = ctx.createGain()
    const techno = this.feeling === 'night', trance = this.feeling === 'float'
    const tail = techno ? .32 : trance ? .28 : .25
    osc.frequency.setValueAtTime(techno ? 180 : trance ? 160 : 125, time); osc.frequency.exponentialRampToValueAtTime(techno ? 40 : trance ? 48 : 46, time + (techno ? .15 : .075))
    gain.gain.setValueAtTime(volume, time); gain.gain.exponentialRampToValueAtTime(.0001, time + tail)
    osc.connect(gain); gain.connect(this.bus!); osc.start(time); this.track(osc, time + tail + .01, [gain])
    this.texture(time, .018, techno ? .035 : .018)
  }
  private hit(time: number, hat: boolean, volume: number) {
    const ctx = this.context!, noise = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain()
    noise.buffer = this.noise
    filter.type = hat ? 'highpass' : 'bandpass'; filter.frequency.value = hat ? 7000 : 1700; filter.Q.value = .65
    const duration = hat ? (this.feeling === 'night' ? .025 : .05) : .12
    gain.gain.setValueAtTime(volume, time); gain.gain.exponentialRampToValueAtTime(.0001, time + duration)
    noise.connect(filter); filter.connect(gain); gain.connect(this.bus!)
    noise.start(time); this.track(noise, time + duration + .01, [filter, gain])
  }
  private texture(time: number, duration: number, volume: number, opening = false) {
    const ctx = this.context!, source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain()
    source.buffer = this.noise
    filter.type = 'highpass'; filter.Q.value = .7
    filter.frequency.setValueAtTime(opening ? 800 : 6500, time)
    filter.frequency.exponentialRampToValueAtTime(opening ? 6500 : 900, time + duration)
    gain.gain.setValueAtTime(.0001, time)
    gain.gain.linearRampToValueAtTime(volume, time + (opening ? duration * .8 : .008))
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration)
    source.connect(filter); filter.connect(gain); gain.connect(this.bus!); gain.connect(this.delaySend!)
    source.start(time); this.track(source, time + duration + .01, [filter, gain])
  }
  private accompany(step: number, time: number, energy: number, hasLead: boolean) {
    const beat = 60 / this.bpm
    for (const event of presetEvents(this.feeling, step, energy)) {
      const t = time + (event.offset ?? 0) * beat
      const duration = (event.beats ?? .25) * beat
      const pitch = event.notes?.[0] ?? 60
      switch (event.part) {
        case 'kick': this.kick(t, event.level); break
        case 'clap':
          // Three short bursts create a clap rather than a generic noise snare.
          for (let i = 0; i < 3; i++) this.hit(t + i * .011, false, event.level * (i === 2 ? .65 : .4))
          if (this.feeling === 'night') this.synth(50, t, .07, .033, 'triangle', 1800)
          break
        case 'hat': this.hit(t, true, event.level); break
        case 'snare':
          this.hit(t, false, event.level)
          this.texture(t, this.feeling === 'night' ? .075 : .12, event.level * .45)
          this.synth(this.feeling === 'night' ? 57 : 53, t, .09, event.level * .3, 'triangle', 2200)
          break
        case 'tom': this.synth(pitch, t, duration, event.level, 'sine', 1000); break
        case 'rim':
          this.synth(pitch, t, duration, event.level * .55, 'square', 4600)
          this.synth(pitch + 7, t, duration * .5, event.level * .25, 'sine', 6000)
          break
        case 'crash': this.texture(t, duration, event.level); break
        case 'open': this.texture(t, duration, event.level); break
        case 'fx': this.texture(t, duration, event.level, step % 128 >= 120); break
        case 'perc': this.synth(pitch, t, duration, event.level, this.feeling === 'night' ? 'square' : 'sine', 1900, true); break
        case 'bass':
          this.synth(pitch, t, duration, event.level, 'sine', 800)
          this.synth(pitch, t, duration * .85, event.level * .36, this.feeling === 'night' ? 'sawtooth' : 'square', this.feeling === 'night' ? 650 + energy * 900 : 480 + energy * 480)
          break
        case 'chord':
          for (const midi of event.notes!) {
            if (this.feeling === 'float') {
              // Re-articulate the pad each beat for a pumping dance-floor envelope.
              for (let pulse = 0; pulse < 4; pulse++) {
                this.synth(midi, t + pulse * beat + .10 * beat, beat * .80, event.level, 'sawtooth', 1500 + energy * 1600, true)
                this.synth(midi + .07, t + pulse * beat + .10 * beat, beat * .80, event.level * .6, 'sawtooth', 2100, true)
              }
            } else this.synth(midi, t, duration, event.level, this.feeling === 'night' ? 'square' : 'sawtooth', this.feeling === 'night' ? 950 : 2300, true)
          }
          break
        case 'motif': {
          const level = event.level * (hasLead ? .35 : 1)
          this.synth(pitch, t, duration, level, this.feeling === 'bounce' ? 'triangle' : this.feeling === 'night' ? 'square' : 'sawtooth', this.feeling === 'night' ? 1100 + energy * 2400 : 3400, true)
          if (this.feeling === 'float') this.synth(pitch + .12, t + .006, duration, level * .45, 'sawtooth', 4000, true)
          break
        }
      }
    }
  }
}
