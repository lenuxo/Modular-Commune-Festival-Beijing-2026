import {useEffect, useRef} from 'react'
import {Link} from 'react-router'
import {ArrowUpRight, Bookmark, X} from 'lucide-react'
import type {FestivalEvent} from '../data/festival'
import {eventKindLabel,presenterRole,eventDisplayTitle} from '../data/festival'
import {usePersonal} from '../personal'
import {EventMeta} from './shared'
import {lockBodyScroll} from './scrollLock'

export function EventPreview({event, onClose}: {event: FestivalEvent; onClose: () => void}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const {personal, toggle} = usePersonal()
  const saved = personal.saved.includes(event.id)

  useEffect(() => {
    const element = dialog.current!
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
    const unlock = lockBodyScroll()
    return () => {
      element.close()
      unlock()
      if (trigger?.isConnected) trigger.focus({preventScroll: true})
    }
  }, [])

  return <dialog ref={dialog} className="event-preview" aria-labelledby="event-preview-title"
    onCancel={onClose} onClose={e => {
      // Strict Mode's cleanup can queue a close event after setup reopens it.
      if (!e.currentTarget.open) onClose()
    }}
    onClick={e => {
      if (e.target !== e.currentTarget) return
      const bounds = e.currentTarget.getBoundingClientRect()
      if (e.clientX < bounds.left || e.clientX > bounds.right || e.clientY < bounds.top || e.clientY > bounds.bottom) onClose()
    }}>
    <div className="preview-heading">
      <span className="detail-kind"><span className={`kind-dot ${event.kind}`}/>{eventKindLabel(event.kind)}</span>
      <button className="icon-btn" aria-label="关闭活动预览" onClick={onClose}><X size={20}/></button>
    </div>
    <h2 id="event-preview-title">{eventDisplayTitle(event)}</h2>
    {event.presenter && event.presenter !== event.title && <p className="detail-presenter">{presenterRole(event)}：{event.presenter}</p>}
    <p className="preview-description">{event.description}</p>
    <EventMeta event={event}/>
    {event.details.alert&&<p className="inline-notice">{event.details.alert}</p>}
    <div className="preview-actions">
      <button className="secondary-btn" aria-pressed={saved} onClick={() => toggle('saved', event.id)}>
        <Bookmark size={17} fill={saved ? 'currentColor' : 'none'}/>{saved ? '已加入我的日程' : '加入我的日程'}
      </button>
      <Link className="primary-btn" to={`/events/${event.id}`}>查看详情<ArrowUpRight size={17}/></Link>
    </div>
  </dialog>
}
