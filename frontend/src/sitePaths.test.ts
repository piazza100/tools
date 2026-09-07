import {describe,expect,it} from 'vitest'
import {INDEXABLE_PATHS} from '../worker/sitePaths'

describe('sitemap paths',()=>{
 it('contains no duplicate or obsolete paths',()=>{
  expect(new Set(INDEXABLE_PATHS).size).toBe(INDEXABLE_PATHS.length)
  expect(INDEXABLE_PATHS).not.toContain('/calculators/apartment-funding-plan')
 })

 it.each([
  '/calculators/apartment-subscription-plan', '/calculators/apartment-purchase-plan',
  '/calculators/scientific-calculator', '/calculators/compound-investment',
  '/calculators/installment-payment', '/calculators/split-bill',
  '/calculators/bmi-calculator', '/calculators/date-add-subtract',
  '/calculators/work-hours-pay', '/calculators/electricity-cost',
  '/calculators/exchange-card-fee', '/calculators/gpa-calculator',
  '/calculators/probability-combination', '/guides/salary-take-home',
  '/guides/loan-repayment', '/guides/minimum-wage',
 ])('includes %s',path=>expect(INDEXABLE_PATHS).toContain(path))
})
