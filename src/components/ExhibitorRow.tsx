import {Link} from 'react-router'
import {Bookmark, Check, ChevronRight} from 'lucide-react'
import type {Exhibitor} from '../data/festival'
import {Button} from '../design-system/Button'
import {ListRow} from '../design-system/ListRow'
import {usePersonal} from '../personal'
import {useDetailPanel} from './detailContext'

export function ExhibitorRow({exhibitor: e, compact = false}: {exhibitor: Exhibitor; compact?: boolean}) {
  const {personal, toggle} = usePersonal()
  const {detailPath} = useDetailPanel()
  const saved = personal.brands.includes(e.id)
  const visited = personal.visited.includes(e.id)
  return <ListRow className="exhibitor-row" saved={saved} visited={visited} inspected={detailPath === `/exhibitors/${e.id}`}>
    <Link to={`/exhibitors/${e.id}`} className="list-row-open exhibitor-main">
      <span className={`list-row-identity booth-code mono ${e.floor === 2 ? 'indie' : ''}`}>{e.floor === 1 ? e.booth : '2F'}</span>
      <div className="list-row-copy"><h2>{e.name}</h2><p className="exhibitor-summary">{e.profile.summary}</p>
        <div className="list-row-meta">{!compact && <span>{e.profile.topics.join(' · ')}</span>}{visited && <span className="visited-label"><Check size={12}/>已逛</span>}</div>
      </div><ChevronRight size={17} className="list-row-chevron" aria-hidden="true"/>
    </Link>
    <Button className={`icon-btn list-row-action ${saved ? 'selected' : ''}`} aria-label={`${saved ? '取消收藏' : '收藏'} ${e.name}`} aria-pressed={saved} onClick={() => toggle('brands', e.id)}><Bookmark size={18} fill={saved ? 'currentColor' : 'none'}/></Button>
  </ListRow>
}
