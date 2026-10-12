import {useLayoutEffect, useRef, useState} from 'react'

const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)')

// CSS is the single source of truth for timing, including delayed unmounts.
function motionDuration(token: string) {
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
  return (parseFloat(value) || 0) * (value.endsWith('ms') ? 1 : 1000)
}

// Keep a closing surface mounted so its dialog, scroll lock and focus lifecycle
// survive until exit completes. Reopening cancels the pending removal.
export function usePresence<T>(value: T | null) {
  const [retained, setRetained] = useState(value)
  if (value !== null && value !== retained) setRetained(value)
  const exiting = value === null && retained !== null
  useLayoutEffect(() => {
    if (!exiting) return
    const media = reducedMotion()
    const finish = () => setRetained(null)
    if (media.matches) {finish(); return}
    const timer = window.setTimeout(finish, motionDuration('--motion-exit'))
    const change = () => {if (media.matches) finish()}
    media.addEventListener('change', change)
    return () => {clearTimeout(timer); media.removeEventListener('change', change)}
  }, [exiting])
  return {value: value ?? retained, exiting}
}

// A single, interruptible fade for changed content. Never remounts a canvas or
// hides initial content; URL changes unrelated to the supplied key do nothing.
export function useContentMotion<T extends HTMLElement>(key: string) {
  const ref = useRef<T>(null)
  const previous = useRef(key)
  useLayoutEffect(() => {
    if (previous.current === key) return
    previous.current = key
    const element = ref.current
    const media = reducedMotion()
    if (!element || media.matches || !element.animate) return
    const animation = element.animate([{opacity: .55}, {opacity: 1}], {
      duration: motionDuration('--motion-content'),
      easing: getComputedStyle(document.documentElement).getPropertyValue('--motion-ease-out').trim(),
    })
    const cancel = () => {if (media.matches) animation.cancel()}
    media.addEventListener('change', cancel)
    return () => {animation.cancel(); media.removeEventListener('change', cancel)}
  }, [key])
  return ref
}
