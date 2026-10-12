import {useEffect, useState} from 'react'
import type {ReactNode} from 'react'
import {PersonalContext as Context,readPersonal,storageKey as key} from './personal'
import type {Personal} from './personal'
export function PersonalProvider({children}:{children:ReactNode}){
 const [personal,setPersonal]=useState<Personal>(readPersonal);const [storageError,setStorageError]=useState(false);const [notice,notify]=useState('')
 // Storage status reflects an external write, rather than derived render state.
 // oxlint-disable-next-line react/set-state-in-effect
 useEffect(()=>{try{localStorage.setItem(key,JSON.stringify(personal));setStorageError(false)}catch{setStorageError(true)}},[personal])
 useEffect(()=>{const media=matchMedia('(prefers-color-scheme: dark)');const apply=()=>document.documentElement.dataset.theme=personal.theme==='system'?(media.matches?'dark':'light'):personal.theme;apply();media.addEventListener('change',apply);return()=>media.removeEventListener('change',apply)},[personal.theme])
 useEffect(()=>{if(!notice)return;const t=setTimeout(()=>notify(''),2800);return()=>clearTimeout(t)},[notice])
 const toggle=(field:'saved'|'brands'|'visited',id:string)=>{const active=personal[field].includes(id);setPersonal(p=>({...p,[field]:p[field].includes(id)?p[field].filter(x=>x!==id):[...p[field],id]}));notify(active?'已移除标记':field==='saved'?'已加入我的日程 · 收藏不代表报名':field==='visited'?'已标记为逛过':'已加入想逛清单')}
 return <Context.Provider value={{personal,setPersonal,toggle,storageError,notice,notify}}>{children}</Context.Provider>
}
