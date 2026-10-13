export type Feeling = 'bounce' | 'night' | 'float'
export type Note = {pitch: number; tone: number; energy: number; space: number}
export type Phrase = (Note | null)[]
export type Point = {x: number; y: number}
export const PHRASE_STEPS = 128
export const FEELINGS: {id: Feeling; label: string; bpm: number}[] = [
  {id: 'bounce', label: '弹跳', bpm: 124},
  {id: 'night', label: '脉冲', bpm: 132},
  {id: 'float', label: '升空', bpm: 138},
]
export const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value))
// C minor pentatonic: gestures stay in the same musical world as the bass.
const pitches = [60, 63, 65, 67, 70, 72, 75, 77, 79, 82]
export function noteFromPoint(point: Point, previous?: number): number {
  const index = clamp(Math.round((1 - point.y) * (pitches.length - 1)), 0, pitches.length - 1)
  if (previous !== undefined) {
    const oldIndex = pitches.indexOf(previous)
    if (oldIndex >= 0 && Math.abs((1 - point.y) * 9 - oldIndex) < .68) return previous
  }
  return pitches[index]
}
export function modulation(point: Point, origin: Point) {
  return {energy: clamp(.35 + (origin.y - point.y) * 1.8), space: clamp(.3 + (point.x - origin.x) * 1.5)}
}
export function makePhrase(take: Phrase): Phrase {
  const recent = take.slice(-PHRASE_STEPS).map(note => note ? {...note} : null)
  return [...recent, ...Array<null>(PHRASE_STEPS - recent.length).fill(null)]
}
export function copyPhrase(phrase: Phrase | null): Phrase | null {
  return phrase?.map(note => note ? {...note} : null) ?? null
}
