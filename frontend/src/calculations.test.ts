import {describe,expect,it} from 'vitest'
import {businessDays2026,carOwnershipCost,diffDays,earlyRepayment,fullAge,holidaysByYear,housingRentComparison,loan,minimumWages,monthlyBudget,monthlyWithholding,movingCost,partTimePay,repaymentCapacity,retirementEstimate,salaryEstimate,savingsInterest,socialInsurance,splitExpense,vat} from './calculations'
describe('exact calculations',()=>{
 it('handles leap day and calendar dates',()=>expect(diffDays('2024-02-28','2024-03-01')).toBe(2))
 it('calculates international age before birthday',()=>expect(fullAge('2000-12-31','2026-08-28')).toBe(25))
 it('amortizes zero-rate loan exactly',()=>expect(loan(12000000,0,12,'annuity').totalPayment).toBe(12000000))
 it('uses official 2026 minimum wage',()=>expect(minimumWages.find(x=>x.year===2026)?.monthly).toBe(2156880))
 it('preserves weighted split total',()=>expect(splitExpense(10000,3,[1,2,1]).reduce((a,b)=>a+b,0)).toBeCloseTo(10000))
 it('matches the NTS table for 2.5m monthly pay and one dependent',()=>expect(monthlyWithholding(2500000,1)).toBe(35600))
 it('uses the 2020-2022 withholding table for historical salaries',()=>{
  expect(monthlyWithholding(2000000,1,2020)).toBe(19520)
  expect(monthlyWithholding(2500000,1,2022)).toBe(41630)
  expect(monthlyWithholding(2500000,1,2023)).toBe(35600)
 })
 it('reconciles the provided 2025 30m salary example',()=>{
  const x=salaryEstimate(30000000,2025,0,1)
  expect(x.income).toBe(35600)
  expect(Math.round(x.pension)).toBe(112500)
 expect(Math.round(x.health)).toBe(88625)
 })
 it('applies each historical pension ceiling period',()=>{
  expect(Math.round(salaryEstimate(100000000,2020,0,1,'first').pension)).toBe(218700)
  expect(Math.round(salaryEstimate(100000000,2021,0,1,'second').pension)).toBe(235800)
  expect(Math.round(salaryEstimate(100000000,2022,0,1,'second').pension)).toBe(248850)
  expect(Math.round(salaryEstimate(100000000,2023,0,1,'first').pension)).toBe(248850)
  expect(Math.round(salaryEstimate(100000000,2024,0,1,'second').pension)).toBe(277650)
  expect(Math.round(salaryEstimate(100000000,2026,0,1,'second').pension)).toBe(313025)
 })
 it('applies the July 2022 employment insurance increase',()=>{
  expect(Math.round(salaryEstimate(24000000,2022,0,1,'first').employment)).toBe(16000)
  expect(Math.round(salaryEstimate(24000000,2022,0,1,'second').employment)).toBe(18000)
 })
 it('separates VAT from a tax-inclusive total without losing the total',()=>{
  const x=vat(110000,'total')
  expect(Math.round(x.supply)).toBe(100000)
  expect(Math.round(x.tax)).toBe(10000)
  expect(Math.round(x.total)).toBe(110000)
 })
 it('calculates deposit interest and general withholding tax',()=>{
  const x=savingsInterest(10000000,3,12,'deposit',false,.154)
  expect(x.grossInterest).toBe(300000)
  expect(x.tax).toBe(46200)
  expect(x.maturity).toBe(10253800)
 })
 it('adds weekly holiday allowance only from 15 scheduled hours',()=>{
  expect(partTimePay(10320,4,3).weeklyHoliday).toBe(0)
  expect(partTimePay(10320,5,3).weeklyHoliday).toBe(30960)
 })
 it('excludes weekends and weekday holidays from 2026 business days',()=>{
  const x=businessDays2026('2026-03-01','2026-03-03',true)
  expect(x.business).toBe(1)
  expect(x.weekends).toBe(1)
  expect(x.holidays).toBe(1)
 })
 it('includes historical elections, temporary holidays, and substitutes',()=>{
  expect(Object.keys(holidaysByYear)).toEqual(['2020','2021','2022','2023','2024','2025','2026'])
  expect(holidaysByYear[2020]).toContainEqual({date:'2020-08-17',name:'임시공휴일'})
  expect(holidaysByYear[2023]).toContainEqual({date:'2023-10-02',name:'임시공휴일'})
  expect(holidaysByYear[2024]).toContainEqual({date:'2024-10-01',name:'국군의 날 임시공휴일'})
  expect(holidaysByYear[2025]).toContainEqual({date:'2025-06-03',name:'제21대 대통령선거'})
 })
 it('uses the same official social-insurance rates as salary estimates',()=>{
  const x=socialInsurance(3000000,200000,2026)
  expect(Math.round(x.health)).toBe(100660)
  expect(Math.round(x.care)).toBe(13227)
 })
 it('calculates housing decision scenarios without losing cost components',()=>{
  const capacity=repaymentCapacity(60000000,0,300000000,4,360,40)
  expect(capacity.payment).toBeGreaterThan(1400000)
  expect(capacity.dsr).toBeGreaterThan(28)
  const rent=housingRentComparison(300000000,0,200000000,4,150000,24,3)
  expect(rent.total).toBe(25600000)
 })
 it('calculates budget, prepayment, vehicle and moving totals',()=>{
  expect(monthlyBudget(3500000,1200000,900000,400000,10000000,50000000).available).toBe(1000000)
  expect(earlyRepayment(200000000,4,240,30000000,1).netBenefit).toBeGreaterThan(0)
  expect(carOwnershipCost(40000000,10000000,5,60,1200000,500000,200000,100000,600000).monthlyTotal).toBeGreaterThan(800000)
  expect(movingCost(1,2,3,4,5,6,7).total).toBe(28)
 })
 it('requires one year for a retirement allowance estimate',()=>{
  expect(retirementEstimate('2025-01-01','2025-06-30',3000000).retirement).toBe(0)
  expect(retirementEstimate('2024-01-01','2025-01-01',3000000).retirement).toBeGreaterThanOrEqual(3000000)
 })
})
