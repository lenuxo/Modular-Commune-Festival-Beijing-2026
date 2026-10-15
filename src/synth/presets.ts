import * as S from '@strudel/web'
import type {Controls, Pattern} from '@strudel/web'
import type {Feeling} from './model'
import type {Part} from './music-controls'

export type Arrangement = {gain: number; parts: {part: Part; pattern: Pattern}[]}
const config = (pattern: Pattern, values: Controls) => pattern.withValue(v => ({...v, ...values}))
const rows = (patterns: Pattern[]) => S.slowcat(...patterns)
const melody = (bars: string[], values: Controls) => config(rows(bars.map(bar=>S.note(S.mini(bar)))), values)
// All drum voices are synthesized by Strudel. No sound bank or network sample loader.
const drum = (s: string, bars: number[][], values: Controls) => config(rows(bars.map((hits,b)=>
  S.s(S.mini(Array.from({length:16},(_,i)=>hits.includes(i)?s:'~').join(' '))).withValue(v=>({...v,
    ...values, pan:values.pan ?? (b%2?.53:.47)})))), values)
const repeat = (hits: number[]) => Array.from({length:8},()=>hits)
const backbeat = repeat([4,12])
const voice = {attack:.003,decay:.15,sustain:0,release:.08}
const hats = (bars: number[][], gain: number, swing=0) => drum('white',bars,{...voice,gain,hpf:7200,lpf:12500,decay:.035,release:.018}).swingBy(swing,8)
const snare = (gain: number, bars=backbeat, metal=false) => S.stack(
  drum('white',bars,{...voice,gain,hpf:metal?2400:1400,lpf:8800,decay:.13,release:.045}),
  drum('triangle',bars,{...voice,note:50,fm:metal?1.8:0,fmh:2.7,gain:gain*.65,penv:9,pdecay:.025,decay:.065,release:.025}))
const clap = () => S.stack(drum('[white white white]',backbeat,{...voice,gain:.43,hpf:1500,lpf:8500,decay:.03,release:.015}),drum('white',backbeat,{...voice,gain:.24,hpf:1200,lpf:7200,decay:.16,release:.035}))
const kick = (bars: number[][], gain: number, decay: number, note: number) => drum('sbd',bars,{gain,decay,note,pdecay:.035,penv:27,lpf:3800})
const crash = () => drum('white',[[0],[],[],[],[0],[],[],[]],{...voice,gain:.1,attack:.003,decay:.7,release:.3,hpf:6200,pan:.62})
const riser = () => drum('white',[[],[],[],[12],[],[],[],[8]],{gain:.07,attack:.26,decay:.15,sustain:0,release:.14,hpf:2600,lpf:8500,pan:.5})

