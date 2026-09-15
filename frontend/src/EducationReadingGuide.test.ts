import {it,expect} from 'vitest'
import {studentChange} from './EducationReadingGuide'
it('calculates change against the previous population',()=>{expect(studentChange(500,450)).toBe(-10);expect(studentChange(1000,1080)).toBe(8);expect(studentChange(0,100)).toBeNull()})
