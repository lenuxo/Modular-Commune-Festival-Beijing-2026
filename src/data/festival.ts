import rawEvents from './events.json'
import rawProfiles from './exhibitor-profiles.json'
import rawEventDetails from './event-details.json'
import rawArtistProfiles from './artist-profiles.json'
import rawPeopleProfiles from './people-profiles.json'
export type Kind = 'live' | 'talk' | 'diy' | 'master' | 'party' | 'special'
export type VenueId = 'cube' | 'expo' | 'factory' | 'unknown'
export interface DetailSource {label:string;url:string}
export interface EventDetails {title?:string;alert?:string;summary:string;sections:{heading:string;paragraphs:string[]}[];sources:DetailSource[];artistUrls:string[];peopleIds?:string[];status:string;notice:string;checkedAt:string}
export interface ArtistProfile {name:string;paragraphs:string[];listeningGuide:string;source:DetailSource;sources?:DetailSource[];links?:DetailSource[];status?:string;researchNote?:string;checkedAt:string}
export interface PeopleProfile {name:string;paragraphs:string[];sources:DetailSource[];links?:DetailSource[];researchNote?:string;status:string;checkedAt:string}
export const artistProfiles:Record<string,ArtistProfile> = rawArtistProfiles
export const peopleProfiles:Record<string,PeopleProfile> = {
  ...Object.fromEntries(Object.entries(artistProfiles).map(([url,p])=>[url,{name:p.name,paragraphs:p.paragraphs,sources:p.sources??[p.source],links:p.links,researchNote:p.researchNote,status:p.status??'official',checkedAt:p.checkedAt}])),
  ...rawPeopleProfiles,
}
export function eventPeople(e:FestivalEvent) {return (e.details.peopleIds??e.details.artistUrls).map(id=>peopleProfiles[id]).filter(Boolean)}
const eventDetails:Record<string,EventDetails> = rawEventDetails
export interface FestivalEvent {
  id: string; title: string; kind: Kind; day: number; start: string; end: string | null
  stage: string; venue: VenueId; presenter: string; origin: string; price: string
  source: string; booking: string | null; capacity: number | null; locationConfirmed: boolean
  description: string; artistId: string | null; externalLinks: string[]
  details: EventDetails
}
export const events:FestivalEvent[] = rawEvents.map(e=>{const details=eventDetails[e.id]??{summary:'活动详细介绍待补充。',sections:[],sources:[{label:'官方活动日程',url:e.source}],artistUrls:[],status:'pending',notice:'此场为新增活动，详情以官方说明为准。',checkedAt:'2026-10-12'};return {...e,kind:e.kind as Kind,venue:e.venue as VenueId,description:details.summary,details}})
export function eventMatches(e:FestivalEvent,query:string) {return [e.title,e.presenter,e.stage,e.description,...e.details.sections.flatMap(s=>s.paragraphs),...eventPeople(e).flatMap(p=>[p.name,...p.paragraphs])].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())}
export function presenterRole(e:FestivalEvent) {return e.kind==='live'||e.kind==='party'?'演出':'主讲 / 主持'}
export function eventDisplayTitle(e:FestivalEvent) {if(e.details.title)return e.details.title;const parts=e.title.split(' / ');const chinese=parts.at(-1)!;return e.kind!=='live'&&e.kind!=='party'&&parts.length>1&&/[\u4e00-\u9fff]/.test(chinese)?chinese:e.title}
export const days = [21, 22, 23, 24, 25]
export const weekdays: Record<number, string> = {21:'周三',22:'周四',23:'周五',24:'周六',25:'周日'}
export const kinds: Record<Kind, string> = { live:'现场演出', talk:'讲座 / 演示', diy:'DIY 工作坊', master:'大师课', party:'Afterparty', special:'特别活动' }
export type EventCategory = 'activity' | 'course'
export const eventCategories: Record<EventCategory, {label:string;kinds:Kind[]}> = {
  activity: {label:'活动', kinds:['live','party','special']},
  course: {label:'课程', kinds:['talk','diy','master']},
}
export const kindCategory: Record<Kind, EventCategory> = {live:'activity',party:'activity',special:'activity',talk:'course',diy:'course',master:'course'}
export const orderedKinds = Object.values(eventCategories).flatMap(category=>category.kinds)
export function eventKindLabel(kind:Kind) {return `${eventCategories[kindCategory[kind]].label} · ${kinds[kind]}`}
export const venues: Record<VenueId, {name:string; address:string; hint:string}> = {
  cube: {name:'798CUBE',address:'北京 · 798艺术区 · 北3门附近',hint:'现场演出、大师课与 Ambient Afterparty'},
  expo: {name:'B06-2 展览馆',address:'798艺术区 · B06-2 南入口',hint:'一层常规展商；二层独立开发者与 DIY'},
  factory: {name:'莫须有工厂',address:'Groundless Factory · B06-2 旁',hint:'Techno Afterparty；与展览馆入口分开'},
  unknown: {name:'地点待核实',address:'以官方或现场指引为准',hint:'不推测活动的具体场地'},
}
export const checkedAt = '2026.10.12'
export const dataVersion = '2026-10-12.5'
export function clock(iso: string) { return new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Shanghai',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date(iso)) }
export function eventTime(e: FestivalEvent) {
  const start=(Number(e.start.slice(8,10))!==e.day?'次日 ':'')+clock(e.start)
  if (!e.end) return start
  const extra=e.start.slice(0,10)!==e.end.slice(0,10)?'次日 ':''
  return `${start}–${extra}${clock(e.end)}`
}
export function minute(iso:string, festivalDay:number) {return (new Date(iso).getTime()-new Date(`2026-10-${festivalDay}T00:00:00+08:00`).getTime())/60000}
export function getDefaultDay() {const day=Number(new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',day:'2-digit'}).format(new Date())); const month=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Shanghai',month:'2-digit',year:'numeric'}).format(new Date());return month.includes('2026')&&month.includes('10')&&days.includes(day)?day:23}
export function overlaps(a:FestivalEvent,b:FestivalEvent) {return !!a.end&&!!b.end&&a.id!==b.id&&new Date(a.start)<new Date(b.end)&&new Date(b.start)<new Date(a.end)}
export const officialLinks = {schedule:'https://modularcommune.com/performances-2026/',workshops:'https://modularcommune.com/workshops-2026/',exhibitors:'https://modularcommune.com/exhibitors-2026/',master:'https://modularcommune.com/master-class-2026/',map:'https://modularcommune.com/floorplan-2026/'}
export interface ExhibitorProfile {summary:string;description:string;topics:string[];products:string[];sources:{label:string;url:string}[];status:string;checkedAt:string}
const profiles:Record<string,ExhibitorProfile> = rawProfiles
export interface Exhibitor {id:string;name:string;booth:string;floor:1|2;category:string;aliases:string[];profile:ExhibitorProfile}
const main: [string,string][] = [
 ['A1','爱新聚福'],['A2','A&C Pro Audio Distribution 德成科技'],['A2','Real Music 睿铭声光'],['A4','Steinberg'],['A5','Global Audio 全球音兰'],['A6','Sonic Vein 声脉科技'],['A7','Roland'],['A8','Lakeview'],['A9','Posin'],['A10','MIDIPLUS'],['A11','Digime 笛美音响'],['A12','Stylophone'],['A14','Osc Audio 奥斯中乐'],
 ['B1','Guangzhou Pro Light + Sound 广州国际灯光音响展'],['B2','Jeanie'],['B3','Fukusan Kigyo Co., Ltd'],['B4','NoiseTone'],['B5','SOMA Laboratory'],['B6','ASM'],['B8','ACE 安恒利'],['B9','HarmTrix Instrument'],['B10','Donner 唐农乐器'],['B10','Theresyn'],
 ['C1','Outlying Audio'],['C2','Tin Man Synths 锡人乐器'],['C3','Synido 森林岛'],['C4','Robkoo 锣拨科技'],['C5','ESI Pro 怡歌'],['C6','Leidian Audio 雷电音频'],['C7','Elektron'],['C8','Erica Synths'],['C9','Schlappi Engineering'],['C10','ALM Busy Circuits'],['C11','RYK Modular'],['C12','Befaco'],
 ['D1','203 Systems'],['D2','Easternedison 怡同科技'],['D4','DMT Pro 传新科技'],['D5','Ableton'],['D6','Eventide'],['D7','Australian Tactile Instruments'],['D8','Instruō'],['D9','Shakmat Modular'],
]
export const indieGroups = [
 ['ToyLeader','cocolab 椰椰尤西卡'],['Electro Weird 怪电屋','Nightmare Huzz'],['Heisenberg 海森堡电子工业','Retrograde Future 因循未来'],['Modular Khiat'],['Cosmic Slime (Invincible) 宇宙无敌史莱姆','30K'],['Gm.XE'],['Entropy Music'],['Biti Workshop'],['Synthesis Minority 合成少数派'],['Tangible Music Lab'],['Synso Instrument'],['Coding Inspire Modular','Telan'],['Akashic','Mini Audio'],['SoundWall Audio'],['Mad Kids Empire 疯孩帝国'],['Oenes Source','DMI design'],['GAUxWAn','Liman Instrument'],['PostInterface 后界面']
]
export const exhibitors:Exhibitor[] = [...main.map(([booth,name],i)=>({id:`brand-${i}`,name,booth,floor:1 as const,category:'品牌 / 代理商',aliases:[name.split(' ')[0]],profile:profiles[name]})),...indieGroups.flatMap((names,g)=>names.map((name,i)=>({id:`indie-${g}-${i}`,name,booth:`indie-${g}`,floor:2 as const,category:'独立开发者',aliases:[name.split(' ')[0]],profile:profiles[name]})))]
export function relatedEvents(x:Exhibitor) {const keys=x.name==='Sonic Vein 声脉科技'?['sonic vein','声脉']:x.aliases.filter(k=>k.length>2).map(k=>k.toLowerCase());if(x.name==='Ableton')keys.push('push');return events.filter(e=>keys.some(k=>(e.title+' '+e.presenter).toLowerCase().includes(k)))}
export function boothLabel(x:Exhibitor) {return x.floor===1?x.booth:'二层 · 名称定位'}

export function exhibitorMatches(x:Exhibitor,query:string) {return [x.name,x.booth,...x.aliases,x.profile.summary,x.profile.description,...x.profile.topics,...x.profile.products].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())}
