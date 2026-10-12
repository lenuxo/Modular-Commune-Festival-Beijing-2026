import {createContext,useContext} from 'react'
export const DetailContext=createContext<{detailPath:string|null;openDetail:(path:string,nested?:boolean)=>void}|null>(null)
export function useDetailPanel(){const context=useContext(DetailContext);if(!context)throw new Error('DetailProvider missing');return context}
