let locks = 0
let previousOverflow = ''

// Multiple top-layer dialogs may coexist (fullscreen schedule + event preview).
export function lockBodyScroll() {
  if (locks === 0) {
    previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
  }
  locks += 1
  return () => {
    locks -= 1
    if (locks === 0) document.body.style.overflow = previousOverflow
  }
}
