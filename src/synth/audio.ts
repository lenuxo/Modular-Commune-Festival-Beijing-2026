import * as S from '@strudel/web'
import {copyPhrase, FEELINGS, makePhrase, PHRASE_STEPS} from './model'
import type {Feeling, Note, Phrase} from './model'
import {arrangements} from './presets'
import {eventExpression, gestureVoice} from './music-controls'
import {LiveMix, parts} from './live-mix'
import {CONTROL_AXES, MODULATION_AXES, ReleaseControls} from './release-controls'

export type Session = {phrase: Phrase | null; previous: Phrase | null; feeling: Feeling; muted: boolean}
export type AudioSnapshot = {playing: boolean; loading: boolean; error: string; step: number; pulse: number; energy: number; space: number; feeling: Feeling; pending: Feeling | null; hasPhrase: boolean; canUndo: boolean}
const defaultControls = {energy:.2, space:.3, tone:.5}
type Controller = ReturnType<typeof S.getSuperdoughAudioController>
type Runtime = {context: AudioContext; controller: Controller; master: GainNode; limiter: DynamicsCompressorNode; ready: Promise<void> | null; owner: ThumbAudio | null}
let shared: Runtime | null = null

// Strudel pools AudioNodes globally. Reuse one suspended context rather than connecting pooled
// nodes from an old context to a new one. No context exists until the first trusted gesture.
function runtime(): Runtime {
  if (shared) return shared
  const Context = window.AudioContext ?? (window as unknown as {webkitAudioContext?: typeof AudioContext}).webkitAudioContext
  if (!Context) throw new Error('当前浏览器暂时不能播放，请换个浏览器试试。')
  const context = new Context({latencyHint:'interactive'})
  S.setAudioContext(context)
  const master = context.createGain(); master.gain.value = 0
  const limiter = context.createDynamicsCompressor()
  limiter.threshold.value = -5; limiter.knee.value = 4; limiter.ratio.value = 12
  limiter.attack.value = .001; limiter.release.value = .08
  limiter.connect(master); master.connect(context.destination)
  const r: Runtime = {context, master, limiter, controller:S.getSuperdoughAudioController(), ready:null, owner:null}
  routeOutput(r)
  context.onstatechange = () => {if (context.state !== 'running') r.owner?.interrupt()}
  shared = r
  return r
}
function routeOutput(r: Runtime) {
  r.controller.output.destinationGain.disconnect()
  r.controller.output.destinationGain.connect(r.limiter)
}
function prepare(r: Runtime) {
  if (!r.ready) {
    r.ready = (async () => {
      await S.registerSynthSounds()
      await S.initAudio({maxPolyphony:128})
    })().catch(error => {r.ready = null; throw error})
  }
  return r.ready
}

