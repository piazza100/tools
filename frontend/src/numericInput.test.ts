import {describe,expect,it,vi} from 'vitest'
import {focusNumericInput} from './numericInput'

describe('focusNumericInput',()=>{
 it.each(['0','0.0','-0','+000'])('clears a zero value: %s',value=>{
  const clear=vi.fn(),select=vi.fn()
  focusNumericInput(value,clear,{currentTarget:{select} as unknown as HTMLInputElement})
  expect(clear).toHaveBeenCalledOnce()
  expect(select).not.toHaveBeenCalled()
 })

 it.each(['','0.2','10','-5'])('selects a non-zero value: %s',value=>{
  const clear=vi.fn(),select=vi.fn()
  focusNumericInput(value,clear,{currentTarget:{select} as unknown as HTMLInputElement})
  expect(clear).not.toHaveBeenCalled()
  expect(select).toHaveBeenCalledOnce()
 })
})
