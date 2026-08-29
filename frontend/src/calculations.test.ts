import {describe,expect,it} from 'vitest'
import {diffDays,fullAge,loan,minimumWages,monthlyWithholding,salaryEstimate,splitExpense} from './calculations'
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
})
