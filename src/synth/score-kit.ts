import * as S from '@strudel/web'
import type {Controls,Pattern} from '@strudel/web'
import type {Part} from './music-controls'

export type Arrangement = {gain:number;parts:{part:Part;pattern:Pattern}[]}
export const V = {attack:.002,decay:.1,sustain:0,release:.04}
const config=(p:Pattern,v:Controls)=>p.withValue(x=>({...x,...v}))
export const layer=(...patterns:Pattern[])=>S.stack(...patterns)
export const repeat=(hits:number[],bars=16)=>Array.from({length:bars},()=>[...hits])
export const melody=(bars:string[],v:Controls)=>config(S.slowcat(...bars.map(b=>S.note(S.mini(b)))),v)
export const chord=(bars:string[],rhythms:string[],v:Controls)=>config(S.slowcat(...bars.map((b,i)=>S.note(S.mini(b)).struct(S.mini(rhythms[i%rhythms.length])))),v)
export const drum=(sound:string,bars:number[][],v:Controls)=>config(S.slowcat(...bars.map(hits=>S.s(S.mini(Array.from({length:16},(_,i)=>hits.includes(i)?sound:'~').join(' '))))),v)
