import type {FestivalEvent} from '../data/festival'

export function homeContext(now: number, events: FestivalEvent[], savedIds: string[]) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',hourCycle:'h23'}).formatToParts(now).map(part=>[part.type,part.value]))
  const date = `${parts.year}-${parts.month}-${parts.day}`
  const phase = date < '2026-10-21' ? 'before' : date > '2026-10-25' ? 'after' : 'during'
  const calendarDay = Number(parts.day)
  // Keep the preceding festival day during its explicitly published cross-midnight sessions.
  const crossMidnight = events.some(e=>e.day===calendarDay-1 && (e.start.slice(0,10)===date || (e.end && e.end.slice(0,10)===date && Date.parse(e.end)>now)))
  const day = phase==='during' ? (Number(parts.hour)<6 && crossMidnight ? calendarDay-1 : calendarDay) : 23
  const saved = events.filter(e=>savedIds.includes(e.id)).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start))
  const future = saved.filter(e=>Date.parse(e.start)>=now || (e.end && Date.parse(e.end)>now))
  const ongoing = saved.find(e=>e.end && Date.parse(e.start)<=now && Date.parse(e.end)>now)
  const justStarted = saved.find(e=>!e.end && Date.parse(e.start)<=now && now-Date.parse(e.start)<15*60000)
  const next = phase==='after' ? undefined : ongoing ?? justStarted ?? future[0]
  const upcoming = events.filter(e=>Date.parse(e.start)>=now && Date.parse(e.start)<=now+60*60000).sort((a,b)=>Date.parse(a.start)-Date.parse(b.start))
  const conflicts = future.flatMap((a,i)=>future.slice(i+1).filter(b=>a.end && b.end && Date.parse(a.start)<Date.parse(b.end) && Date.parse(b.start)<Date.parse(a.end)).map(b=>[a,b]))
  return {phase,date,day,saved,future,next,ongoing,upcoming,conflicts}
}

export function untilStart(start: string, now: number) {
  const minutes = Math.ceil((Date.parse(start)-now)/60000)
  if (minutes<=0) return '已到开始时间'
  if (minutes<60) return `${minutes} 分钟后开始`
  if (minutes<24*60) return `${Math.floor(minutes/60)} 小时${minutes%60 ? ` ${minutes%60} 分钟` : ''}后开始`
  return `${Math.floor(minutes/(24*60))} 天后开始`
}
