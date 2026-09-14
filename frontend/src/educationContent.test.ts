import {describe,it,expect} from 'vitest'
import {educationLinks,schoolPath,metricLabels} from './educationContent'
describe('education content navigation',()=>{
 it('has independent unique public pages',()=>{expect(new Set(educationLinks.map(x=>x.path)).size).toBe(educationLinks.length);expect(educationLinks.some(x=>x.path.endsWith('/disclosures'))).toBe(true);expect(educationLinks.some(x=>x.path.endsWith('/trends'))).toBe(true)})
 it('encodes school identifiers in independent paths',()=>expect(schoolPath('B10','123/456')).toBe('/data/education/school/B10/123%2F456'))
 it('provides user facing labels for core indicators',()=>expect(metricLabels.student_count).toBe('학생 수'))
})
