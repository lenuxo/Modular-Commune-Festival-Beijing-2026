import {eventPeople,type FestivalEvent,type DetailSource} from '../data/festival'
import {Source} from './shared'
import {contentSections,hasEventArticleContent} from './detailContent'

export function ArtistResources({links}:{links?:DetailSource[]}) {
  if(!links?.length)return null
  return <div className="artist-resources"><h4>作品与项目入口</h4><small>由主办方艺术家资料页提供</small>{links.map(link=><Source key={link.url} {...link}/>)}</div>
}

function EventPeople({event}:{event:FestivalEvent}) {
  const people=eventPeople(event)
  if(!people.length)return null
  const heading=event.kind==='live'||event.kind==='party'?'表演艺术家':'主讲人与参与者'
  return <section className="detail-section event-people" aria-label={heading}>
    <h3>{heading}</h3>
    {people.map(person=><article className="event-person" key={person.name}>
      <h4>{person.name}</h4>
      {person.paragraphs[0]&&<p>{person.paragraphs[0]}</p>}
      <details className="detail-bio-fold"><summary>展开人物背景与作品入口</summary><div>{person.paragraphs.slice(1).map((paragraph,i)=><p key={i}>{paragraph}</p>)}
      {person.researchNote&&<p className="artist-research-note">{person.researchNote}</p>}
      <ArtistResources links={person.links}/>
      <div className="person-sources">
        {person.sources.map(source=><Source key={source.url} {...source}/>)}
        <small>资料核对：{person.checkedAt}</small>
      </div></div></details>
    </article>)}
  </section>
}

export function EventArticle({event}:{event:FestivalEvent}) {
 const sections=contentSections(event)
 if(!hasEventArticleContent(event))return null
 return <div className="event-article">
    {sections.slice(0,1).map(section=><section className="detail-section" key={section.heading}>
      <h3>{section.heading}</h3>
      {section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
    </section>)}
    <EventPeople event={event}/>
    {sections.slice(1).map(section=><section className="detail-section" key={section.heading}>
      <h3>{section.heading}</h3>
      {section.paragraphs.map((paragraph,i)=><p key={i}>{paragraph}</p>)}
    </section>)}
    {event.details.notice?.trim()&&<p className="data-footnote">{event.details.notice}</p>}
  </div>
}