/** Strudel supplies patterns, synthesized voices and FX; this adapter connects them to touch. */
export class ThumbAudio {
  private backend: Runtime | null = null
  private timer: ReturnType<typeof setInterval> | null = null
  private mix: LiveMix | null = null
  private lastLivePitch: number | null = null
  private lastLiveTime = -1
  private startTime = 0
  private nextTime = 0
  private step = 0
  private phraseStep = 0
  private revision = 0
  private active = false
  private loading = false
  private failure = ''
  private holding = false
  private lead: Note | null = null
  private controls = {...defaultControls}
  private releases = new ReleaseControls()
  private playbackControls = {...defaultControls}
  private playbackLead = false
  private take: Phrase = []
  private phrase: Phrase | null
  private previous: Phrase | null
  private replacement: Phrase | null = null
  private undoPending = false
  private feeling: Feeling
  private pending: Feeling | null = null
  private muted: boolean
  private disposed = false
  private queue: Promise<void> = Promise.resolve()
  private events: {time: number; step: number; energy: number; space: number}[] = []
  constructor(session?: Session) {
    this.phrase = copyPhrase(session?.phrase ?? null)
    this.previous = copyPhrase(session?.previous ?? null)
    this.feeling = session?.feeling ?? 'bounce'
    this.muted = session?.muted ?? false
  }
  get session(): Session {return {phrase:copyPhrase(this.phrase), previous:copyPhrase(this.previous), feeling:this.feeling, muted:this.muted}}
  get snapshot(): AudioSnapshot {
    const now = this.backend?.context.currentTime ?? 0
    while (this.events.length > 1 && this.events[1].time <= now) this.events.shift()
    const event = this.events[0]
    const visual=this.releases.value(this.holding?this.controls:this.playbackControls,now)
    return {playing:this.active, loading:this.loading, error:this.failure, step:event?.step ?? 0,
      pulse:this.active && event ? Math.exp(-Math.max(0,now-event.time)*13) : 0,
      energy:visual.energy,
      space:visual.space,
      feeling:this.feeling, pending:this.pending, hasPhrase:!!this.phrase || !!this.replacement, canUndo:!!this.previous}
  }
  private get bpm() {return FEELINGS.find(f=>f.id===this.feeling)!.bpm}
  async start() {
    if (this.disposed || this.active || this.loading) return
    const r = this.backend = runtime()
    if (r.owner && r.owner !== this) {const old=r.owner;old.stop();old.mix?.destroy();old.mix=null}
    r.owner = this
    this.mix?.destroy(); this.mix = null
    r.controller.reset(); routeOutput(r)
    const revision = ++this.revision
    this.loading = true; this.failure = ''
    try {
      // Unlock synchronously from the trusted touch. No sample downloads are needed.
      await r.context.resume()
      await prepare(r)
      if (this.disposed || revision !== this.revision || r.owner !== this) return
      if (document.hidden) {this.stop(); return}
      if (r.context.state !== 'running') throw new Error('audio interrupted')
      this.loading = false; this.active = true; this.step = 0; this.phraseStep = 0; this.events = []; this.lastLivePitch=null;this.lastLiveTime=-1
      this.mix = new LiveMix(r.context,r.limiter,this.bpm)
      this.mix.update(this.feeling,this.controls,this.holding)
      this.startTime = this.nextTime = r.context.currentTime + .035
      if(this.holding && this.lead) this.liveAttack(this.lead)
      r.master.gain.setTargetAtTime(this.muted ? 0 : .68,r.context.currentTime,.02)
      this.schedule()
      this.timer = setInterval(()=>this.schedule(),25)
    } catch {
      if (this.disposed || revision !== this.revision) return
      this.stop(); this.failure = '声音没准备好，点「开始」再试一次。'
      throw new Error(this.failure)
    }
  }
  begin(note: Note) {
    if (this.holding) return
    if (this.replacement) this.commitReplacement()
    this.releases.grab(CONTROL_AXES)
    this.holding = true; this.lead = note; this.controls = {...note}; this.take = [{...note}]
    if(this.active) this.liveAttack(note)
  }
  update(note: Note | null) {
    if(note && !this.lead) this.releases.grab(['tone'])
    const changed=note && note.pitch!==this.lead?.pitch
    this.lead=note
    if(note) this.controls={...note}
    this.refreshMix()
    if(note && (changed || note.pitch!==this.lastLivePitch)) this.liveAttack(note)
  }
  setModulation(value: {energy: number; space: number}) {this.controls={...this.controls,...value};this.refreshMix()}
  holdModulation() {this.releases.grab(MODULATION_AXES)}
  releaseTouch(role: 'lead' | 'second') {
    const now=this.backend?.context.currentTime ?? 0
    this.releases.start(this.releases.value(this.controls,now,true),role==='lead'?['tone']:MODULATION_AXES,now,role==='lead'?.42:.32)
  }
  private refreshMix() {
    if(!this.active || !this.backend) return
    const now=this.backend.context.currentTime
    const controls=this.releases.value(this.holding?this.controls:this.playbackControls,now,true)
    this.mix?.update(this.feeling,controls,this.holding?!!this.lead:this.playbackLead,now,this.holding)
  }
  private liveAttack(note: Note) {
    const r=this.backend
    if(!this.active || !r || r.owner!==this) return
    const now=r.context.currentTime
    // Immediate pitch feedback, with a short retrigger guard against frantic glissandi.
    if(now-this.lastLiveTime<.035) return
    this.lastLiveTime=now;this.lastLivePitch=note.pitch
    const cps=this.bpm/240, bar=Math.max(0,Math.floor((now-this.startTime)*cps))%8
    const revision=this.revision
    void S.superdough({...gestureVoice(this.feeling,{...note,...this.releases.value(note,now)},bar),delay:0,room:0},now+.004,60/this.bpm*.45,cps,bar).catch(()=>{
      if(revision===this.revision && this.active) {this.stop();this.failure='声音暂时断了，点「开始」再试一次。'}
    })
  }
  release() {
    if (!this.holding) return
    const now=this.backend?.context.currentTime ?? 0
    this.releases.start(this.releases.value(this.controls,now,true),CONTROL_AXES,now,.42)
    this.holding = false; this.lead = null
    this.refreshMix()
    if (this.take.some(Boolean)) this.replacement = makePhrase(this.take)
    this.take = []
  }
  cancel() {this.holding = false; this.lead = null; this.take = []; this.releases.grab(CONTROL_AXES)}
  private commitReplacement() {
    if (!this.replacement) return
    this.previous = copyPhrase(this.phrase); this.phrase = this.replacement; this.replacement = null; this.phraseStep = 0
  }
  setFeeling(feeling: Feeling) {
    if (this.active) this.pending = feeling === this.feeling ? null : feeling
    else {this.feeling = feeling; this.pending = null}
  }
  setMuted(muted: boolean) {
    this.muted = muted
    if (this.backend?.owner === this) this.backend.master.gain.setTargetAtTime(this.active && !muted ? .68 : 0,this.backend.context.currentTime,.02)
  }
  undo() {
    if (!this.previous) return
    if (this.active) this.undoPending = true
    else {this.phrase = this.previous; this.previous = null; this.replacement = null; this.phraseStep = 0}
  }
  interrupt() {if (this.active || this.loading) this.stop()}
  stop() {
    ++this.revision; this.cancel(); this.commitReplacement()
    if (this.pending) {this.feeling = this.pending; this.pending = null}
    this.active = false; this.loading = false; this.undoPending = false
    if (this.timer) clearInterval(this.timer)
    this.timer = null
    const r = this.backend
    if (!r || r.owner && r.owner !== this) return
    r.owner = null
    const now = r.context.currentTime
    r.master.gain.cancelScheduledValues(now); r.master.gain.setTargetAtTime(0,now,.009)
    const revision = this.revision, stoppedMix=this.mix
    setTimeout(()=>{
      stoppedMix?.destroy()
      if (this.mix===stoppedMix) this.mix=null
      if (revision !== this.revision || r.owner) return
      // Disconnect tails and future voices as well as the dry signal before suspending.
      r.controller.reset(); routeOutput(r)
      void r.context.suspend().catch(()=>{})
    },60)
  }
  dispose() {this.stop(); this.disposed = true}
  private schedule() {
    const r = this.backend
    if (!r || !this.active || r.owner !== this) return
    if(this.releases.active) this.refreshMix()
    if (this.nextTime < r.context.currentTime - .05) this.nextTime = r.context.currentTime + .025
    while (this.nextTime < r.context.currentTime + .10) {
      if (!this.holding && !this.phrase && this.replacement) this.commitReplacement()
      let step = this.step % PHRASE_STEPS
      if (step % 16 === 0 && this.pending) {
        this.feeling = this.pending; this.pending = null; this.step = 0; step = 0
        this.startTime=this.nextTime
        this.mix?.destroy(); this.mix=new LiveMix(r.context,r.limiter,this.bpm)
      }
      if (this.phraseStep % PHRASE_STEPS === 0) {
        if (!this.holding) this.commitReplacement()
        if (this.undoPending && this.previous) {this.phrase = this.previous; this.previous = null; this.replacement = null; this.undoPending = false}
      }
      const note = this.holding ? this.lead : this.phrase?.[this.phraseStep % PHRASE_STEPS] ?? null
      const controls = this.holding ? this.controls : note ?? defaultControls
      const time = this.nextTime, feeling = this.feeling, cps = this.bpm / 240, revision = this.revision
      const soundingControls=this.releases.value(controls,time)
      if (this.holding) {this.take.push(note ? {...note,...soundingControls} : null); if (this.take.length > PHRASE_STEPS) this.take.shift()}
      const playLead = !!note && (step % (soundingControls.energy>.7?2:4) === 0) && (!this.holding || time-this.lastLiveTime>.08)
      this.queue = this.queue.then(()=>this.playStep(feeling,step,time,cps,note,controls,playLead,revision)).catch(()=>{
        if (revision === this.revision && this.active) {this.stop(); this.failure = '声音暂时断了，点「开始」再试一次。'}
      })
      this.events.push({time,step,energy:soundingControls.energy,space:soundingControls.space})
      if (this.events.length > 16) this.events.splice(0,this.events.length-16)
      this.nextTime += 1 / cps / 16
      this.step++; if (!this.holding) this.phraseStep++
    }
  }
  private async playStep(feeling: Feeling, step: number, time: number, cps: number, note: Note | null, controls: Pick<Note,'tone' | 'energy' | 'space'>, playLead: boolean, revision: number) {
    const valid = () => this.active && revision === this.revision && this.backend?.owner === this
    if (!valid()) return
    const begin = step / 16, end = (step + 1) / 16
    const haps = arrangements[feeling].parts.flatMap(({part,pattern})=>pattern.queryArc(begin,end,{_cps:cps})
      .filter(h=>h.hasOnset()).map(h=>({part,h})))
      .sort((a,b)=>a.h.whole.begin.valueOf()-b.h.whole.begin.valueOf())
    if(!this.holding) {
      this.playbackControls={...controls};this.playbackLead=!!note
      const when=Math.max(time,this.backend!.context.currentTime)
      this.mix?.update(feeling,this.releases.value(controls,when),!!note,when)
    }
    for (const {part,h} of haps) {
      if (!valid()) return
      const hitTime=time+(h.whole.begin.valueOf()-begin)/cps
      if(part==='kick') this.mix?.kick(hitTime,feeling)
      const position=Math.round((h.whole.begin.valueOf()%1)*16)
      const velocity=part==='drums' ? (position%4===0?1:position%2===0?.8:.52) : 1
      const expression=eventExpression(part,this.releases.value(controls,hitTime),h.value)
      const value = {...expression,orbit:parts.indexOf(part),gain:Number(expression.gain ?? 1)*velocity*arrangements[feeling].gain}
      await S.superdough(value,time+(h.whole.begin.valueOf()-begin)/cps,Number(h.duration)/cps,cps,begin)
    }
    if (note && playLead && valid()) await S.superdough({...gestureVoice(feeling,{...note,...this.releases.value(controls,time)},Math.floor(step/16)),delay:0,room:0},time,1/cps/(feeling==='night'?16:8),cps,begin)
  }
}
