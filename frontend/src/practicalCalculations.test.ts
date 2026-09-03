import {describe,expect,it} from 'vitest'
import {addCalendar,binomialProbability,bmi,combination,compoundInvestment,currencyConversion,electricityCost,gradeAverage,installment,permutation,scientific,splitBill,workPay} from './practicalCalculations'

describe('scientific expression parser',()=>{
 it.each([
  ['2+3*4',14],['(2+3)*4',20],['2^3^2',512],['5!',120],['sqrt(81)',9],['abs(-7)',7],['log(1000)',3],['ln(e)',1],['2.5e2+1',251],['10%3',1]
 ])('evaluates %s', (expression,expected)=>expect(scientific(expression as string)).toBeCloseTo(expected as number,10))
 it('supports degrees and radians',()=>{expect(scientific('sin(30)','deg')).toBeCloseTo(.5);expect(scientific('cos(pi)','rad')).toBeCloseTo(-1);expect(scientific('asin(0.5)','deg')).toBeCloseTo(30)})
 it.each(['','2+','sqrt(-1)','1/0','171!','unknown(1)','(2+3'])('rejects invalid expression %s',expression=>expect(()=>scientific(expression)).toThrow())
})

describe('money and everyday calculations',()=>{
 it('keeps zero-rate investment equal to contributions',()=>expect(compoundInvestment(1000,100,0,12).future).toBe(2200))
 it('compounds investment with end-of-month contributions',()=>{const x=compoundInvestment(10000000,500000,5,120);expect(x.future).toBeGreaterThan(x.principal);expect(x.principal).toBe(70000000)})
 it('calculates zero-interest installments exactly',()=>expect(installment(1200000,0,0,12)).toEqual({financed:1200000,monthly:100000,total:1200000,interest:0}))
 it('accounts for a down payment and interest',()=>{const x=installment(3000000,500000,6,12);expect(x.financed).toBe(2500000);expect(x.interest).toBeGreaterThan(0)})
 it.each([[10000,[1,1,1],1],[10001,[1,2,1],100],[999,[0,1],1]])('preserves split total within the requested rounding unit',(total,weights,round)=>{const shares=splitBill(total as number,weights as number[],round as number);expect(shares.reduce((a,b)=>a+b,0)).toBe(Math.round((total as number)/(round as number))*(round as number))})
 it('rejects an empty split',()=>expect(()=>splitBill(100,[0,0])).toThrow())
 it('calculates work premiums',()=>expect(workPay(10000,160,10,5,8).total).toBe(10000*(160+15+2.5+12)))
 it('calculates configurable electricity components',()=>expect(electricityCost(300,150,1000,10).total).toBe(50600))
 it('adds exchange and card fees separately',()=>expect(currencyConversion(100,1300,1,0.2).total).toBe(131560))
})

describe('health, dates, grades, and probability',()=>{
 it.each([[170,65,'정상'],[170,50,'저체중'],[170,80,'비만']])('classifies adult BMI', (height,weight,category)=>expect(bmi(weight as number,height as number).category).toBe(category))
 it('moves leap and month-end dates safely',()=>{expect(addCalendar('2024-02-28',1,'days')).toBe('2024-02-29');expect(addCalendar('2024-01-31',1,'months')).toBe('2024-02-29');expect(addCalendar('2024-02-29',1,'years')).toBe('2025-02-28');expect(addCalendar('2026-01-01',-1,'days')).toBe('2025-12-31')})
 it('calculates weighted GPA',()=>{const x=gradeAverage([{credits:3,grade:4.5},{credits:3,grade:4},{credits:2,grade:3.5}]);expect(x.credits).toBe(8);expect(x.average).toBeCloseTo(4.0625)})
 it.each([[5,2,10],[10,0,1],[10,10,1]])('calculates combinations', (n,r,expected)=>expect(combination(n as number,r as number)).toBe(expected))
 it('calculates permutations',()=>expect(permutation(5,2)).toBe(20))
 it('calculates binomial probability',()=>expect(binomialProbability(10,3,.5)).toBeCloseTo(.1171875))
 it.each([[3,4],[-1,0],[171,1]])('rejects invalid combinatoric ranges',(n,r)=>expect(()=>combination(n as number,r as number)).toThrow())
})
