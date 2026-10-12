import {useEffect,useRef,useState,type ReactNode} from 'react'
import {ChevronDown} from 'lucide-react'

type DetailPart={key:string;label:string}
export function DetailDocument({children,parts}:{children:ReactNode;parts:DetailPart[]}){
 const documentRef=useRef<HTMLElement>(null);const [active,setActive]=useState(parts[0]?.key)
 const sectionKeys=parts.map(part=>part.key).join(',')
 useEffect(()=>{
  const element=documentRef.current;if(!element)return
  const root=element.closest<HTMLElement>('.detail-panel-body');const scrollTarget=root??window
  const update=()=>{
   const keys=sectionKeys.split(',');let key=keys[0]
   if(element.getBoundingClientRect().height){
    const edge=(root?.getBoundingClientRect().top??72)+90
    for(const section of element.querySelectorAll<HTMLElement>('[data-detail-section]')){const candidate=section.dataset.detailSection;if(candidate&&keys.includes(candidate)&&section.getBoundingClientRect().top<=edge)key=candidate}
    if(root&&root.scrollTop>0&&root.scrollTop+root.clientHeight>=root.scrollHeight-2)key=keys.at(-1)??key
   }
   setActive(key)
  }
  const observer=new ResizeObserver(update);observer.observe(element)
  update();scrollTarget.addEventListener('scroll',update,{passive:true});window.addEventListener('resize',update)
  return()=>{observer.disconnect();scrollTarget.removeEventListener('scroll',update);window.removeEventListener('resize',update)}
 },[sectionKeys])
 return <article ref={documentRef} className="detail-document"><nav className="detail-jump" aria-label="详情内容导航">{parts.map(part=><button key={part.key} aria-current={active===part.key?'location':undefined} onClick={event=>{const document=event.currentTarget.closest('.detail-document');const target=document?.querySelector<HTMLElement>(`[data-detail-section="${part.key}"]`);target?.scrollIntoView({block:'start',behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});target?.focus({preventScroll:true})}}>{part.label}</button>)}</nav><div className="detail-document-content">{children}</div></article>
}
export function DetailSection({section,title,count,children}:{section:string;title:string;count?:number;children:ReactNode}){
 return <section className="detail-chapter" data-detail-section={section} tabIndex={-1} aria-label={title}><div className="detail-chapter-heading"><h2>{title}</h2>{count!==undefined&&<span className="mono meta">{count}</span>}</div>{children}</section>
}
export function DetailSources({children,checkedAt}:{children:ReactNode;checkedAt?:string}){
 return <details className="detail-source-fold" data-detail-section="sources"><summary><span>资料来源与核对信息</span><ChevronDown size={16}/></summary><div>{children}{checkedAt&&<p className="meta">核对于 {checkedAt.replaceAll('-','.')}</p>}</div></details>
}
