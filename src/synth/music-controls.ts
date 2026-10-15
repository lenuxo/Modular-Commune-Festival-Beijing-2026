import {clamp} from './model.ts'
import type {Feeling, Note} from './model.ts'

export type Part = 'kick' | 'drums' | 'extra' | 'bass' | 'sub' | 'chords' | 'motif' | 'air' | 'fx'
// MIDI roots and chord quality for each of the eight bars. Gesture notes follow the current harmony.
const harmony: Record<Feeling, {roots: number[]; major: boolean[]}> = {
  bounce: {roots: [38,38,43,43,46,46,48,48], major: [false,false,false,false,true,true,true,true]},
  night: {roots: [41,41,41,41,37,37,41,41], major: [false,false,false,false,true,true,false,false]},
  float: {roots: [45,45,41,41,48,48,43,43], major: [false,false,true,true,true,true,true,true]},
}
const inputPitches = [60,63,65,67,70,72,75,77,79,82]
export function harmonicPitch(pitch: number, feeling: Feeling, bar: number): number {
  const h = harmony[feeling], index = Math.max(0, inputPitches.indexOf(pitch))
  const degrees = h.major[bar % 8] ? [0,2,4,7,9] : [0,3,5,7,10]
  return h.roots[bar % 8] + 24 + degrees[index % 5] + Math.floor(index / 5) * 12
}
export function liveTargets(feeling: Feeling, part: Part | 'lead', value: Pick<Note,'energy'|'space'|'tone'>, lead: boolean) {
  const e=clamp(value.energy), s=clamp(value.space), t=clamp(value.tone)
  const melodic=['chords','motif','air','lead'].includes(part)
  return {
    cutoff: part==='bass' ? (feeling==='night'?650:1000)*Math.pow(feeling==='night'?9:5,e*.6+t*.4) : melodic ? 650*Math.pow(15,clamp(t*.55+e*.65)) : part==='drums' || part==='extra' ? 5200*Math.pow(2.6,t*.55+e*.45) : 18000,
    gain: part==='extra' ? .08+e*1.8 : part==='air' ? .25+e*1.1 : part==='motif' && lead ? .32 : 1,
    wet: melodic ? .015+s*s*.52 : 0,
    resonance: part==='bass' && feeling==='night' ? .6+e*1.6 : .65,
    body: part==='bass' ? -3+t*5+e*2 : part==='drums' ? -3+t*4+e*2 : 0,
    grit: part==='bass' ? .04+t*.20+e*.24 : part==='chords' ? t*.12+e*.12 : 0,
    pan: part==='air' ? (s-.5)*.6 : part==='extra' ? (.5-s)*.4 : 0,
  }
}
/** Change articulation as well as colour; kicks and sub remain the stable foundation. */
export function eventExpression(part: Part, controls: Pick<Note,'energy'|'space'|'tone'>, source: Record<string,unknown>): Record<string,unknown> {
  const e=clamp(controls.energy),s=clamp(controls.space),t=clamp(controls.tone)
  if(part==='kick' || part==='sub') return source
  const shaped={...source}
  if(part==='drums' || part==='extra') {
    shaped.decay=Number(source.decay ?? .08)*(.65+t*.4+e*.25)
    shaped.gain=Number(source.gain ?? 1)*(.88+e*.22)
  }
  if(part==='bass') {
    shaped.decay=Number(source.decay ?? .12)*(.75+e*.55)
    shaped.lpenv=Number(source.lpenv ?? 1)*(.75+t*.7+e*.6)
    if(source.fm!==undefined) shaped.fm=Number(source.fm)*(.6+t*.7+e*.35)
  }
  if(part==='chords' || part==='motif' || part==='air') {
    shaped.decay=Number(source.decay ?? .18)*(.8+s*.55)
    shaped.release=Number(source.release ?? .1)*(.7+s*.8)
  }
  return shaped
}
export function gestureVoice(feeling: Feeling, note: Note, bar: number): Record<string, unknown> {
  const energy = clamp(note.energy), tone = clamp(note.tone), space = clamp(note.space)
  return {note: harmonicPitch(note.pitch, feeling, bar),
    s: feeling === 'night' ? 'sawtooth' : feeling === 'float' ? 'supersaw' : 'triangle',
    gain: feeling === 'float' ? .23 : .30, unison:3, detune:.15, spread:.7,
    attack: .006, decay: feeling === 'night' ? .11 : .20, sustain: .04, release: .16 + space * .12,
    lpf: 7000, lpq: feeling === 'night' ? 1 + energy * 2 : .7,
    ...(feeling === 'bounce' ? {fm: .65 + tone * .7, fmh: 2} : {}),
    ...(feeling === 'night' ? {lpenv: 2 + energy * 2} : {}),
    pan: .5, room: 0, delay: 0, delayfeedback: .28, orbit: 40,
  }
}
