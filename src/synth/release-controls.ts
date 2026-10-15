import type {Note} from './model.ts'

type Controls = Pick<Note, 'tone' | 'energy' | 'space'>
type Axis = keyof Controls
export const RELEASE_SECONDS = .32
export const CONTROL_AXES: Axis[] = ['tone','energy','space']
export const MODULATION_AXES: Axis[] = ['energy','space']

/** A short release envelope; a finger still touching keeps its own axes immediate. */
export class ReleaseControls {
  private released = new Map<Axis,{from: number; time: number; duration: number}>()
  start(from: Controls, axes: Axis[], time: number, duration=RELEASE_SECONDS) {
    for (const axis of axes) if (!this.released.has(axis)) this.released.set(axis,{from:from[axis],time,duration})
  }
  grab(axes: Axis[]) {for (const axis of axes) this.released.delete(axis)}
  get active() {return this.released.size > 0}
  value(target: Controls, time: number, consume=false): Controls {
    const value = {...target}
    for (const [axis,release] of this.released) {
      const progress = Math.max(0,Math.min(1,(time-release.time)/release.duration))
      if (progress === 1) {if(consume) this.released.delete(axis); continue}
      const ease = progress * progress * (3 - 2 * progress)
      value[axis] = release.from + (target[axis] - release.from) * ease
    }
    return value
  }
}
