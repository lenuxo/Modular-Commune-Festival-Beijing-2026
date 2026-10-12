import {useCallback,useEffect,useLayoutEffect,useRef,useState} from 'react'
import type {ReactNode,MouseEvent} from 'react'
import {createPortal} from 'react-dom'
import {Link,useLocation,useNavigate} from 'react-router'
import {ArrowLeft,ExternalLink,X} from 'lucide-react'
import {EventDetail,ArtistDetail} from '../pages/Details'
import {ExhibitorDetail} from '../pages/Exhibitors'
import {events,exhibitors,eventDisplayTitle} from '../data/festival'
import {lockBodyScroll} from './scrollLock'
import {DetailContext} from './detailContext'
import {useContentMotion,usePresence} from './motion'

const detailPattern=/^\/(events|exhibitors|artists)\/[^/]+$/

export function DetailProvider({children}:{children:ReactNode}){
 const location=useLocation();const navigate=useNavigate()
 const params=new URLSearchParams(location.search);const requested=params.get('detail')
 const detailPath=requested&&detailPattern.test(requested)?requested:null
 const presence=usePresence(detailPath)
 const trail:string[]=detailPath?(location.state?.detailTrail??[detailPath]):[]
 const openDetail=useCallback((path:string,nested=false)=>{
  if(!detailPattern.test(path))return
  const query=new URLSearchParams(location.search);const existing=query.get('detail')
  if(existing===path)return
  query.set('detail',path)
  const nextTrail=existing&&nested?[...(location.state?.detailTrail??[existing]),path]:[path]
  navigate({pathname:location.pathname,search:`?${query}`},{replace:!!existing,state:{...location.state,detailPanelEntry:existing?location.state?.detailPanelEntry:true,detailTrail:nextTrail}})
 },[location,navigate])
 const close=()=>{
  if(location.state?.detailPanelEntry){navigate(-1);return}
  const query=new URLSearchParams(location.search);query.delete('detail')
  navigate({pathname:location.pathname,search:query.size?`?${query}`:''},{replace:true,state:null})
 }
 const back=()=>{
  const nextTrail=trail.slice(0,-1);const query=new URLSearchParams(location.search);query.set('detail',nextTrail.at(-1)!)
  navigate({pathname:location.pathname,search:`?${query}`},{replace:true,state:{...location.state,detailTrail:nextTrail}})
 }
 const capture=(event:MouseEvent<HTMLDivElement>)=>{
  if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return
  const link=event.target instanceof Element?event.target.closest<HTMLAnchorElement>('a[href]'):null
  if(!link||link.target||link.hasAttribute('download'))return
  const url=new URL(link.href,window.location.href)
  if(url.origin!==window.location.origin||!url.hash.startsWith('#/'))return
  const path=url.hash.slice(1).split('?')[0]
  if(detailPattern.test(path)){event.preventDefault();openDetail(path,!!link.closest('.detail-panel'))}
 }
 return <DetailContext.Provider value={{detailPath,openDetail}}><div className={presence.value?'detail-workspace detail-open':'detail-workspace'} onClickCapture={capture}>
  {children}
  {presence.value&&<DetailPanel path={presence.value} exiting={presence.exiting} canBack={trail.length>1} onBack={back} onClose={close}/>}
 </div></DetailContext.Provider>
}

