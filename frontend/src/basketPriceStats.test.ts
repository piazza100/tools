import {describe,expect,it} from 'vitest'
import {basketSummary,changeRate,signalFor,type BasketPriceItem} from './basketPriceStats'

const items:BasketPriceItem[]=[
 {itemCode:'apple',name:'사과',unit:'10개',quantity:1,currentPrice:30000,dayAgoPrice:29000,weekAgoPrice:24000,monthAgoPrice:20000,yearAgoPrice:18000},
 {itemCode:'rice',name:'쌀',unit:'10kg',quantity:2,currentPrice:25000,dayAgoPrice:25000,weekAgoPrice:25000,monthAgoPrice:24000,yearAgoPrice:23000},
]

describe('basket price statistics',()=>{
 it('calculates a weighted basket instead of averaging item rates',()=>{
  const summary=basketSummary(items)
  expect(summary.total).toBe(80000)
  expect(summary.monthRate).toBeCloseTo(17.647)
  expect(summary.contributions[0].name).toBe('사과')
  expect(summary.contributions[0].share).toBeCloseTo(83.333)
 })
 it('does not invent a comparison when a price is missing',()=>expect(changeRate(100,null)).toBeNull())
 it('marks a 15 percent weekly rise as a surge',()=>expect(signalFor(items[0])).toBe('surge'))
})
