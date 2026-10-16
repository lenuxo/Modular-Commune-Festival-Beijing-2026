export type Feeling = 'house' | 'techno' | 'breaks' | 'dnb'
export type Note = {pitch: number; tone: number; energy: number; space: number}
export type Phrase = (Note | null)[]
export type Point = {x: number; y: number}
export const BARS = 16
export const PHRASE_STEPS = BARS * 16
export const FEELINGS: {id: Feeling; label: string; genre:string; bpm: number; touchHint: string; secondHint: string}[] = [
  {id:'techno',label:'重压',genre:'Techno',bpm:142,touchHint:'上下换旋律，左右拧出金属感',secondHint:'向上更密集，向右延展脉冲'},
  {id:'breaks',label:'碎拍',genre:'Breakbeat',bpm:132,touchHint:'上下换旋律，左右改变电子颗粒',secondHint:'向上鼓点更活，向右更迷幻'},
  {id:'house',label:'律动',genre:'House',bpm:124,touchHint:'上下换旋律，左右从温暖到弹跳',secondHint:'向上更带劲，向右拉开回响'},
  {id:'dnb',label:'疾速',genre:'Drum & Bass',bpm:174,touchHint:'上下换旋律，左右让低音翻涌',secondHint:'向上更翻腾，向右铺开氛围'},
]
export const DEFAULT_FEELING:Feeling=FEELINGS[0].id
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
  return {energy: clamp(.5 + (origin.y - point.y) * 2), space: clamp(.4 + (point.x - origin.x) * 1.8)}
}
export function makePhrase(take: Phrase): Phrase {
  const recent = take.slice(-PHRASE_STEPS).map(note => note ? {...note} : null)
  return [...recent, ...Array<null>(PHRASE_STEPS - recent.length).fill(null)]
}
export function copyPhrase(phrase: Phrase | null): Phrase | null {
  return phrase?.map(note => note ? {...note} : null) ?? null
}
