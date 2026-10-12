import {Link,useParams,useSearchParams} from 'react-router'
import {ArrowUpRight,Bookmark,Check,Search,MapPin,ArrowLeft} from 'lucide-react'
import {exhibitors,boothLabel,relatedEvents,officialLinks,exhibitorMatches} from '../data/festival'
import {usePersonal} from '../personal'
import {useDetailPanel} from '../components/detailContext'
import {DetailDocument,DetailSection,DetailSources} from '../components/DetailDocument'
import {PageHead,Empty,EventRow,Source} from '../components/shared'
export function Exhibitors(){
 const {detailPath}=useDetailPanel();const [params,setParams]=useSearchParams();const q=params.get('q')??'';const floor=params.get('floor')??'all';const {personal,toggle}=usePersonal()
 const update=(key:string,value:string)=>setParams(p=>{const n=new URLSearchParams(p);n.set(key,value);return n},{replace:true})
 const found=exhibitors.filter(e=>(floor==='all'||String(e.floor)===floor)&&exhibitorMatches(e,q))
 return <><PageHead title="展商" subtitle="品牌、代理商与独立开发者，在这里相遇。" action={<span className="edition-label mono">{exhibitors.length} EXHIBITORS</span>}/><label className="search-field"><Search size={18}/><span className="sr-only">搜索展商、产品方向或展位</span><input placeholder="搜索品牌、采样、DIY、音频接口或展位…" value={q} onChange={e=>update('q',e.target.value)}/></label><div className="filters floor-filter">{[['all','全部展商'],['1','一层 · 品牌'],['2','二层 · 独立开发者']].map(([k,v])=><button key={k} className={floor===k?'active':''} onClick={()=>update('floor',k)} aria-pressed={floor===k}>{v}</button>)}<span className="meta ml-auto">{found.length} 家</span></div><div className="exhibitor-list directory-list">{found.map(e=><article key={e.id} className={detailPath===`/exhibitors/${e.id}`?'is-inspected':undefined}><Link to={`/exhibitors/${e.id}`} className="exhibitor-main"><span className={`booth-code mono ${e.floor===2?'indie':''}`}>{e.floor===1?e.booth:'2F'}</span><div><h2>{e.name}</h2><p className="exhibitor-summary">{e.profile.summary}</p><p className="exhibitor-keywords"><span>{e.profile.topics.length?e.profile.topics.join(' · '):'资料待补充'}</span>{personal.visited.includes(e.id)&&<span className="visited-label"><Check size={12}/>已逛</span>}</p></div><ArrowUpRight size={17}/></Link><button className={`icon-btn ${personal.brands.includes(e.id)?'selected':''}`} aria-label={`${personal.brands.includes(e.id)?'取消收藏':'收藏'} ${e.name}`} aria-pressed={personal.brands.includes(e.id)} onClick={()=>toggle('brands',e.id)}><Bookmark size={18} fill={personal.brands.includes(e.id)?'currentColor':'none'}/></button></article>)}</div>{!found.length&&<Empty title="没有找到这个展商" body="试试英文名称、展位编号，或切换楼层。"/>}<p className="data-footnote">展位依据原始名单与地图；介绍整理自展商官网及公开资料 · 核对于 2026.10.12</p></>
}
export function ExhibitorDetail({id:detailId}:{id?:string}={}){
 const params=useParams();const id=detailId??params.id;const x=exhibitors.find(e=>e.id===id);const {personal,toggle}=usePersonal()
 if(!x)return <Empty title="找不到这家展商" body="它可能已变更，请回到展商列表查找。"><Link className="primary-btn" to="/exhibitors">展商列表</Link></Empty>
 const hasProfile=Boolean(x.profile.description?.trim())||x.profile.topics.length>0||x.profile.products.length>0
 const related=relatedEvents(x);const same=exhibitors.filter(e=>e.booth===x.booth&&e.id!==x.id)
 return <><Link className="text-link mb-6 detail-back-link" to="/exhibitors"><ArrowLeft size={16}/>返回展商</Link><DetailDocument key={id} parts={[{key:'essentials',label:'展位信息'},...(hasProfile?[{key:'profile',label:'展商介绍'}]:[]),...(related.length?[{key:'related',label:'关联活动'}]:[])]}>
 <header className="detail-identity" data-detail-section="essentials" tabIndex={-1}>
 <div className="detail-eyebrow">{x.category}</div><h1>{x.name}</h1><p className="detail-lead">{x.profile.summary}</p>
 <div className="detail-primary-actions"><button className={personal.brands.includes(x.id)?'secondary-btn selected':'primary-btn'} aria-pressed={personal.brands.includes(x.id)} onClick={()=>toggle('brands',x.id)}><Bookmark size={16} fill={personal.brands.includes(x.id)?'currentColor':'none'}/>{personal.brands.includes(x.id)?'已加入想逛':'加入想逛'}</button><button className={`secondary-btn ${personal.visited.includes(x.id)?'selected':''}`} aria-pressed={personal.visited.includes(x.id)} onClick={()=>toggle('visited',x.id)}><Check size={16}/>{personal.visited.includes(x.id)?'已经逛过':'标记已逛'}</button></div>
 <div className="detail-booth-location"><span className="detail-booth-code mono">{x.floor===1?x.booth:'2F'}</span><div><strong>B06-2 · {x.floor===1?'一层':'二层'}</strong><p>{x.floor===2?boothLabel(x):'合成器展览区'}</p><small>{x.booth==='A14'?'平面图未标出该展位位置':x.floor===2?'原图按名称标识，无公开数字编号':'按原始展位图定位'}</small></div></div>
 <Link className="detail-location-link" to={`/map?layer=${x.floor===1?'first':'second'}&target=${x.booth}`}><MapPin size={16}/><span>{x.booth==='A14'?'查看地图 · 位置待核实':'在地图中定位展位'}</span><ArrowUpRight size={16}/></Link>
 {same.length>0&&<div className="detail-shared-booth"><span className="meta">共用展位</span>{same.map(e=><Link key={e.id} className="detail-related-link" to={`/exhibitors/${e.id}`}><span>{e.name}</span><ArrowUpRight size={16}/></Link>)}</div>}
 </header>
 {hasProfile&&<DetailSection section="profile" title="认识展商">{x.profile.description?.trim()&&<p>{x.profile.description}</p>}{x.profile.topics.length>0&&<ul className="profile-topics" aria-label="产品与创作方向">{x.profile.topics.map(topic=><li key={topic}>{topic}</li>)}</ul>}{x.profile.products.length>0&&<div className="detail-products"><h3>代表产品 / 服务</h3><ul>{x.profile.products.map(product=><li key={product}>{product}</li>)}</ul><p className="meta">用于了解品牌方向，具体本届展品以现场公布为准。</p></div>}</DetailSection>}
 {related.length>0&&<DetailSection section="related" title="关联活动" count={related.length}>{related.map(e=><EventRow key={e.id} event={e} showDay/>)}</DetailSection>}
 <DetailSources checkedAt={x.profile.checkedAt}>{x.profile.sources.map(source=><Source key={source.url} {...source}/>)}<Source url={officialLinks.exhibitors} label="本届主办方展商目录"/>{['historical','pending','limited'].includes(x.profile.status)&&<p className="meta">{x.profile.status==='historical'?'背景依据 2025 年资料':x.profile.status==='pending'?'详细介绍待补充':x.profile.status==='limited'?'产品资料待补充':''}</p>}</DetailSources>
 </DetailDocument></>
}
