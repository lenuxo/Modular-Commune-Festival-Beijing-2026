declare module '@strudel/web' {
  export type Controls = Record<string, unknown>
  export interface Hap {
    whole: {begin: {valueOf(): number}; end: {valueOf(): number}}
    value: Controls
    duration: number
    hasOnset(): boolean
  }
  export interface Pattern {
    queryArc(begin: number, end: number, controls?: Controls): Hap[]
    withValue(fn: (value: Controls) => Controls): Pattern
    struct(pattern: Pattern): Pattern
    swingBy(amount: number, subdivisions: number): Pattern
  }
  export const silence: Pattern
  export function mini(source: string): Pattern
  export function note(source: Pattern): Pattern
  export function s(source: Pattern): Pattern
  export function slowcat(...patterns: Pattern[]): Pattern
  export function stack(...patterns: Pattern[]): Pattern
  export function superdough(value: Controls, time: number, duration: number, cps: number, cycle?: number): Promise<void>
  export function setAudioContext(context: BaseAudioContext | null): void
  export function initAudio(options: {maxPolyphony: number}): Promise<void>
  export function registerSynthSounds(): Promise<void>
  export function getSuperdoughAudioController(): {
    getOrbit(index: number, channels: number[]): {output: GainNode}
    reset(): void
    output: {destinationGain: GainNode}
  }
  export function setLogger(logger: (message: unknown, type?: unknown) => void): void
}
