import {useSearchParams} from 'react-router'
import {List, GanttChart, ArrowUpRight, Bookmark, ChevronDown, Info} from 'lucide-react'
import {events,days,weekdays,kinds,eventCategories,kindCategory,orderedKinds,venues,getDefaultDay,minute,clock} from '../data/festival'
import type {FestivalEvent,Kind} from '../data/festival'
import {usePersonal} from '../personal'
import {PageHead,EventRow,Empty} from '../components/shared'
import {useDetailPanel} from '../components/detailContext'
import {SchedulePanel} from '../components/SchedulePanel'
import {FilterSelect} from '../components/FilterSelect'
import {useContentMotion} from '../components/motion'
export function Schedule(){
 const [params,setParams]=useSearchParams();const {personal}=usePersonal()
 const {openDetail}=useDetailPanel();const openEvent=(event:FestivalEvent)=>openDetail(`/events/${event.id}`)
 const day=days.includes(Number(params.get('day')))?Number(params.get('day')):getDefaultDay()
 const view=params.get('view')==='panorama'?'panorama':'list';const scope=params.get('scope')==='festival'?'festival':'day'
 const kind=params.get('kind')??'all';const venue=params.get('venue')??'all';const mine=params.get('mine')==='1'
 const requestedCategory=params.get('category')??(kind in kindCategory?kindCategory[kind as Kind]:'all')
 const category=requestedCategory in eventCategories?requestedCategory:'all'
 const typeValue=kind in kindCategory?`kind:${kind}`:category!=='all'?`category:${category}`:'all'
 const chooseType=(value:string)=>setParams(p=>{
  const n=new URLSearchParams(p);n.delete('kind');n.delete('category')
  const [level,key]=value.split(':')
  if(level==='category'&&key in eventCategories)n.set('category',key)
  if(level==='kind'&&key in kindCategory){n.set('kind',key);n.set('category',kindCategory[key as Kind])}
  return n
 })
 const update=(key:string,value:string)=>setParams(p=>{const n=new URLSearchParams(p);n.set(key,value);return n})
 const filtered=events.filter(e=>(category==='all'||kindCategory[e.kind]===category)&&(kind==='all'||e.kind===kind)&&(venue==='all'||e.venue===venue)&&(!mine||personal.saved.includes(e.id)))
 const daily=filtered.filter(e=>e.day===day)
 const chooseDay=(d:number)=>setParams(p=>{const n=new URLSearchParams(p);n.set('day',String(d));n.set('scope','day');return n})
 const resultMotion=useContentMotion<HTMLElement>(`${day}:${typeValue}:${venue}:${mine}:${view}`)
 const count=view==='panorama'&&scope==='festival'?filtered.length:daily.length
 const dates=<div className="date-tabs">{days.map(d=><button key={d} aria-pressed={d===day} className={d===day?'active':''} onClick={()=>update('day',String(d))}><span className="mono">10/{d}</span><span>{weekdays[d]}{d<23?' · 提前活动':''}</span><i>{filtered.filter(e=>e.day===d).length} 场</i></button>)}</div>
 const panoramaDates=<nav className="panorama-dates" aria-label="全景日期">{days.map(d=>{const total=filtered.filter(e=>e.day===d).length;return <button key={d} aria-pressed={d===day} aria-label={`10月${d}日，${weekdays[d]}${d<23?'，提前活动':''}，${total}场`} className={d===day?'active':''} onClick={()=>update('day',String(d))}><span className="mono">10/{d}</span><span className="panorama-weekday">{weekdays[d]}</span><span className="panorama-date-count">{total} 场</span></button>})}</nav>
 const filters=<div className="schedule-filters" role="group" aria-label="日程筛选">
  <FilterSelect label="类型筛选" value={typeValue} onChange={chooseType} groups={[{options:[{value:'all',label:'全部类型'}]},...Object.entries(eventCategories).map(([key,category])=>({label:category.label,options:[{value:`category:${key}`,label:`全部${category.label}`},...category.kinds.map(k=>({value:`kind:${k}`,label:kinds[k],triggerLabel:`${category.label} · ${kinds[k]}`,kind:k}))]}))]}/>
  <FilterSelect label="场馆筛选" value={venue} onChange={value=>update('venue',value)} groups={[{options:[{value:'all',label:'全部场馆'},...Object.entries(venues).map(([key,venue])=>({value:key,label:venue.name}))]}]}/>
  <button className={`schedule-mine ${mine?'is-filtered':''}`} aria-label="只看我的" title="只看我的" aria-pressed={mine} onClick={()=>update('mine',mine?'0':'1')}><Bookmark size={16} fill={mine?'currentColor':'none'}/><span className="mine-short">我的</span><span className="mine-long">只看我的</span></button>
 </div>

 return <>
 <PageHead title="日程" subtitle="从一场演出，到整个模块节。" action={<span className="edition-label mono">21—25 OCT</span>}/>
 <div className="schedule-toolbar"><div className="segmented" aria-label="日程视图"><button className={view==='list'?'active':''} aria-pressed={view==='list'} onClick={()=>update('view','list')}><List size={16}/>列表</button><button className={view==='panorama'?'active':''} aria-pressed={view==='panorama'} onClick={()=>update('view','panorama')}><GanttChart size={17}/>全景视野</button></div>{view==='list'&&<span className="meta mono">{count} 场</span>}</div>
 {view==='list'?<>{dates}{filters}<section ref={resultMotion} aria-label="活动列表">{daily.length?daily.map(e=><EventRow key={e.id} event={e} onOpen={openEvent}/>):<Empty title="没有匹配的活动" body="试试其他日期，或取消筛选。"/>}</section><p className="data-footnote">北京时间 UTC+8 · 部分讲座场地待核实。</p></>:<SchedulePanel count={count} scopeControl={<div className="segmented panel-scope" aria-label="全景范围"><button className={scope==='day'?'active':''} aria-pressed={scope==='day'} onClick={()=>update('scope','day')}>单日</button><button className={scope==='festival'?'active':''} aria-pressed={scope==='festival'} onClick={()=>update('scope','festival')}>整个展期</button></div>}>
 <div className="schedule-panel-controls">

 {scope==='day'&&panoramaDates}{filters}
 </div>

 {scope==='festival'?<FestivalOverview items={filtered} onSelect={openEvent} choose={chooseDay}/>:<DayTimeline items={daily} day={day} onSelect={openEvent}/>}
 <details className="schedule-panel-footer"><summary><Info size={14}/><span>图例与说明</span><ChevronDown size={15}/></summary><div className="panel-help-content"><div className="schedule-panel-instructions"><span>{scope==='day'?'时间向下，舞台并列；可横向滚动。':'五天共用时间刻度；点击日期进入单日。'}</span><span>点击活动查看详情</span></div><div className="category-legend">{Object.entries(eventCategories).map(([key,value])=><div key={key}><strong>{value.label}</strong><div className="legend">{value.kinds.map(k=><span key={k}><span className={`kind-dot ${k}`}/>{kinds[k]}</span>)}</div></div>)}</div><div className="panel-key"><span><i className="legend-start"/>短线：开始时间</span><span><i className="legend-duration"/>长块：已公布时段</span><span><Bookmark size={12}/>轮廓：我的收藏</span><span>北京时间 UTC+8 · 部分讲座场地待核实</span></div></div></details>
 </SchedulePanel>}

 </>
}

