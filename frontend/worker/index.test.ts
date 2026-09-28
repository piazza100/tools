import {describe,expect,it} from 'vitest'
import {renderGuide} from './index'

describe('guide pre-rendering',()=>{
  it('renders substantive guide content into the initial HTML response',()=>{
    const rendered=renderGuide('monthly-budget-plan')
    expect(rendered?.guide.title).toBe('월급으로 예산과 저축 목표 세우기')
    expect(rendered?.html).toContain('<h1>월급으로 예산과 저축 목표 세우기</h1>')
    expect(rendered?.html).toContain('월 실수령액 320만원')
    expect(rendered?.html).toContain('/calculators/monthly-budget')
  })

  it('does not manufacture content for an unknown guide URL',()=>{
    expect(renderGuide('not-a-guide')).toBeNull()
  })
})
