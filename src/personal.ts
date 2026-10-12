import {createContext,useContext} from 'react'
import type {Dispatch,SetStateAction} from 'react'
export interface Personal {saved:string[];brands:string[];visited:string[]}
export const defaults:Personal={saved:[],brands:[],visited:[]}
export const storageKey='mc-beijing-2026-personal-v1'
export function validatePersonal(value:unknown):Personal {
 if(!value||typeof value!=='object')throw new Error('备份内容无效')
 const v=value as Partial<Personal>
 for(const k of ['saved','brands','visited'] as const)if(!Array.isArray(v[k])||!v[k].every(x=>typeof x==='string'))throw new Error('备份格式无效')
 // Older records may include a theme preference; keep their personal data only.
 return {saved:v.saved!,brands:v.brands!,visited:v.visited!}
}
export function readPersonal(){try{const text=localStorage.getItem(storageKey);return text?validatePersonal(JSON.parse(text)):defaults}catch{return defaults}}
export const PersonalContext=createContext<{personal:Personal;setPersonal:Dispatch<SetStateAction<Personal>>;toggle:(key:'saved'|'brands'|'visited',id:string)=>void;storageError:boolean;notice:string;notify:(text:string)=>void}|null>(null)
export function usePersonal(){const c=useContext(PersonalContext);if(!c)throw new Error('PersonalProvider missing');return c}