const tracks=['Modular Live','Ambient Live','Boxing Ring','Dolby Atmos','讲座 / 演示 · 地点待核实','DIY Workshop · 二层','大师课','Groundless Factory 1F','Groundless Factory 2F']
function DayTimeline({items,day,onSelect}:{items:FestivalEvent[];day:number;onSelect:(event:FestivalEvent)=>void}){
 const canvasMotion=useContentMotion<HTMLDivElement>(`${day}:${items.map(e=>e.id).join(',')}`)
 const {detailPath}=useDetailPanel();const scale=3;const {personal}=usePersonal()
 if(!items.length)return <Empty title="这个视图还没有活动" body="取消筛选或收藏一场活动后再来查看。"/>
 const lanes=tracks.filter(t=>items.some(e=>e.stage===t));const start=Math.min(14*60,...items.map(e=>Math.floor(minute(e.start,day)/60)*60));const end=Math.max(22*60,...items.map(e=>Math.ceil((e.end?minute(e.end,day):minute(e.start,day)+30)/60)*60));const height=(end-start)*scale
 const hours=Array.from({length:(end-start)/60+1},(_,i)=>start+i*60)
 return <><div className="timeline-viewport" tabIndex={0} aria-label="单日全景，可横向滚动"><div ref={canvasMotion} className="timeline-grid" style={{gridTemplateColumns:`var(--ruler-width, 64px) repeat(${lanes.length}, minmax(var(--lane-width, 190px), 1fr))`,minWidth:`calc(var(--ruler-width, 64px) + ${lanes.length} * var(--lane-width, 190px))`}}><div className="timeline-corner mono">UTC+8</div>{lanes.map(l=><div className="lane-heading" key={l}>{l.replace(' · 地点待核实','')}<small>{l.startsWith('Groundless')?'莫须有工厂':l.includes('DIY')?'B06-2':l.includes('待核实')?'场地待核实':'798CUBE'}</small></div>)}<div className="time-ruler" style={{height}}>{hours.map(h=><span className="mono" key={h} style={{top:(h-start)*scale}}>{h>=1440?'次日 ':''}{String(Math.floor(h/60)%24).padStart(2,'0')}:00</span>)}</div>{lanes.map(l=><div className="timeline-lane" key={l} style={{height}}>{hours.map(h=><div className="hour-line" key={h} style={{top:(h-start)*scale}}/>)}{items.filter(e=>e.stage===l).map((e,_,laneItems)=>{const same=laneItems.filter(x=>x.start===e.start);const index=same.findIndex(x=>x.id===e.id);return <button key={e.id} onClick={()=>onSelect(e)} aria-haspopup="dialog" className={`time-block ${e.kind} ${detailPath===`/events/${e.id}`?'is-inspected':''} ${e.end?'duration':'unknown'} ${personal.saved.includes(e.id)?'is-saved':''}`} style={{top:(minute(e.start,day)-start)*scale,height:e.end?Math.max(48,(minute(e.end,day)-minute(e.start,day))*scale-4):Math.max(48,18*scale),left:`${index*100/same.length}%`,width:`calc(${100/same.length}% - 8px)`}} title={`${e.title} · ${clock(e.start)}${e.end?'–'+clock(e.end):''}`} aria-label={`${e.title}，${clock(e.start)}，查看活动详情`}><span className="mono">{clock(e.start)}{personal.saved.includes(e.id)&&<Bookmark size={12} fill="currentColor"/>}</span><strong>{e.title}</strong>{e.end&&<small>至 {clock(e.end)}</small>}</button>})}</div>)}</div></div></>
}
function FestivalOverview({items,choose,onSelect}:{items:FestivalEvent[];choose:(day:number)=>void;onSelect:(event:FestivalEvent)=>void}){
 const canvasMotion=useContentMotion<HTMLDivElement>(items.map(e=>e.id).join(','))
 const {personal}=usePersonal();const start=14*60,end=28*60,height=630;const scale=height/(end-start)
 return <><div className="festival-viewport" tabIndex={0} aria-label="整个展期时间分布"><div ref={canvasMotion} className="festival-grid" style={{width:'100%',minWidth:'100%',gridTemplateColumns:'42px repeat(5, minmax(0,1fr))'}}><div className="timeline-corner mono">UTC+8</div>{days.map(d=><button key={d} className="festival-day-head" onClick={()=>choose(d)}><strong className="mono">10/{d}</strong><span>{weekdays[d]} · {items.filter(e=>e.day===d).length} 场</span><ArrowUpRight size={15}/><div className="overview-category-labels"><span>活动</span><span>课程</span></div></button>)}<div className="time-ruler" style={{height}}>{Array.from({length:8},(_,i)=>14+i*2).map(h=><span key={h} className="mono" style={{top:(h*60-start)*scale}}>{h>=24?'次日 ':''}{h%24}:00</span>)}</div>{days.map(d=><div className="festival-day" key={d} style={{height}}>{Array.from({length:8},(_,i)=>14+i*2).map(h=><div className="hour-line" key={h} style={{top:(h*60-start)*scale}}/>)}{orderedKinds.map((k,i)=><div className={`overview-kind ${i===3?'category-divider':''}`} key={k} style={{left:`${i/6*100}%`,width:'16.666%'}}>{items.filter(e=>e.day===d&&e.kind===k).map(e=><button key={e.id} onClick={()=>onSelect(e)} aria-haspopup="dialog" aria-label={`${e.title}，10月${d}日 ${clock(e.start)}`} title={`${clock(e.start)} ${e.title}`} className={`overview-mark ${k} ${personal.saved.includes(e.id)?'is-saved':''}`} style={{top:(minute(e.start,d)-start)*scale,height:e.end?Math.max(4,(minute(e.end,d)-minute(e.start,d))*scale):4}}/>)}</div>)}</div>)}</div></div></>
}
