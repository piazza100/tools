import {describe,expect,it} from 'vitest'
import {housingPlan} from './housingPlan'

describe('housing subscription cash-flow plan',()=>{
 it('keeps financed interim installments out of cash and includes principal at move-in',()=>{
  const result=housingPlan({startMonth:'2026-08',moveInMonth:'2027-08',initialCash:300000000,monthlySaving:4000000,additionalFunds:0,depositReturn:100000000,price:500000000,optionCost:10000000,contractRate:10,interimRate:60,interimCount:6,loanInstallments:4,firstInterimMonth:'2026-10',interimInterval:2,annualLoanRate:4,balanceRate:30,acquisitionTaxRate:1.1,incidentalCost:5000000})
  expect(result.interimLoanPrincipal).toBe(200000000)
  expect(result.rows[2].property).toBe(0)
  expect(result.rows[10].property).toBe(-50000000)
 expect(result.requiredMortgage).toBeGreaterThan(0)
 })
 it('finances only the selected interim rounds',()=>{
  const result=housingPlan({startMonth:'2026-01',moveInMonth:'2027-01',initialCash:500000000,monthlySaving:0,additionalFunds:0,depositReturn:0,price:600000000,optionCost:0,contractRate:10,interimRate:60,interimCount:6,loanInstallments:2,loanRounds:[2,5],firstInterimMonth:'2026-02',interimInterval:2,annualLoanRate:4,balanceRate:30,acquisitionTaxRate:0,incidentalCost:0})
  expect(result.interimLoanPrincipal).toBe(120000000)
  expect(result.rows.find(x=>x.month==='2026-02')?.property).toBe(-60000000)
  expect(result.rows.find(x=>x.month==='2026-04')?.property).toBe(0)
 })
 it('applies manual income or expense in the selected month',()=>{
  const result=housingPlan({startMonth:'2026-01',moveInMonth:'2026-02',initialCash:100,monthlySaving:0,additionalFunds:0,depositReturn:0,price:0,optionCost:0,contractRate:0,interimRate:0,interimCount:0,loanInstallments:0,firstInterimMonth:'2026-01',interimInterval:1,annualLoanRate:0,balanceRate:0,acquisitionTaxRate:0,incidentalCost:0,manualEvents:[{month:'2026-01',amount:50,memo:'추가 수입'}]})
  expect(result.rows[0].extra).toBe(50)
  expect(result.rows[0].closing).toBe(150)
 })
 it('includes monthly saving in the start month only when selected',()=>{
  const base={startMonth:'2026-01',moveInMonth:'2026-02',initialCash:100,monthlySaving:20,additionalFunds:0,depositReturn:0,price:0,optionCost:0,contractRate:0,interimRate:0,interimCount:0,loanInstallments:0,firstInterimMonth:'2026-01',interimInterval:1,annualLoanRate:0,balanceRate:0,acquisitionTaxRate:0,incidentalCost:0}
  expect(housingPlan(base).rows[0].saving).toBe(0)
  expect(housingPlan({...base,includeStartMonthSaving:true}).rows[0].saving).toBe(20)
 })
 it('deducts the contract payment in the start month only when selected',()=>{
  const base={startMonth:'2026-01',moveInMonth:'2026-02',initialCash:200,monthlySaving:0,additionalFunds:0,depositReturn:0,price:1000,optionCost:0,contractRate:10,interimRate:0,interimCount:0,loanInstallments:0,firstInterimMonth:'2026-01',interimInterval:1,annualLoanRate:0,balanceRate:0,acquisitionTaxRate:0,incidentalCost:0}
  expect(housingPlan(base).rows[0].property).toBe(-100)
  expect(housingPlan({...base,includeContractAtStart:false}).rows[0].property).toBe(0)
 })
})
