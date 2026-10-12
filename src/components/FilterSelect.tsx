import {useEffect, useId, useRef, useState} from 'react'
import type {KeyboardEvent} from 'react'
import {Check, ChevronDown} from 'lucide-react'

export type FilterOption = {value: string; label: string; triggerLabel?: string; kind?: string}
export type FilterGroup = {label?: string; options: FilterOption[]}

// Popovers enter the top layer, including when the trigger is inside the fullscreen dialog.
export function FilterSelect({label, value, groups, onChange}: {
  label: string; value: string; groups: FilterGroup[]; onChange: (value: string) => void
}) {
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const popup = useRef<HTMLDivElement>(null)
  const search = useRef({text: '', time: 0})
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const options = groups.flatMap(group => group.options)
  const selected = Math.max(0, options.findIndex(option => option.value === value))
  const current = options[selected]

  useEffect(() => {
    if (!open) return
    const dismiss = () => {
      popup.current?.hidePopover()
      trigger.current?.focus({preventScroll: true})
    }
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && popup.current?.contains(event.target)) return
      dismiss()
    }
    window.addEventListener('resize', dismiss)
    window.addEventListener('scroll', onScroll, true)
    window.visualViewport?.addEventListener('resize', dismiss)
    return () => {
      window.removeEventListener('resize', dismiss)
      window.removeEventListener('scroll', onScroll, true)
      window.visualViewport?.removeEventListener('resize', dismiss)
    }
  }, [open])

  const move = (index: number) => {
    setActive(index)
    popup.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.scrollIntoView({block: 'nearest'})
  }
  const close = (restoreFocus = true) => {
    popup.current?.hidePopover()
    if (restoreFocus) trigger.current?.focus({preventScroll: true})
  }
  const show = (index = selected) => {
    const element = popup.current!
    const rect = trigger.current!.getBoundingClientRect()
    const viewport = window.visualViewport
    const leftEdge = viewport?.offsetLeft ?? 0
    const topEdge = viewport?.offsetTop ?? 0
    const width = viewport?.width ?? innerWidth
    const height = viewport?.height ?? innerHeight
    const menuWidth = Math.min(300, width - 24)
    const below = topEdge + height - rect.bottom - 18
    const above = rect.top - topEdge - 18
    const upwards = below < 260 && above > below
    element.style.setProperty('--popover-offset', upwards ? 'calc(-1 * var(--motion-nudge))' : 'var(--motion-nudge)')
    element.style.width = `${menuWidth}px`
    element.style.left = `${Math.max(leftEdge + 12, Math.min(rect.left, leftEdge + width - menuWidth - 12))}px`
    element.style.maxHeight = `${Math.max(44, Math.min(500, upwards ? above : below))}px`
    element.style.top = upwards ? 'auto' : `${rect.bottom + 6}px`
    element.style.bottom = upwards ? `${innerHeight - rect.top + 6}px` : 'auto'
    element.showPopover()
    move(index)
    element.focus({preventScroll: true})
  }
  const select = (index: number) => {onChange(options[index].value); close()}
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const {key} = event
    if (key === 'ArrowDown' || key === 'ArrowUp') {
      event.preventDefault(); move((active + (key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
    } else if (key === 'Home' || key === 'End') {
      event.preventDefault(); move(key === 'Home' ? 0 : options.length - 1)
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault(); select(active)
    } else if (key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); close()
    } else if (key === 'Tab') {
      // Resume normal tab order from the trigger instead of the popup's position in the DOM.
      close()
    } else if (key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      const now = Date.now()
      search.current = {text: (now - search.current.time < 700 ? search.current.text : '') + key.toLowerCase(), time: now}
      const match = options.findIndex(option => option.label.toLowerCase().startsWith(search.current.text))
      if (match >= 0) move(match)
    }
  }
  let index = 0
  return <>
    <button ref={trigger} className={`filter-select-trigger ${value !== 'all' ? 'is-filtered' : ''}`} aria-label={`${label}：${current.triggerLabel ?? current.label}`}
      aria-haspopup="listbox" aria-expanded={open} aria-controls={id} title={current.triggerLabel ?? current.label}
      onClick={() => open ? close() : show()} onKeyDown={event => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {event.preventDefault(); show(event.key === 'ArrowUp' ? options.length - 1 : selected)}
      }}>
      <span>{current.triggerLabel ?? current.label}</span><ChevronDown size={14} aria-hidden="true"/>
    </button>
    <div ref={popup} id={id} popover="auto" role="listbox" tabIndex={-1} aria-label={label} aria-activedescendant={`${id}-option-${active}`}
      className="filter-select-menu" onKeyDown={onKeyDown} onToggle={event => setOpen(event.newState === 'open')}
      onBlur={event => {if (!event.currentTarget.contains(event.relatedTarget)) close(false)}}>
      {groups.map((group, groupIndex) => <div key={group.label ?? groupIndex} role={group.label ? 'group' : undefined} aria-label={group.label} className="filter-option-group">
        {group.label && <div className="filter-group-heading" aria-hidden="true">{group.label}</div>}
        {group.options.map(option => {
          const optionIndex = index++
          return <div key={option.value} id={`${id}-option-${optionIndex}`} data-index={optionIndex} role="option" aria-selected={option.value === value}
            className={`filter-option ${optionIndex === active ? 'is-active' : ''} ${option.kind ? 'is-subtype' : ''}`}
            onPointerMove={() => setActive(optionIndex)} onPointerDown={event => event.preventDefault()} onClick={() => select(optionIndex)}>
            {option.kind && <span className={`kind-dot ${option.kind}`} aria-hidden="true"/>}<span>{option.label}</span>{option.value === value && <Check size={15} aria-hidden="true"/>}
          </div>
        })}
      </div>)}
    </div>
  </>
}
