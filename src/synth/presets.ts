import type {Feeling} from './model'

export type Part = 'kick' | 'clap' | 'snare' | 'hat' | 'open' | 'tom' | 'rim' | 'crash' | 'perc' | 'bass' | 'chord' | 'motif' | 'fx'
export type PresetEvent = {part: Part; notes?: number[]; beats?: number; level: number; offset?: number}
const house = [72, null, 75, null, null, 79, null, 75, 70, null, null, 67, null, 75, 72, null]
const techno = [60, null, null, 67, null, null, 63, null, null, 70, null, null, 67, null, 63, null]
const trance = [72, 79, 75, 79, 70, 77, 75, 79, 72, 79, 82, 79, 75, 77, 79, 75]
const roots = [36, 36, 44, 44, 39, 39, 46, 46]
const chords = [[60, 63, 67, 70], [56, 60, 63, 67], [55, 58, 63, 67], [58, 62, 65, 70]]

export const ARRANGEMENT_STEPS = 128

/** Style-specific drum grooves, with eight distinct bars and their own turnarounds. */
export function drumEvents(feeling: Feeling, position: number, energy: number): PresetEvent[] {
  const s = position % 16, bar = Math.floor(position / 16) % 8
  const out: PresetEvent[] = []
  const add = (part: Part, level: number, beats?: number, offset?: number, notes?: number[]) => out.push({part, level, beats, offset, notes})
  const kickPatterns = feeling === 'bounce'
    ? [[0,4,8,12],[0,4,8,12,15],[0,4,8,12],[0,4,8,11,12],[0,4,8,12],[0,4,7,8,12],[0,4,8,12,14],[0,4,8,10]]
    : feeling === 'night'
    ? [[0,4,8,12],[0,4,8,12],[0,4,8,12,14],[0,4,8,12,15],[0,4,8,12],[0,4,6,8,12],[0,4,8,12,14],[0,4,8,11,14]]
    : [[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8]]
  if (kickPatterns[bar].includes(s)) add('kick', feeling === 'bounce' ? .72 : .80)
  if (s === 0 && (bar === 0 || bar === 4)) add('crash', .11, 1.8)
  if (feeling === 'bounce') {
    // Swung hats, dry clap, rim ghosts and descending tom answers.
    const swing = s % 2 ? .055 : 0
    if (s === 4 || s === 12) add('clap', .21)
    if (s % 2 === 0 || [1,3,5,7].includes(bar) && [3,7,11,15].includes(s)) add('hat', s % 4 === 2 ? .056 : .029, undefined, swing)
    if ([2,6,10,14].includes(s) && !(bar === 7 && s >= 10)) add('open', .075, .32)
    if ([1,5,9,13].includes(s) && (s + bar) % 3 === 0) add('rim', .09, .10, swing, [78])
    if ((bar === 3 || bar === 7) && s >= 13) add('tom', .15, .30, swing, [55 - (s - 13) * 3])
    if (bar === 6 && s === 11) add('clap', .085)
  } else if (feeling === 'night') {
    // Straight sixteenths, syncopated low toms and a metallic snare backbeat.
    if (s === 4 || s === 12) add('snare', .22)
    if (s % 2 === 0 || bar >= 4 || energy > .65) add('hat', s % 4 === 0 ? .05 : s % 2 ? .018 : .035)
    const offbeats = [[6,14],[2,10],[6,10,14],[2,6,14],[2,6,10,14],[6,14],[2,10,14],[2,6]][bar]
    if (offbeats.includes(s)) add('open', .07, .19)
    const toms = [[3,10],[7,11],[3,7,14],[7,10,15],[3,10,13],[7,11,15],[3,6,11],[9,11,13,15]][bar]
    if (toms.includes(s)) add('tom', .16, .23, 0, [s % 3 === 0 ? 43 : 48])
    if ([3,7].includes(bar) && [13,15].includes(s)) add('snare', .10)
    if (bar >= 4 && s === 9) add('rim', .075, .07, 0, [91])
  } else {
    // Wide clap/snare layers, bright offbeat hats, escalating snare rolls.
    if (s === 4 || s === 12) {add('clap', .18);add('snare', .18)}
    if (s % 2 === 0) add('hat', s % 4 === 2 ? .045 : .022)
    if ([2,6,10,14].includes(s) && !(bar === 7 && s >= 12)) add('open', .12, .45)
    if (bar >= 4 && s % 2 === 1) add('hat', .023)
    if (bar === 3 && [14,15].includes(s)) add('snare', .12)
    if (bar === 5 && [7,15].includes(s)) add('snare', .07)
    if (bar === 6 && s >= 12 && s % 2 === 0) add('snare', .08 + (s - 12) * .018)
    if (bar === 7 && s >= 8) {
      add('snare', .06 + (s - 8) * .018)
      if (s >= 14) add('snare', .12, undefined, .125)
    }
  }
  return out
}

/** Full eight-bar musical arrangements. */
export function presetEvents(feeling: Feeling, position: number, energy: number): PresetEvent[] {
  const s = position % 16, bar = Math.floor(position / 16) % 8
  const beat = s / 4, fill = bar === 7, lift = bar >= 4
  const out: PresetEvent[] = []
  const add = (part: Part, level: number, notes?: number[], beats?: number, offset?: number) => out.push({part, level, notes, beats, offset})
  const root = feeling === 'night' ? 36 : roots[bar]
  out.push(...drumEvents(feeling, position, energy))
  if (s === 0 && (bar === 0 || bar === 4)) add('fx', .028, undefined, 2)
  if (fill && s === 8) add('fx', .025, undefined, 2)

  if (feeling === 'bounce') {
    if ([0, 3, 6, 8, 11, 14].includes(s)) add('bass', .16, [root + (s === 14 ? 7 : 0)], s === 0 || s === 8 ? .38 : .55, s % 4 === 0 ? .06 : 0)
    if ([2, 7, 10, 15].includes(s)) add('chord', .026, chords[Math.floor(bar / 2)], .48)
    if ([3, 10, 13].includes(s)) add('perc', .035, [s === 10 ? 79 : 72], .16)
    const pitch = house[(s + [0,8,4,12,0,4,8,12][bar]) % 16]
    if (pitch !== null) add('motif', .058, [pitch + (bar === 4 || bar === 6 ? 12 : 0)], .38)
  } else if (feeling === 'night') {
    if ([2, 3, 6, 8, 10, 11, 14].includes(s)) add('bass', .15, [root + (s === 11 ? 12 : s === 14 ? 7 : 0)], .32)
    if ([1, 7, 9, 15].includes(s)) add('perc', .041, [s === 7 ? 51 : 48], .17)
    if (s === 0 || s === 10) add('chord', .022, [60, 63, 67], .32)
    const pitch = techno[(s + [0,3,6,1,4,7,2,9][bar]) % 16]
    if (pitch !== null) add('motif', .055, [pitch + (bar === 6 ? 12 : 0)], .24)
  } else {
    if (s % 4 !== 0) add('bass', s % 4 === 2 ? .14 : .075, [root + (s % 4 === 3 ? 12 : 0)], .23)
    if (s === 0) add('chord', .022, chords[Math.floor(bar / 2)], 3.8)
    const pitch = trance[(s + [0,4,8,12,2,6,10,14][bar]) % 16]
    if (s % 2 === 0 || lift) add('motif', lift ? .038 : .046, [pitch], .40)
    if (beat === 3.5) add('perc', .025, [84], .2)
  }
  return out
}
