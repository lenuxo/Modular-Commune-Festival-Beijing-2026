import {useCallback, useEffect, useRef, useState} from 'react'
import type {ComponentType} from 'react'
import {ChevronUp} from 'lucide-react'
import {Button} from '../design-system/Button'
import './synth.css'

const THRESHOLD = 88
export function SynthLauncher() {
  const [Synth, setSynth] = useState<ComponentType<{onClose: () => void}> | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failure, setFailure] = useState('')
  const [pull, setPull] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const loadingRef = useRef(false)
  const openRef = useRef(false)
  const mounted = useRef(false)
  useEffect(() => {openRef.current = open}, [open])
  useEffect(() => {mounted.current = true; return () => {mounted.current = false}}, [])
  const openSynth = useCallback(() => {
    if (loadingRef.current || openRef.current) return
    setFailure(''); loadingRef.current = true; setLoading(true)
    void import('./ThumbSynth').then(module => {
      if (!mounted.current) return
      setSynth(() => module.default); setOpen(true)
    }).catch(() => {if (mounted.current) setFailure('声音屏幕暂时没打开，点这里再试试。')}).finally(() => {loadingRef.current = false; if (mounted.current) setLoading(false)})
  }, [])
  useEffect(() => {
    const home = root.current?.closest<HTMLElement>('.visit-home')
    let anchor: number | null = null, lastY = 0, startX = 0, distance = 0, tracking = false
    const atBottom = () => document.documentElement.scrollHeight - window.innerHeight - window.scrollY <= 5
    const reset = () => {anchor = null; distance = 0; tracking = false; setPull(0); if (home) home.style.translate = ''}
    const start = (event: TouchEvent) => {
      if (openRef.current || loadingRef.current || event.touches.length !== 1) return
      tracking = true; lastY = event.touches[0].clientY; startX = event.touches[0].clientX
      anchor = atBottom() ? lastY : null
    }
    const move = (event: TouchEvent) => {
      if (!tracking || openRef.current || event.touches.length !== 1) {reset(); return}
      const touch = event.touches[0], y = touch.clientY
      if (Math.abs(touch.clientX - startX) > 70 && distance === 0) {reset(); return}
      if (anchor === null) {if (atBottom() && y < lastY) anchor = lastY; lastY = y; return}
      distance = Math.min(160, Math.max(0, (anchor - y) * .75))
      if (distance > 0 && event.cancelable) event.preventDefault()
      setPull(distance)
      if (home) home.style.translate = `0 ${-distance * .22}px`
    }
    const end = (event: TouchEvent) => {
      if (!tracking) return
      const enter = distance >= THRESHOLD && event.type !== 'touchcancel'
      if (distance > 0 && event.cancelable) event.preventDefault()
      reset()
      if (enter) openSynth()
    }
    document.addEventListener('touchstart', start, {passive: true})
    document.addEventListener('touchmove', move, {passive: false})
    document.addEventListener('touchend', end, {passive: false})
    document.addEventListener('touchcancel', end, {passive: true})
    return () => {document.removeEventListener('touchstart', start); document.removeEventListener('touchmove', move); document.removeEventListener('touchend', end); document.removeEventListener('touchcancel', end); if (home) home.style.translate = ''}
  }, [openSynth])
  return <div ref={root} className="synth-launch">
    <div className="synth-launch-line" aria-hidden="true"/>
    <Button className="synth-launch-button" aria-haspopup="dialog" onClick={openSynth}><ChevronUp size={17}/><span>{failure || '继续上拉，玩一点声音'}</span></Button>
    {pull > 0 && <div className="synth-pull-preview" style={{height: 60 + pull * 1.8}} aria-hidden="true"><ChevronUp size={20}/><strong>{pull >= THRESHOLD ? '松手开始' : '继续上拉，玩一点声音'}</strong><div className="synth-preview-dots"/></div>}
    {loading && <div className="synth-loading" role="status">正在打开声音屏幕…</div>}
    {open && Synth && <Synth onClose={() => setOpen(false)}/>}
  </div>
}