function garage(): Arrangement {
  const bass = [
    'd2 ~ ~ ~ ~ a2 ~ c3 ~ ~ d2 ~ ~ a2 ~ ~','d2 ~ ~ a2 ~ ~ c3 ~ ~ d3 ~ ~ a2 ~ c3 ~',
    'g1 ~ ~ ~ ~ d2 ~ f2 ~ ~ g1 ~ ~ d2 ~ ~','g1 ~ ~ d2 ~ ~ f2 ~ ~ g2 ~ ~ d2 ~ ~ ~',
    'bb1 ~ ~ ~ ~ f2 ~ a2 ~ ~ bb1 ~ ~ f2 ~ ~','bb1 ~ ~ f2 ~ ~ a2 ~ ~ bb2 ~ ~ f2 ~ a2 ~',
    'c2 ~ ~ ~ ~ g2 ~ bb2 ~ ~ c2 ~ ~ g2 ~ ~','c2 ~ ~ g2 ~ ~ bb2 ~ ~ c3 ~ g2 ~ ~ ~ ~']
  const chords=['f3,a3,c4,e4','f3,a3,c4,e4','f3,a3,bb3,d4','f3,a3,bb3,d4','f3,a3,c4,d4','f3,a3,c4,d4','e3,g3,bb3,d4','e3,g3,bb3,d4']
  return {gain:1.05,parts:[
    {part:'kick',pattern:kick([[0,6,10],[0,7,10,15],[0,6,11],[0,3,10],[0,6,10],[0,7,10,15],[0,6,11],[0,6,10]],.64,.19,33)},
    {part:'drums',pattern:S.stack(snare(.44),hats([[0,2,3,6,8,10,11,14],[0,2,6,7,8,10,14,15],[0,2,3,6,8,10,14],[0,2,6,7,8,11,14],[0,2,3,6,8,10,11,14],[0,2,6,7,8,10,14,15],[0,2,3,6,8,10,14],[0,2,6,7,8,10,11,15]],.23,.10))},
    {part:'extra',pattern:drum('square',[[3,11],[7,15],[3,10],[7,13],[3,11,15],[7,10,15],[3,10,13],[7,11]],{...voice,note:78,fm:3.4,fmh:3.5,gain:.13,hpf:1300,decay:.035,release:.02}).swingBy(.10,8)},
    {part:'bass',pattern:melody(bass,{...voice,s:'sine',fm:1.9,fmh:1,gain:.72,lpf:1800,decay:.17,fmdecay:.07,fmsustain:.1})},
    {part:'sub',pattern:melody(bass,{...voice,s:'sine',gain:.32,decay:.16})},
    {part:'chords',pattern:config(rows(chords.map((c,b)=>S.note(S.mini(c)).struct(S.mini(b%2?'~ ~ x ~ ~ x ~ x':'~ x ~ ~ x ~ x ~')))),{...voice,s:'sine',fm:1.6,fmh:2,fmdecay:.08,fmsustain:.2,gain:.16,decay:.24,hpf:260,lpf:3800}).swingBy(.07,8)},
    {part:'motif',pattern:melody([
      '~ ~ a4 ~ d5 ~ ~ f5 ~ ~ e5 ~ d5 ~ ~ ~','~ ~ a4 ~ c5 ~ ~ d5 ~ ~ ~ ~ a4 ~ ~ ~',
      '~ ~ bb4 ~ d5 ~ ~ g5 ~ ~ f5 ~ d5 ~ ~ ~','~ ~ bb4 ~ a4 ~ ~ g4 ~ ~ ~ ~ d5 ~ ~ ~',
      '~ ~ a4 ~ d5 ~ ~ f5 ~ ~ e5 ~ d5 ~ ~ ~','~ ~ c5 ~ d5 ~ ~ f5 ~ ~ a5 ~ g5 ~ f5 ~',
      '~ ~ g4 ~ c5 ~ ~ e5 ~ ~ d5 ~ c5 ~ ~ ~','~ ~ e5 ~ d5 ~ ~ c5 ~ g4 ~ ~ ~ ~ ~ ~'],
      {...voice,s:'triangle',fm:.7,fmh:2,gain:.4,decay:.26,release:.18,hpf:450,lpf:5200})},
    {part:'air',pattern:melody(['~','~','~','~','~ a5 ~ ~ ~ e5 ~ ~','~ f5 ~ ~ ~ a5 ~ ~','~ g5 ~ ~ ~ e5 ~ ~','~ e5 ~ ~ ~ d5 ~ ~'],{...voice,s:'sine',gain:.14,decay:.18,pan:.72})},
    {part:'fx',pattern:riser()},
  ]}
}
function acid(): Arrangement {
  const bass=[
    'f2 f2 ~ f3 ~ eb3 f2 ~ ab2 ~ f2 c3 ~ f2 ~ eb3','f2 ~ f2 c3 ~ f3 eb3 ~ f2 ~ ab2 ~ c3 ~ f2 ~',
    'f2 f2 ~ f3 ~ eb3 f2 ~ ab2 ~ f2 c3 ~ f2 ~ eb3','f2 ~ c3 ~ f3 ~ eb3 f2 ~ ab2 ~ c3 f2 ~ ~ ~',
    'db2 db2 ~ db3 ~ c3 db2 ~ f2 ~ db2 ab2 ~ db2 ~ c3','db2 ~ db2 ab2 ~ db3 c3 ~ db2 ~ f2 ~ ab2 ~ db2 ~',
    'f2 f2 ~ f3 ~ eb3 f2 ~ ab2 ~ f2 c3 ~ f2 ~ eb3','f2 ~ c3 ~ f3 ~ eb3 f2 ~ c3 ~ ab2 f2 ~ ~ ~']
  return {gain:.92,parts:[
    {part:'kick',pattern:kick([[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12,15],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8]],.8,.25,29)},
    {part:'drums',pattern:S.stack(snare(.28,backbeat,true),hats(repeat([0,2,4,6,8,10,12,14]),.20),drum('white',repeat([2,6,10,14]),{...voice,gain:.26,hpf:6200,decay:.12,release:.04}))},
    {part:'extra',pattern:S.stack(drum('sine',[[3,10],[7,11],[3,7,14],[7,10,15],[3,10,13],[7,11,15],[3,6,11],[9,11,13,15]],{...voice,note:55,penv:12,pdecay:.035,fm:2.2,fmh:2.7,gain:.28,decay:.07}),hats([[],[15],[7],[11,15],[3,9],[7,13],[3,9,15],[9,11,13]],.18))},
    {part:'bass',pattern:melody(bass,{...voice,s:'sawtooth',gain:.55,decay:.105,release:.035,lpf:750,lpq:4,lpenv:3.5,lpdecay:.11,lpsustain:.05,hpf:55})},
    {part:'sub',pattern:melody(['~ f1 ~ f1 ~ f1 ~ f1','~ f1 ~ f1 ~ f1 ~ eb1','~ f1 ~ f1 ~ f1 ~ f1','~ f1 ~ f1 ~ f1 ~ ~','~ db1 ~ db1 ~ db1 ~ db1','~ db1 ~ db1 ~ db1 ~ eb1','~ f1 ~ f1 ~ f1 ~ f1','~ f1 ~ f1 ~ ~ ~ ~'],{...voice,s:'sine',gain:.5,decay:.17})},
    {part:'chords',pattern:melody(['~ ~ [ab3,c4,eb4] ~ ~ ~ ~ ~','~ ~ ~ ~ ~ [ab3,c4,eb4] ~ ~','~ ~ [ab3,c4,eb4] ~ ~ ~ ~ ~','~ ~ ~ ~ ~ [ab3,c4,eb4] ~ ~','~ ~ [f3,ab3,c4] ~ ~ ~ ~ ~','~ ~ ~ ~ ~ [f3,ab3,c4] ~ ~','~ ~ [ab3,c4,eb4] ~ ~ ~ ~ ~','~ ~ ~ ~ ~ [ab3,c4,eb4] ~ ~'],{...voice,s:'supersaw',unison:3,detune:.12,gain:.12,decay:.12,hpf:480,lpf:1900})},
    {part:'motif',pattern:melody(['~ c5 ~ ~ ~ ~ ab4 ~','~ f5 ~ ~ ~ eb5 ~ ~','~ c5 ~ ~ ~ ~ ab4 ~','~ f5 ~ eb5 c5 ~ ~ ~','~ ab4 ~ ~ ~ ~ f4 ~','~ db5 ~ ~ ~ c5 ~ ~','~ c5 ~ ~ ~ ~ eb5 ~','f5 ~ eb5 ~ c5 ~ ab4 ~'],{...voice,s:'square',gain:.16,decay:.08,release:.06,hpf:750,lpf:2600})},
    {part:'air',pattern:crash()}, {part:'fx',pattern:riser()},
  ]}
}
function trance(): Arrangement {
  const roots=['a','a','f','f','c','c','g','g']
  const bass=roots.map((r,b)=>`~ ${r}2 ${r}2 ${r}3 ~ ${r}2 ${r}2 ${r}3 ~ ${r}2 ${r}2 ${r}3 ~ ${r}2 ${b===7?'~':r+'2'} ~`)
  const chords=['a3,c4,e4','a3,c4,e4','a3,c4,f4','a3,c4,f4','g3,c4,e4','g3,c4,e4','g3,b3,d4','g3,b3,d4']
  return {gain:.9,parts:[
    {part:'kick',pattern:kick([[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8,12],[0,4,8]],.78,.21,31)},
    {part:'drums',pattern:S.stack(clap(),hats(repeat([0,2,4,6,8,10,12,14]),.16),drum('white',repeat([2,6,10,14]),{...voice,gain:.30,hpf:6600,decay:.13,release:.05}))},
    {part:'extra',pattern:S.stack(hats([[],[7,15],[],[11,15],[1,3,5,7,9,11,13,15],[3,7,11,15],[1,3,5,7,9,11,13,15],[9,11,13,14,15]],.17),snare(.16,[[],[],[],[14,15],[],[],[15],[10,12,13,14,15]]))},
    {part:'bass',pattern:melody(bass,{...voice,s:'supersaw',unison:2,detune:.09,gain:.38,decay:.085,release:.025,lpf:1800,hpf:90})},
    {part:'sub',pattern:melody(bass,{...voice,s:'sine',gain:.43,decay:.10,release:.03})},
    {part:'chords',pattern:config(rows(chords.map(c=>S.note(S.mini(c)).struct(S.mini('~ x ~ x ~ x x ~')))),{...voice,s:'supersaw',unison:5,spread:.85,detune:.22,gain:.15,attack:.015,decay:.18,sustain:.12,release:.14,hpf:340,lpf:5600})},
    {part:'motif',pattern:melody([
      'e5 ~ a5 ~ b5 ~ c6 ~ ~ b5 a5 ~ e5 ~ ~ ~','e5 ~ a5 ~ b5 ~ c6 ~ b5 ~ a5 ~ g5 ~ e5 ~',
      'e5 ~ a5 ~ c6 ~ a5 ~ ~ g5 f5 ~ e5 ~ ~ ~','c5 ~ f5 ~ a5 ~ c6 ~ b5 ~ a5 ~ g5 ~ e5 ~',
      'e5 ~ g5 ~ c6 ~ d6 ~ ~ c6 g5 ~ e5 ~ ~ ~','e5 ~ g5 ~ c6 ~ e6 ~ d6 ~ c6 ~ b5 ~ g5 ~',
      'd5 ~ g5 ~ a5 ~ b5 ~ ~ a5 g5 ~ d5 ~ ~ ~','d5 ~ g5 ~ b5 ~ a5 ~ g5 ~ d5 ~ e5 ~ ~ ~'],{...voice,s:'supersaw',unison:5,detune:.17,spread:.75,gain:.26,decay:.23,sustain:.08,release:.17,hpf:600,lpf:6200})},
    {part:'air',pattern:melody(['a4 e5 c5 e5 a4 e5 c5 e5','a4 e5 c5 g5 a4 e5 c5 e5','a4 c5 f5 c5 a4 c5 f5 c5','a4 c5 f5 a5 g5 f5 e5 c5','g4 c5 e5 g5 g4 c5 e5 g5','g4 c5 e5 b5 g5 e5 d5 c5','g4 d5 b4 d5 g4 d5 b4 d5','g4 b4 d5 g5 ~ d5 b4 ~'],{...voice,s:'triangle',fm:.8,fmh:2,gain:.22,decay:.12,hpf:1000,pan:.67})},
    {part:'fx',pattern:S.stack(crash(),riser())},
  ]}
}
export const arrangements: Record<Feeling, Arrangement> = {bounce:garage(),night:acid(),float:trance()}
