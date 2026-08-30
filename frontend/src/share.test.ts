import {describe,expect,it} from 'vitest'
import {decodeShare,encodeShare} from './share'
describe('calculation share payload',()=>{
 it('round trips Korean and nested apartment inputs',()=>{const original={calculatorType:'housingPlan',title:'아파트 자금 계획기',input:{price:1706800000,manualEvents:[{month:'2029-07',memo:'전세보증금 회수'}]},result:{main:'부족자금 4억원'}};expect(decodeShare(encodeShare(original))).toMatchObject(original)})
 it('rejects malformed payloads',()=>expect(decodeShare('not-valid')).toBeNull())
})
