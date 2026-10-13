import {useEffect, useRef, useState} from 'react'
import type {PointerEvent as ReactPointerEvent} from 'react'
import {ChevronLeft, Play, Square, Undo2, Volume2, VolumeX} from 'lucide-react'
import {Button} from '../design-system/Button'
import {lockBodyScroll} from '../components/scrollLock'
import {ThumbAudio} from './audio'
import type {AudioSnapshot, Session} from './audio'
import {createField} from './field'
import {clamp, FEELINGS, modulation, noteFromPoint} from './model'
import type {Feeling, Point} from './model'
import './synth.css'

type Contact = {role: 'lead' | 'second'; point: Point; origin: Point}
let remembered: Session | undefined
const empty: AudioSnapshot = {playing: false, step: 0, pulse: 0, energy: .2, space: .3, feeling: 'bounce', pending: null, hasPhrase: false, canUndo: false}

export default function ThumbSynth({onClose}: {onClose: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const surface = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const backup = useRef<HTMLCanvasElement>(null)
  const leadMarker = useRef<HTMLSpanElement>(null)
  const secondMarker = useRef<HTMLSpanElement>(null)
  const audio = useRef<ThumbAudio | null>(null)
  const contacts = useRef(new Map<number, Contact>())
  const fx = useRef({energy: .2, space: .3})
  const pitch = useRef<number | undefined>(undefined)
  const [ui, setUi] = useState<AudioSnapshot>({...empty, feeling: remembered?.feeling ?? 'bounce', hasPhrase: !!remembered?.phrase, canUndo: !!remembered?.previous})
  const [fingers, setFingers] = useState(0)
  const [muted, setMuted] = useState(remembered?.muted ?? false)
  const [error, setError] = useState('')
  const [started, setStarted] = useState(false)

  const clearContacts = () => {contacts.current.clear(); pitch.current = undefined; setFingers(0)}
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    const unlock = lockBodyScroll()
    const element = dialog.current!
    const engine = new ThumbAudio(remembered); audio.current = engine
    const activeContacts = contacts.current
    element.showModal()
    const field = createField(canvas.current!, backup.current!)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0, last = 0, lastUI = '', lastRunning = false
    const paint = (time: number) => {
      if (document.hidden) {raf = requestAnimationFrame(paint); return}
      const state = engine.snapshot
      if (lastRunning && !state.playing) {contacts.current.clear(); setFingers(0)}
      lastRunning = state.playing
      const lead = [...contacts.current.values()].find(c => c.role === 'lead')
      const second = [...contacts.current.values()].find(c => c.role === 'second')
      const target = second ? modulation(second.point, second.origin) : {energy: .2, space: .3}
      const delta = Math.min(1, (time - last) / 180)
      fx.current.energy += (target.energy - fx.current.energy) * delta
      fx.current.space += (target.space - fx.current.space) * delta
      if (lead) {
        pitch.current = noteFromPoint(lead.point, pitch.current)
        engine.update({pitch: pitch.current, tone: lead.point.x, ...fx.current})
      } else if (contacts.current.size) engine.update(null)
      if (time - last >= (state.playing || contacts.current.size ? 32 : 100)) {
        field.draw(time / 1000, {...state, lead: lead?.point ?? null, second: second?.point ?? null, reduced: reduced.matches})
        last = time
      }
      for (const [marker, contact] of [[leadMarker.current, lead], [secondMarker.current, second]] as const) {
        if (marker) {marker.hidden = !contact; if (contact) {marker.style.left = `${contact.point.x * 100}%`; marker.style.top = `${contact.point.y * 100}%`}}
      }
      const key = [state.playing, state.step, state.feeling, state.pending, state.hasPhrase, state.canUndo].join('|')
      if (key !== lastUI) {lastUI = key; setUi(state)}
      raf = requestAnimationFrame(paint)
    }
    raf = requestAnimationFrame(paint)
    const interrupt = () => {engine.stop(); contacts.current.clear(); setFingers(0)}
    const visibility = () => {if (document.hidden) interrupt()}
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('pagehide', interrupt)
    return () => {
      cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', interrupt)
      engine.stop(); remembered = engine.session; engine.dispose(); audio.current = null
      activeContacts.clear(); field.destroy(); element.close(); unlock()
      previousFocus?.focus({preventScroll: true})
    }
  }, [])

  function position(event: ReactPointerEvent): Point {
    const rect = surface.current!.getBoundingClientRect()
    return {x: clamp((event.clientX - rect.left) / rect.width), y: clamp((event.clientY - rect.top) / rect.height)}
  }
  function start() {
    setError(''); setStarted(true)
    void audio.current?.start().catch(reason => {
      audio.current?.cancel(); clearContacts()
      setError(reason instanceof Error ? reason.message : '声音没能启动，点「开始」再试试。')
    })
  }
  function down(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0 || contacts.current.size >= 2) return
    const point = position(event)
    const role = [...contacts.current.values()].some(contact => contact.role === 'lead') ? 'second' : 'lead'
    contacts.current.set(event.pointerId, {role, point, origin: point})
    event.currentTarget.setPointerCapture(event.pointerId)
    if (role === 'lead') {
      fx.current = {energy: .2, space: .3}; pitch.current = noteFromPoint(point)
      audio.current?.begin({pitch: pitch.current, tone: point.x, ...fx.current})
      start()
    }
    setFingers(contacts.current.size)
  }
  function move(event: ReactPointerEvent<HTMLDivElement>) {
    const contact = contacts.current.get(event.pointerId)
    if (contact) contact.point = position(event)
  }
  function up(event: ReactPointerEvent<HTMLDivElement>) {
    if (!contacts.current.has(event.pointerId)) return
    contacts.current.delete(event.pointerId)
    setFingers(contacts.current.size)
    if (!contacts.current.size) {audio.current?.release(); pitch.current = undefined}
  }
  function cancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (!contacts.current.has(event.pointerId)) return
    clearContacts(); audio.current?.cancel()
  }
  function transport() {
    if (ui.playing) {clearContacts(); audio.current?.stop()} else start()
  }
  const hint = fingers > 1 ? '两根手指，一起变个样' : fingers ? '松手后，听它接着演奏' : ui.playing && ui.hasPhrase ? '这段不错，再滑一次试试' : '按住滑一滑，松手听听'
  const helper = fingers > 1 ? '松开第二指，音乐慢慢回落' : fingers ? '再加一根手指，让音乐变个样' : ui.playing && ui.hasPhrase ? '按住试新花样，松手换成新的' : '随手滑，就能玩出一段音乐'
  return <dialog ref={dialog} className="synth-dialog" aria-labelledby="synth-title" onCancel={event => {event.preventDefault(); onClose()}}>
    <div className="synth-screen">
      <header className="synth-top"><Button className="synth-back" onClick={onClose}><ChevronLeft size={22}/>返回手册</Button><Button className="synth-sound" aria-label={muted ? '打开声音' : '静音'} aria-pressed={muted} onClick={() => {setMuted(!muted); audio.current?.setMuted(!muted)}}>{muted ? <VolumeX size={22}/> : <Volume2 size={22}/>}</Button></header>
      <div className="synth-intro"><h1 id="synth-title">拇指合成器</h1><p>{hint}</p></div>
      <div ref={surface} className="synth-surface" role="application" aria-label="演奏区：按住并滑动，上下改变高低，左右改变柔亮；第二指改变热闹程度与空间。键盘方向键演奏，空格松手。" tabIndex={0}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} onLostPointerCapture={cancel}
        onKeyDown={event => {
          if (event.key === ' ' || event.key === 'Enter') {event.preventDefault(); if (contacts.current.has(-1)) {contacts.current.delete(-1); setFingers(0); audio.current?.release()} else {const point = {x: .5, y: .5}; contacts.current.set(-1, {role: 'lead', point, origin: point}); audio.current?.begin({pitch: noteFromPoint(point), tone: .5, ...fx.current}); setFingers(1); start()}}
          if (event.key.startsWith('Arrow')) {event.preventDefault(); let c = contacts.current.get(-1); if (!c) {const point = {x: .5, y: .5}; c = {role: 'lead', point, origin: {...point}}; contacts.current.set(-1, c); audio.current?.begin({pitch: noteFromPoint(point), tone: .5, ...fx.current}); setFingers(1); start()} c.point = {x: clamp(c.point.x + (event.key === 'ArrowRight' ? .1 : event.key === 'ArrowLeft' ? -.1 : 0)), y: clamp(c.point.y + (event.key === 'ArrowDown' ? .1 : event.key === 'ArrowUp' ? -.1 : 0))}}
        }} onBlur={() => {if (contacts.current.has(-1)) {contacts.current.delete(-1); setFingers(0); audio.current?.release()}}}>
        <canvas ref={canvas} aria-hidden="true"/><canvas ref={backup} hidden aria-hidden="true"/>
        <span ref={leadMarker} hidden className="synth-contact synth-lead" aria-hidden="true"/><span ref={secondMarker} hidden className="synth-contact synth-second" aria-hidden="true"/>
        {!started && !fingers && <div className="synth-first"><span/>从这里开始</div>}
        {ui.playing && ui.hasPhrase && !fingers && <div className="synth-loop-label"><i/>正在循环</div>}
      </div>
      <footer className="synth-controls">
        <div className="synth-progress" aria-hidden="true">{Array.from({length: 8}, (_, i) => <i key={i} className={ui.playing && i === Math.floor(ui.step / 16) ? 'lit' : ''}/>)}</div>
        <p className="synth-helper" aria-live="polite">{error || helper}</p>
        <div className="synth-feelings" role="group" aria-label="换个感觉">{FEELINGS.map(({id, label}) => <Button key={id} className={`synth-feeling ${ui.feeling === id ? 'selected' : ''}`} aria-pressed={ui.feeling === id} aria-label={`${label}${ui.pending === id ? '，下一段切换' : ''}`} onClick={() => audio.current?.setFeeling(id as Feeling)}>{label}{ui.pending === id && <span className="synth-pending"/>}</Button>)}</div>
        <div className="synth-actions"><Button className="synth-undo" disabled={!ui.canUndo} onClick={() => audio.current?.undo()}><Undo2 size={23}/>用回刚才的</Button><Button className="synth-transport" onClick={transport}>{ui.playing ? <Square size={20}/> : <Play size={21}/>}<span>{ui.playing ? '停止' : ui.hasPhrase ? '继续' : '开始'}</span></Button></div>
      </footer>
    </div>
  </dialog>
}
