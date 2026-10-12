import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import type {Plugin} from 'vite'
function offlineShell():Plugin{return {
 name:'festival-offline-shell',
 generateBundle(_,bundle){
  const files=['./','./index.html','./favicon.svg','./maps/venues.png','./maps/floors.jpg','./maps/booths.png','./maps/indie.png','./maps/exhibitors.png',...Object.keys(bundle).map(k=>'./'+k)]
  const version=Object.keys(bundle).join('-')
  this.emitFile({type:'asset',fileName:'sw.js',source:`
const CACHE = 'mc-guide-'+${JSON.stringify(version)};
const FILES = ${JSON.stringify([...new Set(files)])};
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(FILES)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('mc-guide-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==self.location.origin)return;
 event.respondWith(caches.open(CACHE).then(async cache=>{
  if(event.request.mode==='navigate')return (await cache.match('./index.html'))||fetch(event.request);
  return (await cache.match(event.request,{ignoreVary:true}))||fetch(event.request);
 }));
});`})
 }
}}
export default defineConfig({ plugins: [react(), tailwindcss(),offlineShell()], base: './' })
