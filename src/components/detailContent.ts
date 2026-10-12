import {eventPeople,type FestivalEvent} from '../data/festival'

export function contentSections(event:FestivalEvent){
 return event.details.sections.map(section=>({...section,paragraphs:section.paragraphs.filter(paragraph=>paragraph.trim()&&paragraph!==event.description)})).filter(section=>section.paragraphs.length)
}
export function hasEventArticleContent(event:FestivalEvent){
 return contentSections(event).length>0||eventPeople(event).length>0||Boolean(event.details.notice?.trim())
}
