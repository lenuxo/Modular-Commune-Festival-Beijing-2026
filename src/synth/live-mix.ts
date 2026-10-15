import * as S from '@strudel/web'
import type {Feeling, Note} from './model'
import {liveTargets} from './music-controls'
import type {Part} from './music-controls'

export const parts: Part[] = ['kick','drums','extra','bass','sub','chords','motif','air','fx']
type Bus = {filter: BiquadFilterNode; level: GainNode; pump: GainNode; send: GainNode; body: BiquadFilterNode; clean: GainNode; grit: GainNode; pan: StereoPannerNode; nodes: AudioNode[]}
/** Persistent post-orbit FX: gestures affect ringing voices and tails, not only future events. */
export class LiveMix {
  private buses = new Map<Part | 'lead',Bus>()
  private targets=new Map<AudioParam,{value:number;time:number}>()
  private context: BaseAudioContext
  constructor(context: BaseAudioContext, destination: AudioNode, bpm: number) {
    this.context=context
    for (const [i,part] of [...parts,'lead' as const].entries()) {
      const orbit=S.getSuperdoughAudioController().getOrbit(part==='lead'?40:i,[0,1])
      const filter=context.createBiquadFilter(); filter.type='lowpass'; filter.frequency.value=18000
      const pump=context.createGain(), level=context.createGain(), send=context.createGain()
      const body=context.createBiquadFilter();body.type='peaking';body.frequency.value=part==='bass'?700:2200;body.Q.value=.7
      const clean=context.createGain(),grit=context.createGain(),pan=context.createStereoPanner()
      const shaper=part==='bass'||part==='chords'?context.createWaveShaper():null,curve=new Float32Array(1024)
      for(let j=0;j<curve.length;j++){const x=j*2/(curve.length-1)-1;curve[j]=Math.tanh(x*2.5)/Math.tanh(2.5)*.65}
      if(shaper) shaper.curve=curve;grit.gain.value=0
      const delay=context.createDelay(1), feedback=context.createGain(), echoFilter=context.createBiquadFilter()
      delay.delayTime.value=60/bpm*.75; feedback.gain.value=.28
      echoFilter.type='lowpass';echoFilter.frequency.value=3200
      send.gain.value=0
      orbit.output.disconnect(); orbit.output.connect(filter);filter.connect(body);body.connect(clean);clean.connect(pump);if(shaper){body.connect(shaper);shaper.connect(grit);grit.connect(pump)}pump.connect(level);level.connect(pan);pan.connect(destination)
      level.connect(send);send.connect(delay);delay.connect(echoFilter);echoFilter.connect(destination);echoFilter.connect(feedback);feedback.connect(delay)
      this.buses.set(part,{filter,level,pump,send,body,clean,grit,pan,nodes:[filter,pump,level,send,delay,feedback,echoFilter,body,clean,grit,pan,...(shaper?[shaper]:[])]})
    }
  }
  update(feeling: Feeling, controls: Pick<Note,'energy'|'space'|'tone'>, lead: boolean, time=this.context.currentTime, touching=lead) {
    for (const [part,b] of this.buses) {
      const v=liveTargets(feeling,part,controls,lead)
      // 12 ms dezippering, independent of display refresh. Releasing the gesture breathes back in 85 ms.
      const tau=touching?.012:.085
      for (const [param,target] of [[b.filter.frequency,v.cutoff],[b.filter.Q,v.resonance],[b.level.gain,v.gain],[b.send.gain,v.wet],[b.body.gain,v.body],[b.clean.gain,1-v.grit*.6],[b.grit.gain,v.grit],[b.pan.pan,v.pan]] as const) {
        const previous=this.targets.get(param)
        if(previous?.value===target && previous.time<=time) continue
        param.cancelScheduledValues(time);param.setTargetAtTime(target,time,part==='motif' && param===b.level.gain && !lead ? .10 : tau)
        this.targets.set(param,{value:target,time})
      }
    }
  }
  kick(time: number, feeling: Feeling) {
    for (const part of ['bass','sub','chords','motif','air','lead'] as const) {
      const param=this.buses.get(part)!.pump.gain
      param.setValueAtTime(feeling==='bounce'?.62:.38,time)
      param.exponentialRampToValueAtTime(1,time+(feeling==='bounce'?.095:.16))
    }
  }
  destroy() {for(const b of this.buses.values())for(const node of b.nodes)node.disconnect();this.buses.clear();this.targets.clear()}
}
