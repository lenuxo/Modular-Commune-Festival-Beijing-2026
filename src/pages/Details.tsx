import {ExhibitorRow} from '../components/ExhibitorRow'
import {Button} from '../design-system/Button'
import {Link,useParams} from 'react-router'
import {ArrowUpRight,Bookmark,MapPin,ExternalLink,AlertCircle} from 'lucide-react'
import {events,eventKindLabel,exhibitors,relatedEvents,overlaps,artistProfiles,presenterRole,eventDisplayTitle} from '../data/festival'
import {EventArticle,ArtistResources} from '../components/EventArticle'
import {hasEventArticleContent} from '../components/detailContent'
import {DetailDocument,DetailSection,DetailSources} from '../components/DetailDocument'
import {usePersonal} from '../personal'
import {Back,Empty,EventMeta,Source,EventRow} from '../components/shared'
export function EventDetail({id:detailId}:{id?:string}={}){
 const params=useParams();const id=detailId??params.id;const e=events.find(x=>x.id===id);const {personal,toggle}=usePersonal()
 if(!e)return <Empty title="这场活动暂时找不到" body="请回到日程查看最新资料。"><Link className="primary-btn" to="/schedule">查看日程</Link></Empty>
 const hasContent=Boolean(e.description?.trim())||hasEventArticleContent(e)
 const saved=personal.saved.includes(e.id);const conflicts=events.filter(x=>personal.saved.includes(x.id)&&overlaps(e,x));const associated=exhibitors.filter(x=>relatedEvents(x).some(ev=>ev.id===e.id))
 return <><Back/><DetailDocument key={id} parts={[{key:'essentials',label:'场次信息'},...(hasContent?[{key:'content',label:'活动内容'}]:[]),{key:'attendance',label:'参与须知'},...(associated.length?[{key:'related',label:'关联展商'}]:[])]}>
 <header className="detail-identity" data-detail-section="essentials" tabIndex={-1}>
 <div className="detail-eyebrow"><span className={`kind-dot ${e.kind}`}/>{eventKindLabel(e.kind)}</div>
 <h1>{eventDisplayTitle(e)}</h1>
 {eventDisplayTitle(e)!==e.title&&<p className="detail-subtitle">{e.details.title?e.title:e.title.split(' / ').slice(0,-1).join(' / ')}</p>}
 {e.presenter&&e.presenter!==e.title&&<p className="detail-byline">{presenterRole(e)}：{e.presenter}</p>}
 <div className="detail-primary-actions"><Button className={saved?'secondary-btn selected':'primary-btn'} onClick={()=>toggle('saved',e.id)} aria-pressed={saved}><Bookmark size={17} fill={saved?'currentColor':'none'}/>{saved?'已加入日程':'加入我的日程'}</Button>{e.booking&&<a className="secondary-btn" href={e.booking} target="_blank" rel="noreferrer"><ExternalLink size={16}/>报名 / 购票</a>}</div>
 <EventMeta event={e}/>
 <Link className="detail-location-link" to={e.venue==='expo'?'/map?layer=floors':`/map?layer=venues&venue=${e.venue}`}><MapPin size={16}/><span>{e.locationConfirmed?'在地图中查看场馆':'查看总图 · 具体地点待核实'}</span><ArrowUpRight size={16}/></Link>
 {e.details.alert&&<div className="inline-notice"><AlertCircle size={18}/><p>{e.details.alert}</p></div>}
 {conflicts.length>0&&<div className="inline-notice"><AlertCircle size={18}/><div><strong>与已收藏活动时间重叠</strong>{conflicts.map(x=><Link key={x.id} className="text-link block" to={`/events/${x.id}`}>{x.title}</Link>)}<p>可以保留多场，稍后决定。</p></div></div>}
 </header>
 {hasContent&&<DetailSection section="content" title="活动内容">{e.description?.trim()&&<p className="detail-lead">{e.description}</p>}<EventArticle event={e}/></DetailSection>}
 <DetailSection section="attendance" title="参与须知"><p>{e.kind==='diy'?'DIY 工作坊需要通过官方入口预约，材料费用与容量按项目公布；收藏不会占用名额。':e.kind==='master'?'大师课需要单独购票，普通音乐节免费入场不包含大师课。报名和购票以官方说明为准。':e.kind==='party'?'夜间活动使用跨午夜日程，凌晨的场次属于前一晚的 Party。票价、预约与入场规则以官方为准。':e.kind==='live'?'场次依据官方演出时间表整理，现场可能调整，以舞台公告为准。':'讲座和演示的报名方式、语言、具体场地以官方或现场说明为准。'}</p>{e.origin&&<p className="detail-byline">官方标注来源地：{e.origin}</p>}{e.artistId&&<Link className="detail-related-link" to={`/artists/${e.artistId}`}><span>艺术家资料与其他场次</span><ArrowUpRight size={16}/></Link>}</DetailSection>
 {associated.length>0&&<DetailSection section="related" title="关联展商" count={associated.length}>{associated.map(x=><ExhibitorRow key={x.id} exhibitor={x} compact/>)}</DetailSection>}
 <DetailSources checkedAt={e.details.checkedAt}>{e.details.sources.map(source=><Source key={source.url} {...source}/>)}{e.externalLinks.filter(url=>!e.details.sources.some(source=>source.url===url)).map(url=><Source key={url} url={url} label="官方表格附加链接（对应关系以原表为准）"/>)}</DetailSources>
 </DetailDocument></>
}
export function ArtistDetail({id:detailId}:{id?:string}={}){
 const params=useParams();const id=detailId??params.id;const e=events.find(x=>x.artistId===id)
 if(!e)return <Empty title="未找到艺术家" body="从演出日程进入艺术家资料。"/>
 const others=events.filter(x=>x.presenter===e.presenter)
 const profiles=e.details.artistUrls.map(url=>artistProfiles[url]).filter(Boolean)
 return <><Back/><DetailDocument key={id} parts={[{key:'essentials',label:'艺术家'},{key:'appearances',label:'演出安排'},...(profiles.length?[{key:'background',label:'创作背景'}]:[])]}>
 <header className="detail-identity" data-detail-section="essentials" tabIndex={-1}><div className="detail-eyebrow">艺术家 / 演出组合</div><h1>{e.presenter}</h1>{e.origin&&<p className="detail-byline">{e.origin}</p>}</header>
 <DetailSection section="appearances" title="演出安排" count={others.length}>{others.map(x=><EventRow key={x.id} event={x} showDay/>)}</DetailSection>
 {profiles.length>0&&<DetailSection section="background" title="创作背景"><div className="artist-article">{profiles.map(profile=><section className="detail-person-profile" key={profile.source.url}><h3>{profile.name}</h3>{profile.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}{profile.researchNote&&<p className="artist-research-note">{profile.researchNote}</p>}{profile.listeningGuide?.trim()&&<div className="detail-listening"><h4>聆听线索</h4><p>{profile.listeningGuide}</p></div>}<ArtistResources links={profile.links}/></section>)}</div></DetailSection>}
 <DetailSources checkedAt={e.details.checkedAt}><p className="meta">按官方完整署名展示同名场次。创作背景不等于本场曲目或合作分工。</p>{profiles.flatMap(profile=>profile.sources??[profile.source]).map((source,i)=><Source key={`${source.url}-${i}`} {...source}/>)}<Source url={e.source} label="官方演出表"/></DetailSources>
 </DetailDocument></>
}
