export type BasketPriceItem={
  itemCode:string
  name:string
  unit:string
  quantity:number
  currentPrice:number
  dayAgoPrice:number|null
  weekAgoPrice:number|null
  monthAgoPrice:number|null
  yearAgoPrice:number|null
}

export type BasketSignal='surge'|'buy'|'normal'|'new'

export function changeRate(current:number,previous:number|null){
  return previous&&previous>0?(current-previous)/previous*100:null
}

export function signalFor(item:BasketPriceItem):BasketSignal{
  const weekly=changeRate(item.currentPrice,item.weekAgoPrice)
  const monthly=changeRate(item.currentPrice,item.monthAgoPrice)
  if(weekly!==null&&weekly>=15)return 'surge'
  if(monthly!==null&&monthly<=-15)return 'buy'
  if(weekly===null&&monthly===null)return 'new'
  return 'normal'
}

export function basketSummary(items:BasketPriceItem[]){
  const total=items.reduce((sum,item)=>sum+item.currentPrice*item.quantity,0)
  const previousTotal=(key:'weekAgoPrice'|'monthAgoPrice'|'yearAgoPrice')=>{
    const comparable=items.filter(item=>item[key]!==null)
    return comparable.length===items.length&&items.length>0
      ?comparable.reduce((sum,item)=>sum+(item[key] as number)*item.quantity,0)
      :null
  }
  const monthTotal=previousTotal('monthAgoPrice')
  const contributions=items.map(item=>{
    const delta=item.monthAgoPrice===null?0:(item.currentPrice-item.monthAgoPrice)*item.quantity
    return {...item,delta}
  }).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta))
  const positiveDelta=contributions.reduce((sum,item)=>sum+Math.max(0,item.delta),0)
  return {
    total,
    weekRate:changeRate(total,previousTotal('weekAgoPrice')),
    monthRate:changeRate(total,monthTotal),
    yearRate:changeRate(total,previousTotal('yearAgoPrice')),
    contributions:contributions.map(item=>({...item,share:positiveDelta>0?Math.max(0,item.delta)/positiveDelta*100:0})),
  }
}
