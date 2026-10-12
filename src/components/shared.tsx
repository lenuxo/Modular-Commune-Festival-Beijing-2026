import {Button} from '../design-system/Button'
import {Link} from 'react-router'
import {ArrowUpRight, Bookmark, MapPin, ArrowLeft, CalendarDays} from 'lucide-react'
import type {ReactNode} from 'react'
import {eventKindLabel, venues, eventTime, clock, weekdays} from '../data/festival'
import type {FestivalEvent} from '../data/festival'
import {usePersonal} from '../personal'
import {useDetailPanel} from './detailContext'
export function PageHead({title,subtitle,action}:{title:string;subtitle:string;action?:ReactNode}){return <div className="page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{action}</div>}
export function Empty({title,body,children}:{title:string;body:string;children?:ReactNode}){return <div className="empty"><CalendarDays size={28}/><h2>{title}</h2><p>{body}</p>{children}</div>}
export function Source({url,label='查看官方资料'}:{url:string;label?:string}){return <a className="text-link" href={url} target="_blank" rel="noreferrer">{label}<ArrowUpRight size={15}/></a>}
export function Back(){return <Link className="text-link mb-6 detail-back-link" to="/schedule"><ArrowLeft size={16}/>返回日程</Link>}
export function EventRow({event:e,showDay=false,onOpen}:{event:FestivalEvent;showDay?:boolean;onOpen?:(event:FestivalEvent)=>void}){
 const {detailPath}=useDetailPanel();const {personal,toggle}=usePersonal();const saved=personal.saved.includes(e.id)
 const time=<div className="event-time mono">{showDay&&<small>10/{e.day} {weekdays[e.day]}</small>}<strong>{Number(e.start.slice(8,10))!==e.day&&<small>次日</small>}{clock(e.start)}</strong>{e.end&&<span>{clock(e.end)}</span>}</div>
 const copy=<><div className="flex items-center gap-2 mb-2"><span className={`kind-dot ${e.kind}`}/><span className="meta">{eventKindLabel(e.kind)}</span>{saved&&<span className="saved-tag">已收藏</span>}</div><h3>{e.title}</h3><p><MapPin size={13}/>{venues[e.venue].name} · {e.stage}</p></>
 return <article className={`event-row ${detailPath===`/events/${e.id}`?'is-inspected':''}`}>
 {onOpen?<Button className="event-row-open" aria-haspopup="dialog" aria-label={`${e.title}，${clock(e.start)}，查看活动详情`} onClick={()=>onOpen(e)}>{time}<div className="event-copy">{copy}</div></Button>:<>{time}<Link className="event-copy" to={`/events/${e.id}`}>{copy}</Link></>}
 <Button className={`icon-btn save-btn ${saved?'selected':''}`} aria-label={`${saved?'取消收藏':'收藏'} ${e.title}`} aria-pressed={saved} onClick={()=>toggle('saved',e.id)}><Bookmark size={19} fill={saved?'currentColor':'none'}/></Button></article>
}
export function EventMeta({event:e}:{event:FestivalEvent}){return <dl className="material-inset detail-facts"><div><dt>时间</dt><dd className="mono">10/{e.day} {weekdays[e.day]} · {eventTime(e)}</dd></div><div><dt>地点</dt><dd>{venues[e.venue].name}<small>{e.stage}</small></dd></div><div><dt>参与</dt><dd>{e.price}{e.capacity&&<small>官方公布容量 {e.capacity} 人 · 不代表剩余名额</small>}</dd></div></dl>}
