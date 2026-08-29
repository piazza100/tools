import type {History} from './api'

export type LocalHistory=Omit<History,'id'>&{id:string}
type HistoryStorage=Pick<Storage,'getItem'|'setItem'|'removeItem'>

const KEY='wonderlife:calculation-history:v1'
const storage=():HistoryStorage|undefined=>typeof window==='undefined'?undefined:window.localStorage

export function loadLocalHistories(target=storage()):LocalHistory[]{
 if(!target)return []
 try{
  const value=JSON.parse(target.getItem(KEY)||'[]')
  return Array.isArray(value)?value.filter((item):item is LocalHistory=>Boolean(item&&typeof item.id==='string'&&typeof item.calculatorType==='string')):[]
 }catch{return []}
}

export function addLocalHistory(entry:Omit<LocalHistory,'id'|'createdAt'>,target=storage()):LocalHistory[]{
 const next:LocalHistory={...entry,id:crypto.randomUUID(),createdAt:new Date().toISOString()}
 const count=new Map<string,number>()
 const histories=[next,...loadLocalHistories(target)].filter(item=>{
  const value=(count.get(item.calculatorType)||0)+1
  count.set(item.calculatorType,value)
  return value<=10
 })
 target?.setItem(KEY,JSON.stringify(histories))
 return histories
}

export function removeLocalHistory(id:string,target=storage()):LocalHistory[]{
 const histories=loadLocalHistories(target).filter(item=>item.id!==id)
 target?.setItem(KEY,JSON.stringify(histories))
 return histories
}

export function clearLocalHistories(target=storage()){target?.removeItem(KEY)}
