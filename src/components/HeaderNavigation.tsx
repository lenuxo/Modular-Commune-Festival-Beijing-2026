import {useEffect, useRef, useState} from 'react'
import {Link, useLocation} from 'react-router'
import {ChevronRight, House} from 'lucide-react'
import {events, exhibitors, eventDisplayTitle} from '../data/festival'

type Visit = {key: string; pathname: string; search: string}
type Crumb = {label: string; to?: string}

export function HeaderNavigation() {
  const location = useLocation()
  const [trail, setTrail] = useState<Visit[]>([location])
  const lastKey = useRef(location.key)
  useEffect(() => {
    const previousKey = lastKey.current
    lastKey.current = location.key
    setTrail(previous => {
      if (previous.some(visit => visit.key === location.key)) return previous
      const index = previous.findIndex(visit => visit.key === previousKey)
      return [...previous.slice(0, index + 1), location]
    })
  }, [location])
  const index = trail.findIndex(visit => visit.key === location.key)
  const earlier = trail.slice(0, index < 0 ? trail.length : index)
  const parent = (path: string, fallback = path) => {
    const visit = earlier.findLast(visit => visit.pathname === path)
    return visit ? visit.pathname + visit.search : fallback
  }
  const params = new URLSearchParams(location.search)
  const path = location.pathname
  let id = path.split('/').slice(2).join('/')
  try {id = decodeURIComponent(id)} catch { /* Invalid URLs fall through to the missing-item page. */ }
  let fallback = '/'
  let crumbs: Crumb[] = []
  if (path.startsWith('/events/')) {
    const event = events.find(event => event.id === id)
    fallback = parent('/schedule', `/schedule${event ? `?day=${event.day}` : ''}`)
    crumbs = [{label:'日程', to:fallback}, {label:event ? eventDisplayTitle(event) : '活动详情'}]
  } else if (path.startsWith('/artists/')) {
    const event = events.find(event => event.artistId === id)
    fallback = event ? `/events/${event.id}` : '/schedule'
    crumbs = [{label:'日程', to:parent('/schedule')}, ...(event ? [{label:eventDisplayTitle(event), to:fallback}] : []), {label:event?.presenter ?? '艺术家资料'}]
  } else if (path.startsWith('/exhibitors/')) {
    const exhibitor = exhibitors.find(exhibitor => exhibitor.id === id)
    fallback = parent('/exhibitors')
    crumbs = [{label:'展商', to:fallback}, {label:exhibitor?.name ?? '展商详情'}]
  } else if (path === '/schedule') {
    const mode = params.get('view') === 'panorama' ? (params.get('scope') === 'festival' ? '整个展期' : '单日全景') : '日程列表'
    const day = params.get('day')
    const toList = new URLSearchParams(params); toList.set('view','list')
    crumbs = [{label:'日程', to:`/schedule?${toList}`}, {label:day && mode !== '整个展期' ? `10/${day} · ${mode}` : mode}]
  } else if (path === '/map') {
    const layer = params.get('layer') ?? 'venues'
    const label = ({venues:'场馆总图',first:'一层展位',second:'二层开发者',floors:'功能分区'} as Record<string,string>)[layer] ?? '场馆总图'
    crumbs = [{label:'地图', to:'/map'}, {label}]
  } else {
    crumbs = [{label:({'/':'概览','/exhibitors':'展商','/mine':'我的观展','/search':'搜索','/guide':'参观须知'} as Record<string,string>)[path] ?? '页面未找到'}]
  }
  return <div className="header-navigation">
    <nav className="header-breadcrumbs" aria-label="面包屑导航"><ol>
      <li className="breadcrumb-home">{path === '/' ? <span aria-current="page" title="概览"><House size={16}/><span>概览</span></span> : <Link to="/" aria-label="回到概览" title="概览"><House size={16}/></Link>}</li>
      {path !== '/' && crumbs.map((crumb, i) => <li key={i} className={i === crumbs.length - 1 ? 'breadcrumb-current' : ''}><ChevronRight size={13} aria-hidden="true"/>{i === crumbs.length - 1 ? <span aria-current="page" title={crumb.label}>{crumb.label}</span> : <Link to={crumb.to!} title={crumb.label}>{crumb.label}</Link>}</li>)}
    </ol></nav>
  </div>
}
