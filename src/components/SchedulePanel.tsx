import {useEffect, useRef, useState} from 'react'
import type {ReactNode} from 'react'
import {GanttChart, Maximize2, Minimize2} from 'lucide-react'
import {lockBodyScroll} from './scrollLock'

export function SchedulePanel({count, scopeControl, children}: {count: number; scopeControl: ReactNode; children: ReactNode}) {
  const [expanded, setExpanded] = useState(false)
  const panel = useRef<HTMLDialogElement>(null)
  const expandButton = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const element = panel.current!
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    let unlock = () => {}
    // The same canvas stays mounted, preserving its scroll position and filters.
    element.close()
    if (expanded) {
      element.showModal()
      unlock = lockBodyScroll()
      expandButton.current?.focus({preventScroll: true})
    } else {
      element.show()
      previousFocus?.focus({preventScroll: true})
    }
    window.dispatchEvent(new Event('schedule-panel-mode'))
    return () => {
      element.close()
      unlock()
      queueMicrotask(() => window.dispatchEvent(new Event('schedule-panel-mode')))
    }
  }, [expanded])

  return <dialog ref={panel} className={`schedule-panel ${expanded ? 'is-expanded' : ''}`}
    role={expanded ? 'dialog' : 'region'} aria-label="全景日程" aria-modal={expanded || undefined}
    onCancel={e => {e.preventDefault(); setExpanded(false)}}>
    <header className="schedule-panel-heading">
      <div className="panel-title"><GanttChart size={19}/><h2>全景日程</h2><span className="panel-count mono">{count} 场</span></div>
      {scopeControl}
      <button ref={expandButton} className="secondary-btn panel-expand" aria-label={expanded?'退出全屏':'全屏查看'} title={expanded?'退出全屏':'全屏查看'} onClick={() => setExpanded(x => !x)}>
        {expanded ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}<span>{expanded ? '退出全屏' : '全屏查看'}</span>
      </button>
    </header>
    {children}
  </dialog>
}
