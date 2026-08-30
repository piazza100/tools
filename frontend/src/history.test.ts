import {describe,expect,it} from 'vitest'
import {addLocalHistory,clearLocalHistories,loadLocalHistories,removeLocalHistory} from './history'

class MemoryStorage{
 private values=new Map<string,string>()
 getItem(key:string){return this.values.get(key)??null}
 setItem(key:string,value:string){this.values.set(key,value)}
 removeItem(key:string){this.values.delete(key)}
}

const entry=(type:string,index:number)=>({calculatorType:type,title:`계산 ${index}`,inputJson:'{}',resultJson:JSON.stringify({main:String(index)})})

describe('anonymous calculation history',()=>{
 it('keeps the latest five entries per calculator',()=>{
  const storage=new MemoryStorage()
  for(let i=0;i<12;i++)addLocalHistory(entry('loan',i),storage)
  for(let i=0;i<3;i++)addLocalHistory(entry('date',i),storage)
  const histories=loadLocalHistories(storage)
  expect(histories.filter(x=>x.calculatorType==='loan')).toHaveLength(5)
  expect(histories.filter(x=>x.calculatorType==='date')).toHaveLength(3)
  expect(histories.find(x=>x.calculatorType==='loan')?.title).toBe('계산 11')
 })

 it('deletes one entry and clears migrated history',()=>{
  const storage=new MemoryStorage()
  const histories=addLocalHistory(entry('loan',1),storage)
  expect(removeLocalHistory(histories[0].id,storage)).toHaveLength(0)
  addLocalHistory(entry('date',1),storage)
  clearLocalHistories(storage)
  expect(loadLocalHistories(storage)).toEqual([])
 })
})
