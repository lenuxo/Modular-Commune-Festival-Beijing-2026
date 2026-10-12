import {useEffect, useRef} from 'react'
import {NavLink} from 'react-router'
import {ArrowRight, Bookmark, Info, Search, X} from 'lucide-react'
import type {LucideIcon} from 'lucide-react'
import {lockBodyScroll} from './scrollLock'

const descriptions: Record<string, string> = {
  '/': '展会概况与快捷入口',
  '/schedule': '活动列表与全景时间轴',
  '/map': '场馆、楼层与展位定位',
  '/exhibitors': '品牌与独立开发者',
  '/mine': '收藏日程与想逛清单',
}

export function NavigationMenu({items, savedCount, status, onClose, exiting}: {
  items: {path: string; label: string; icon: LucideIcon}[]
  savedCount: number
  status: string
  onClose: () => void
  exiting: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const element = dialog.current!
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    element.showModal()
    const unlock = lockBodyScroll()
    const desktop = matchMedia('(min-width: 640px)')
    const adapt = () => {if (desktop.matches) onClose()}
    desktop.addEventListener('change', adapt)
    return () => {
      desktop.removeEventListener('change', adapt)
      element.close()
      unlock()
      if (trigger?.isConnected) trigger.focus({preventScroll: true})
    }
  }, [onClose])

  return <dialog id="global-menu" ref={dialog} className="navigation-menu" aria-labelledby="navigation-menu-title" data-exiting={exiting} inert={exiting}
    onCancel={event => {event.preventDefault(); if (!exiting) onClose()}}
    onClick={e => {
      if (exiting || e.target !== e.currentTarget) return
      const rect = e.currentTarget.getBoundingClientRect()
      if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) onClose()
    }}>
    <header className="navigation-menu-heading">
      <div><h2 id="navigation-menu-title">交流方式观展手册</h2><span className="mono">BEIJING 2026 · 10/21—25</span></div>
      <button className="icon-btn" aria-label="关闭全局菜单" onClick={onClose}><X size={21}/></button>
    </header>
    <NavLink className="menu-search" to="/search" onClick={onClose} aria-label="全局搜索"><Search size={19}/><span>搜索活动、艺术家、展商…</span><ArrowRight size={16}/></NavLink>
    <nav aria-label="全局导航">
      {items.map(({path, label, icon: Icon}) => <NavLink key={path} to={path} end={path === '/'} onClick={onClose}>
        {({isActive}) => <><Icon size={21}/><span><strong>{label === '我的' ? '我的观展' : label}</strong><small>{descriptions[path]}</small></span>
          {isActive ? <span className="menu-current">当前</span> : path === '/mine' && savedCount > 0 ? <span className="menu-saved mono"><Bookmark size={12}/>{savedCount}</span> : <ArrowRight size={17}/>}</>}
      </NavLink>)}
    </nav>
    <footer className="navigation-menu-footer">
      <NavLink to="/guide" onClick={onClose}><Info size={17}/>参观须知<ArrowRight size={16}/></NavLink>
      <span><i className="status-dot"/>{status}</span>
    </footer>
  </dialog>
}
