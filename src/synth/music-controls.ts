import {clamp, DEFAULT_FEELING} from './model.ts'
import type {Feeling,Note} from './model.ts'

export type Part = 'kick'|'drums'|'extra'|'bass'|'sub'|'chords'|'motif'|'air'|'fx'
type Touch = Pick<Note,'energy'|'space'|'tone'>
const roots:Record<Feeling,number[]>={house:[41,41,37,37,44,44,39,39],techno:[41,41,41,41,41,41,41,41],breaks:[38,38,46,46,43,43,45,45],dnb:[43,43,39,39,46,46,41,41]}
const majors:Record<Feeling,boolean[]>={house:[false,false,true,true,true,true,true,true],techno:[false,false,false,false,false,false,false,false],breaks:[false,false,true,true,false,false,false,false],dnb:[false,false,true,true,true,true,true,true]}
const inputs=[60,63,65,67,70,72,75,77,79,82]
export function harmonicPitch(pitch:number,feeling:Feeling,bar:number) {
  const index=Math.max(0,inputs.indexOf(pitch)),b=((bar%8)+8)%8
  const degrees=majors[feeling][b]?[0,2,4,7,9]:[0,3,5,7,10]
  return roots[feeling][b]+24+degrees[index%5]+Math.floor(index/5)*12
}
export function mixCharacter(feeling:Feeling) {
  return feeling==='house'?{delayBeats:.5,feedback:.18,echoCutoff:2200,saturation:1.3,bassBody:480}:
    feeling==='techno'?{delayBeats:.25,feedback:.22,echoCutoff:1550,saturation:3.8,bassBody:190}:
    feeling==='breaks'?{delayBeats:.75,feedback:.25,echoCutoff:5200,saturation:1,bassBody:1500}:
    {delayBeats:1,feedback:.20,echoCutoff:6200,saturation:2.2,bassBody:180}
}
export function partLevel(feeling:Feeling,part:Part|'lead') {
  return part==='kick'?1.22:part==='drums'?1.12:part==='chords'?.82:part==='motif'?.86:
    part==='air'?.82:part==='bass'&&feeling==='dnb'?1.12:1
}
// A short delay throw and a slow filter movement mark phrase ends without washing out drums.
export function phraseEffects(feeling:Feeling,part:Part|'lead',cycle:number) {
  const upper=['chords','motif','air','lead'].includes(part),phase=((cycle%4)+4)%4
  const turn=clamp((phase-3.25)/.6),sway=.5-.5*Math.cos(cycle*Math.PI/2)
  const cutoff=upper?(feeling==='techno'?.72+sway*.20:feeling==='dnb'?.88+sway*.12:.78+sway*.22):1
  const send=upper?turn*(feeling==='breaks'?.20:feeling==='techno'?.12:.11):part==='extra'?turn*.075:0
  return {cutoff,send}
}
export function liveTargets(feeling:Feeling,part:Part|'lead',value:Touch,lead:boolean) {
  const t=clamp(value.tone),e=clamp(value.energy),s=clamp(value.space)
  const melodic=['chords','motif','air','lead'].includes(part),bass=part==='bass'
  const bassCut=feeling==='house'?900+t*2400+e*700:feeling==='techno'?1000+t*4600+e*2200:feeling==='breaks'?2000+t*8500+e*1200:1500+t*6500+e*1800
  const melodyCut=feeling==='house'?1500+t*5400+e*1000:feeling==='techno'?1600+t*9000+e*2600:feeling==='breaks'?3200+t*10800+e*1200:2800+t*8000+e*1800
  const extra=feeling==='dnb'?.55+e*1.05:feeling==='techno'?.45+e*1.35:.65+e*1.05
  const wetRange=feeling==='house'?.16:feeling==='techno'?.13:feeling==='breaks'?.30:.24
  const grit=bass?(feeling==='house'?.025+t*.06+e*.015:feeling==='techno'?.04+t*.16+e*.12:feeling==='breaks'?0:.015+t*.08+e*.025):0
  return {cutoff:bass?bassCut:melodic?melodyCut:20000,
    gain:partLevel(feeling,part)*(part==='extra'?extra:part==='air'?.75+e*.45:part==='motif'&&lead?.68:1),
    wet:melodic?.012+s*s*wetRange:0,resonance:bass&&feeling==='techno'?.7+e*.6:.65,
    body:bass?(feeling==='techno'||feeling==='dnb'?1+t*2+e*.7:-.5+t*2+e):0,grit,pan:part==='air'?(s-.5)*.55:part==='extra'?(.5-s)*.3:0}
}
export function eventExpression(part:Part,value:Touch,source:Record<string,unknown>,feeling:Feeling=DEFAULT_FEELING):Record<string,unknown> {
  if(part==='kick'||part==='sub'||part==='drums')return source
  const t=clamp(value.tone),e=clamp(value.energy),s=clamp(value.space),out={...source}
  if(part==='bass') {
    if(source.fm!==undefined)out.fm=Number(source.fm)*(.7+t*.55+e*.3)
    if(source.lpenv!==undefined)out.lpenv=Number(source.lpenv)*(.8+t*.35+e*.45)
    if(feeling==='dnb' && source.detune!==undefined)out.detune=.30+t*.18+e*.10
  }
  if((part==='bass'||part==='chords'||part==='motif') && feeling==='house' && Array.isArray(source.partials))out.partials=source.partials.map((v,i)=>Number(v)*(i<2?1:.7+t*.5))
  if((part==='bass'||part==='chords'||part==='motif') && feeling==='breaks' && source.s==='pulse') {
    out.pw=.18+t*.22;out.pwsweep=.04+e*.08;out.pwrate=2+e*2
    if(source.crush!==undefined)out.crush=Math.round(10-t*3)
  }
  if(part==='extra')out.gain=Number(source.gain??1)*(.85+e*.25)
  if(part==='chords'||part==='air') {
    out.decay=Number(source.decay??.18)*(.85+s*.35)
    out.release=Number(source.release??.1)*(.8+s*.5)
    if(feeling==='house')out.decay=Number(out.decay)*(1.1-e*.3)
    // Native Strudel phaser, confined to upper voices so kick/sub stay solid.
    out.phaserrate=feeling==='house'?.26:feeling==='techno'?.58:feeling==='breaks'?.38:.42
    out.phaserdepth=feeling==='dnb'?.12+s*.12:.18+s*.24
    out.phasercenter=feeling==='techno'?1350:feeling==='breaks'?2400:1800
    out.phasersweep=feeling==='techno'?350+s*400:500+s*900
  }
  return out
}
// Short notation slots should not cut a snare's body or a pluck's decay in half.
export function eventDuration(part:Part,source:Record<string,unknown>,duration:number,bpm:number) {
  if(typeof source.gate==='number')return clamp(source.gate,.02,3)
  if(part==='kick'||part==='bass'||part==='sub')return duration
  const envelope=Number(source.attack??.002)+Number(source.decay??.05)
  const cap=part==='drums'||part==='extra'?.24:Math.min(.5,60/bpm)
  return Math.max(duration,Math.min(cap,envelope))
}
export function gestureVoice(feeling:Feeling,note:Note,bar:number):Record<string,unknown> {
  const t=clamp(note.tone),e=clamp(note.energy),s=clamp(note.space)
  const pitch=harmonicPitch(note.pitch,feeling,bar)
  const base={note:pitch,gain:.23,attack:.004,decay:.17,sustain:0,release:.09+s*.12,lpf:12000,hpf:240,pan:.5,room:0,delay:0,delayfeedback:.25,orbit:40}
  if(feeling==='house')return {...base,s:'user',partials:[1,.25,.14+t*.18,.04,.05,.015],note:pitch-12,gain:.30,decay:.20,release:.10,vib:4.5,vibmod:.015,lpf:4800}
  if(feeling==='techno')return {...base,s:'sawtooth',note:pitch-12,gain:.17,attack:.002,decay:.075,release:.028,lpf:380+t*1700,lpq:1.1+e*1.1,lpenv:1.8+e*1.2,lpdecay:.055,lpsustain:.04,distort:.38,distortvol:.72}
  if(feeling==='breaks')return {...base,s:'pulse',gain:.075,pw:.18+t*.22,pwsweep:.05+e*.08,pwrate:3,crush:Math.round(10-t*3),decay:.08,release:.035,lpf:10500}
  return {...base,s:'user',partials:[1,.12,.18,.05],gain:.29,attack:.005,decay:.105,sustain:.06,release:.045+s*.025,gate:.11,vib:5.1,vibmod:.015,lpf:7800}
}
// DnB's touch part keeps moving in eighths; energy adds two syncopated pickups.
export function gestureStep(feeling:Feeling,step:number,energy:number) {
  return feeling==='dnb'?step%2===0 || energy>.7 && step%8===3:step%(energy>.7?2:4)===0
}
export function pumpProfile(feeling:Feeling) {
  return feeling==='house'?{depth:.50,seconds:.11}:feeling==='techno'?{depth:.68,seconds:.075}:feeling==='breaks'?{depth:.80,seconds:.065}:{depth:.84,seconds:.045}
}
