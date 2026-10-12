import {TextField} from '../design-system/TextField'
import {Button} from '../design-system/Button'
import {useCallback,useEffect,useRef,useState} from 'react'
import {Link,useSearchParams} from 'react-router'
import {ArrowUpRight,Minus,Plus,Scan,Bookmark,X,Search} from 'lucide-react'
import {TransformWrapper,TransformComponent} from 'react-zoom-pan-pinch'
import type {ReactZoomPanPinchRef} from 'react-zoom-pan-pinch'
import {exhibitors,indieGroups,venues,boothLabel} from '../data/festival'
import {usePersonal} from '../personal'
type Spot={id:string;x:number;y:number;w:number;h:number}
const first:Spot[]=[
 ...[['A2',62,103,215,72],['A3',292,103,221,72],['A4',529,103,100,72],['A5',644,103,100,72],['A6',760,103,100,72],['A7',1054,103,215,72],['A8',1283,103,100,72],['A9',1398,103,100,72],['A10',1513,103,100,72],['A11',1627,103,100,72],['A12',1742,103,100,72],['A1',62,252,100,72],['A13',912,207,100,162],['B1',82,419,100,72],['B2',196,419,100,72],['B3',311,419,215,72],['B4',540,419,215,72],['B5',655,512,100,165],['B6',426,606,215,72],['B8',312,606,100,72],['B9',196,606,100,72],['B10',91,764,100,72],['C7',1169,512,100,165],['D1',79,922,215,72],['D2',308,922,215,72],['D3',537,922,100,72],['D4',652,922,100,72],['D5',767,922,78,72],['D6',995,922,215,72],['D7',1224,922,100,72],['D8',1369,922,186,72],['D9',1571,922,100,72],['D10',1685,922,100,72]].map(([id,x,y,w,h])=>({id:String(id),x:Number(x),y:Number(y),w:Number(w),h:Number(h)})),
 ...Array.from({length:6},(_,i)=>({id:`C${i+1}`,x:1169+i*115,y:419,w:100,h:72})),...Array.from({length:5},(_,i)=>({id:`C${i+8}`,x:1284+i*115,y:606,w:100,h:72}))
]
const second:Spot[]=indieGroups.map((_,i)=>{
 if(i<=6)return {id:`indie-${i}`,x:i<3?265+i*175:865+(i-3)*175,y:138,w:157,h:100}
 if(i<=9)return {id:`indie-${i}`,x:1628,y:244+(i-7)*172,w:110,h:146}
 if(i<=15)return {id:`indie-${i}`,x:1248-(i-10)*184,y:834-(i-10)*27,w:162,h:100}
 return {id:`indie-${i}`,x:143,y:i===16?458:287,w:110,h:146}
})
export function MapPage(){
 const [params,setParams]=useSearchParams()
 const layer=['venues','first','second','floors'].includes(params.get('layer')??'')?params.get('layer')!:'venues'
 const target=params.get('target');const matches=exhibitors.filter(e=>e.booth===target)
 const {personal,toggle}=usePersonal();const [original,setOriginal]=useState(false);const [query,setQuery]=useState('')
 const transform=useRef<ReactZoomPanPinchRef|null>(null);const locator=useRef<HTMLDetailsElement>(null);const stage=useRef<HTMLElement>(null)
 const pointer=useRef({x:0,y:0});const suppressClickUntil=useRef(0);const fromMap=useRef(false)
 const floorMap=layer==='first'||layer==='second';const spots=layer==='first'?first:second
 const animation=matchMedia('(prefers-reduced-motion: reduce)').matches?0:180
 function changeLayer(value:string){setParams(p=>{const n=new URLSearchParams(p);n.set('layer',value);n.delete('target');return n});setOriginal(false);setQuery('');if(locator.current)locator.current.open=false}
 function choose(id:string,focus=false){fromMap.current=!focus;setParams(p=>{const n=new URLSearchParams(p);n.set('target',id);return n});if(focus){setOriginal(false);focusSpot(id);if(locator.current)locator.current.open=false;stage.current?.scrollIntoView({block:'start',behavior:animation?'smooth':'instant'})}}
 function clear(){setParams(p=>{const n=new URLSearchParams(p);n.delete('target');return n})}
 const focusSpot=useCallback((id:string)=>{const el=document.getElementById(`map-spot-${id}`);if(el)void transform.current?.zoomToElement(el.id,{maxScale:1.4,animationTime:animation})},[animation])
 useEffect(()=>{if(!target||fromMap.current){fromMap.current=false;return}const frame=requestAnimationFrame(()=>focusSpot(target));return()=>cancelAnimationFrame(frame)},[target,layer,original,focusSpot])
 const mapTitle=layer==='venues'?'场馆总图':layer==='floors'?'功能分区':layer==='first'?'一层展位':'二层开发者'
 return <div className="map-workbench">
 <div className="map-heading"><h1>地图</h1><span className="meta">{floorMap?'B06-2':layer==='venues'?'798艺术区':'B06-2 · 两层'}</span></div>
 <div className="map-tabs" aria-label="地图图层">{[['venues','场馆总图'],['first','一层展位'],['second','二层开发者'],['floors','功能分区']].map(([k,v])=><Button key={k} className={layer===k?'active':''} aria-pressed={layer===k} onClick={()=>changeLayer(k)}>{v}</Button>)}</div>
 <section className="material-inset map-stage" ref={stage} aria-label={mapTitle}
 onPointerDownCapture={e=>{pointer.current={x:e.clientX,y:e.clientY}}}
 onPointerMoveCapture={e=>{if(e.buttons||e.pointerType==='touch'){if(Math.hypot(e.clientX-pointer.current.x,e.clientY-pointer.current.y)>8)suppressClickUntil.current=performance.now()+300}}}>
 <TransformWrapper key={`${layer}-${original}`} ref={transform} minScale={.08} maxScale={3} fitOnInit centerZoomedOut
 panning={{velocityDisabled:true}} doubleClick={{step:.5,animationTime:animation}}
 // Smooth wheel zoom multiplies this step by deltaY; use a small per-pixel step.
 wheel={{step:.0006}} keyboard={{disabled:false,animationTime:animation}}
 onPinchStart={()=>{suppressClickUntil.current=Infinity}}
 onPinchStop={()=>{suppressClickUntil.current=performance.now()+300}}
 onInit={ref=>{if(target&&!original)void ref.fitToView({animationTime:0}).then(()=>focusSpot(target))}}>
 {({zoomIn,zoomOut,fitToView})=><>
 <TransformComponent wrapperClass="gesture-map" contentClass="gesture-map-content" wrapperStyle={{width:'100%',height:'100%'}} wrapperProps={{tabIndex:0,'aria-label':'地图画布：双指缩放或拖动；键盘方向键移动，加减键缩放'}}>
 {floorMap&&!original?<svg width="1920" height="1080" viewBox="0 0 1920 1080" role="group" aria-label={layer==='first'?'一层展位布局':'二层开发者布局'}><rect width="1920" height="1080" className="map-bg"/><text x="960" y="505" textAnchor="middle" className="map-center">{layer==='first'?'SYNTH EXPO':'INDIE DEVELOPERS'}</text><text x="960" y="560" textAnchor="middle" className="map-subtitle">{layer==='first'?'一层 · A / B / C / D 区':'二层 · 按开发者名称定位'}</text>{spots.map(s=>{const brands=exhibitors.filter(e=>e.booth===s.id);const isSaved=brands.some(e=>personal.brands.includes(e.id));return <g id={`map-spot-${s.id}`} key={s.id} role="button" tabIndex={0} aria-label={`${s.id.startsWith('indie')?'二层展位':s.id} ${brands.map(e=>e.name).join('、')||'未标明展商'}`} aria-pressed={target===s.id} data-selected={target===s.id} className={`map-spot ${target===s.id?'selected':''} ${isSaved?'saved':''}`} onClick={e=>{if(e.detail===0||performance.now()>suppressClickUntil.current)choose(s.id)}} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose(s.id)}}}><rect x={s.x} y={s.y} width={s.w} height={s.h} rx="3"/>{layer==='first'?<text x={s.x+s.w/2} y={s.y+s.h/2+11} textAnchor="middle">{s.id}</text>:<>{brands.map((b,i)=><text className="indie-label" key={b.id} x={s.x+s.w/2} y={s.y+s.h/2+(i-(brands.length-1)/2)*27+6} textAnchor="middle">{b.aliases[0].slice(0,16)}</text>)}</>}{isSaved&&<circle cx={s.x+s.w-10} cy={s.y+10} r="6"/>}</g>})}<text x="1740" y="830" textAnchor="middle" className="map-entry">↗ 出入口</text>{layer==='first'&&<text x="1630" y="300" className="map-entry">二层 →</text>}</svg>:<img src={`maps/${layer==='venues'?'venues.png':layer==='floors'?'floors.jpg':layer==='first'?'booths.png':'indie.png'}`} alt={layer==='venues'?'798艺术区场馆原始总图':layer==='floors'?'B06-2 一层和二层功能分区原图':'原始展位图'} draggable={false}/>}
 </TransformComponent>
 <div className="material-elevated map-floating-controls" aria-label="地图工具">
 {floorMap&&<Button className="icon-btn" aria-label="按名称定位展商" onClick={()=>{if(locator.current){locator.current.open=true;locator.current.scrollIntoView({block:'start',behavior:animation?'smooth':'instant'});locator.current.querySelector('input')?.focus({preventScroll:true})}}}><Search size={18}/></Button>}
 {floorMap&&<Button className="map-source-toggle" aria-pressed={original} onClick={()=>setOriginal(v=>!v)}>{original?'交互图':'原图'}</Button>}
 <Button className="icon-btn" aria-label="放大地图" onClick={()=>void zoomIn(.35,animation)}><Plus size={19}/></Button>
 <Button className="icon-btn" aria-label="缩小地图" onClick={()=>void zoomOut(.35,animation)}><Minus size={19}/></Button>
 <Button className="icon-btn" aria-label="查看全图" onClick={()=>void fitToView({animationTime:animation})}><Scan size={19}/></Button>
 </div>
 </>}
 </TransformWrapper>
 <span className="map-gesture-hint">双指缩放 · 拖动移动 · 双击放大</span>
 {floorMap&&target&&<aside className="material-panel map-spot-preview" aria-label="选中展位" aria-live="polite"><div className="map-spot-preview-heading"><strong>{target.startsWith('indie')?'二层展位':target}</strong><Button className="icon-btn" aria-label="关闭展位信息" onClick={clear}><X size={18}/></Button></div>
 {target==='A14'&&<p className="meta">原图未标出 A14 的位置。</p>}
 {matches.map(e=><div className="selected-brand" key={e.id}><Link to={`/exhibitors/${e.id}`}>{e.name}<ArrowUpRight size={17}/></Link><Button className={`icon-btn ${personal.brands.includes(e.id)?'selected':''}`} aria-label={`${personal.brands.includes(e.id)?'取消收藏':'收藏'} ${e.name}`} aria-pressed={personal.brands.includes(e.id)} onClick={()=>toggle('brands',e.id)}><Bookmark size={17} fill={personal.brands.includes(e.id)?'currentColor':'none'}/></Button></div>)}
 {!matches.length&&target!=='A14'&&<p className="meta">名单未标明这个展位的展商。</p>}
 </aside>}
 </section>
 {floorMap?<details ref={locator} className="map-extra"><summary>按名称或展位定位</summary><TextField className="map-locate-search"><Search size={16}/><input aria-label="查找地图展商" placeholder="名称 / 展位号" value={query} onChange={e=>setQuery(e.target.value)}/></TextField><div className="map-locate-list">{exhibitors.filter(e=>e.floor===(layer==='first'?1:2)&&(e.name+' '+e.booth).toLowerCase().includes(query.toLowerCase())).map(e=><Button key={e.id} aria-pressed={target===e.booth} onClick={()=>choose(e.booth,true)}><span className="mono">{boothLabel(e)}</span><span>{e.name}</span></Button>)}</div><p className="map-source-note">按原图示意定位，非比例导航图。A14 未标出位置。</p></details>:<details className="map-extra"><summary>{layer==='venues'?'场馆与入口信息':'楼层用途'}</summary>{layer==='venues'?<div className="map-venue-links">{(['cube','expo','factory'] as const).map(id=><Link key={id} className={params.get('venue')===id?'active-venue':''} to={id==='expo'?'/exhibitors':`/schedule?venue=${id}`}><span><strong>{venues[id].name}</strong><small>{venues[id].hint}</small></span><ArrowUpRight size={18}/></Link>)}<p className="map-source-note">B06-2 南入口与莫须有工厂入口相邻，分别通往展览和 Party。</p></div>:<div className="map-venue-links"><Link to="/map?layer=first"><span><strong>一层</strong><small>展商与公共服务</small></span><ArrowUpRight size={18}/></Link><Link to="/map?layer=second"><span><strong>二层</strong><small>独立开发者与 DIY</small></span><ArrowUpRight size={18}/></Link></div>}</details>}
 </div>
}