function DetailPanel({path,exiting,canBack,onBack,onClose}:{path:string;exiting:boolean;canBack:boolean;onBack:()=>void;onClose:()=>void}){
 const [desktop,setDesktop]=useState(()=>matchMedia('(min-width:1024px)').matches)
 const dialog=useRef<HTMLDialogElement>(null);const body=useRef<HTMLDivElement>(null)
 const contentMotion=useContentMotion<HTMLDivElement>(path)
 const closeRef=useRef(onClose);useEffect(()=>{closeRef.current=onClose},[onClose])
 const trigger=useRef<HTMLElement|null>(null)
 const scrolls=useRef(new Map<string,number>());const previousPath=useRef(path)
 const [host,setHost]=useState<Element>(()=>document.querySelector('.schedule-panel.is-expanded')??document.body)
 useEffect(()=>{
  const change=()=>{
   const next=document.querySelector('.schedule-panel.is-expanded')??document.body
   if(next===host)return
   if(body.current)scrolls.current.set(previousPath.current,body.current.scrollTop)
   setHost(next)
  }
  window.addEventListener('schedule-panel-mode',change)
  return()=>window.removeEventListener('schedule-panel-mode',change)
 },[host])
 useEffect(()=>{const media=matchMedia('(min-width:1024px)');const change=()=>setDesktop(media.matches);media.addEventListener('change',change);return()=>media.removeEventListener('change',change)},[])
 useLayoutEffect(()=>{
  trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null
 },[])
 useEffect(()=>{
  const element=dialog.current!;element.close()
  const position=scrolls.current.get(previousPath.current)??0
  let unlock=()=>{}
  if(desktop)element.show();else {element.showModal();unlock=lockBodyScroll()}
  element.querySelector<HTMLButtonElement>('.detail-panel-close')?.focus({preventScroll:true})
  if(body.current)body.current.scrollTop=position
  const escape=(event:KeyboardEvent)=>{if(desktop&&!element.inert&&event.key==='Escape'&&!document.querySelector(':popover-open')){event.preventDefault();event.stopPropagation();closeRef.current()}}
  document.addEventListener('keydown',escape,true)
  return()=>{document.removeEventListener('keydown',escape,true);element.close();unlock()}
 },[desktop,host])
 // Restore focus after dialog cleanup; an exiting inert modal cannot accept it.
 useEffect(()=>()=>{if(trigger.current?.isConnected)trigger.current.focus({preventScroll:true})},[])
 useLayoutEffect(()=>{
  if(body.current)body.current.scrollTop=scrolls.current.get(path)??0
  previousPath.current=path
 },[path,host])
 let id=path.split('/').slice(2).join('/');try{id=decodeURIComponent(id)}catch{ /* Missing-item content handles invalid IDs. */ }
 const kind=path.split('/')[1]
 const event=kind==='events'?events.find(e=>e.id===id):kind==='artists'?events.find(e=>e.artistId===id):undefined
 const exhibitor=kind==='exhibitors'?exhibitors.find(e=>e.id===id):undefined
 const label=kind==='events'?'活动详情':kind==='exhibitors'?'展商详情':'艺术家资料'
 const title=exhibitor?.name??(event?(kind==='artists'?event.presenter:eventDisplayTitle(event)):label)
 const content=<dialog ref={dialog} className={`detail-panel ${desktop?'is-side':'is-modal'}`} aria-label={`${label}：${title}`} aria-modal={!desktop||undefined} data-exiting={exiting} inert={exiting}
  onCancel={event=>{event.preventDefault();if(!exiting)onClose()}} onClick={event=>{if(!exiting&&event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)onClose()}}}>
  <header className="detail-panel-header">{canBack&&<button className="icon-btn" aria-label="返回上一个详情" title="返回上一个详情" onClick={onBack}><ArrowLeft size={18}/></button>}<span>{label}</span><Link to={path} target="_blank" rel="noreferrer" className="icon-btn" aria-label="在新标签页打开详情" title="在新标签页打开详情"><ExternalLink size={17}/></Link><button className="icon-btn detail-panel-close" aria-label="关闭详情" title="关闭详情" onClick={onClose}><X size={21}/></button></header>
  <div ref={body} className="detail-panel-body" onScroll={()=>{if(body.current)scrolls.current.set(path,body.current.scrollTop)}}><div ref={contentMotion}>{kind==='events'?<EventDetail id={id}/>:kind==='exhibitors'?<ExhibitorDetail id={id}/>:<ArtistDetail id={id}/>}</div></div>
 </dialog>
 // A nonmodal panel must remain inside a fullscreen dialog to stay interactive in its top layer.
 return createPortal(content,host)
}
