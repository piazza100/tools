import {useEffect,useState} from 'react'
import HousingPlanCalculator from './HousingPlanCalculator'
import ApartmentPurchaseCalculator from './ApartmentPurchaseCalculator'

type Props={onCalculated:(title:string,input:unknown,result:unknown)=>void;restoreInput?:Record<string,unknown>|null}
export default function ApartmentPlanCalculator({onCalculated,restoreInput}:Props){
 const [type,setType]=useState<'subscription'|'purchase'>(()=>restoreInput?.planType==='purchase'?'purchase':'subscription')
 useEffect(()=>{if(restoreInput)setType(restoreInput.planType==='purchase'?'purchase':'subscription')},[restoreInput])
 return <><div className="apartment-mode" aria-label="아파트 거래 유형"><button className={type==='subscription'?'selected':''} onClick={()=>setType('subscription')}>분양·청약</button><button className={type==='purchase'?'selected':''} onClick={()=>setType('purchase')}>일반 매매</button></div>{type==='subscription'?<HousingPlanCalculator onCalculated={onCalculated} restoreInput={restoreInput}/>:<ApartmentPurchaseCalculator onCalculated={onCalculated} restoreInput={restoreInput}/>}</>
}
