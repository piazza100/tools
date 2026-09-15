import {describe,it,expect} from 'vitest'
import {primaryLinks,dataGroups,isNavigationCurrent,calculatorCategory,calculatorCategories} from './siteNavigation'
import {educationCurrentPath} from './educationContent'
describe('consistent site navigation',()=>{
 it('has four primary destinations without duplicated education or account menus',()=>{expect(primaryLinks.map(x=>x.label)).toEqual(['계산기','통계·자료','생활 사이트','가이드']);expect(dataGroups.map(x=>x.label)).toEqual(['물가','교육','기준표'])})
 it('identifies nested pages and home sections',()=>{expect(isNavigationCurrent('/#data','/data/education/school/B10/1')).toBe(true);expect(isNavigationCurrent('/#tools','/calculators/loan-payment')).toBe(true);expect(isNavigationCurrent('/#history','/#history')).toBe(true);expect(isNavigationCurrent('/','/#history')).toBe(false);expect(isNavigationCurrent('/guides','/guides/loan-repayment')).toBe(true)})
 it('keeps school details inside school search',()=>expect(educationCurrentPath('/data/education/school/B10/1')).toBe('/data/education/schools'))
 it('classifies related calculators together with a fixed category order',()=>{expect(calculatorCategory('fundingSource','돈')).toBe('주거');expect(calculatorCategory('parttime','돈')).toBe(calculatorCategory('wage','근로'));expect(calculatorCategories).toHaveLength(5)})
})
