import {FormEvent,useEffect,useMemo,useState} from 'react'
import {api,type PublicPriceItemOption,type PublicPriceStatistics} from './api'
import SiteHeader from './SiteHeader'

type Kind='period'|'regional'
const iso=(date:Date)=>date.toISOString().slice(0,10)
const won=(value:number)=>`${Math.round(value).toLocaleString('ko-KR')}원`

export default function PublicPriceStatisticsPage({kind}:{kind:Kind}){
 const regional=kind==='regional',today=new Date(),monthAgo=new Date(today);monthAgo.setDate(today.getDate()-30)
 const [from,setFrom]=useState(iso(monthAgo)),[to,setTo]=useState(iso(today)),[itemCode,setItemCode]=useState('')
 const [items,setItems]=useState<PublicPriceItemOption[]>([]),[result,setResult]=useState<PublicPriceStatistics|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState('')
 const title=regional?'지역별 품목 가격 통계':'기간별 소매가격 통계',description=regional?'선택한 품목의 지역별 가격 수준을 비교합니다.':'선택한 품목의 날짜별 가격 흐름을 확인합니다.'
 useEffect(()=>{document.title=`${title} | WonderLife`;document.querySelector('meta[name="description"]')?.setAttribute('content',description)},[title,description])
 useEffect(()=>{let active=true;(regional?api.regionalPriceItems():api.periodRetailPriceItems()).then(values=>{if(!active)return;const sorted=[...values].sort((a,b)=>(a.itemName||a.itemCode).localeCompare(b.itemName||b.itemCode,'ko'));setItems(sorted);setItemCode(current=>current||sorted[0]?.itemCode||'')}).catch(()=>active&&setError('품목 목록을 불러오지 못했습니다.'));return()=>{active=false}},[regional])
 const search=async(event?:FormEvent)=>{event?.preventDefault();if(!itemCode){setError('통계를 볼 품목을 선택해 주세요.');return}setLoading(true);setError('');try{setResult(regional?await api.regionalStatistics(from,to,itemCode):await api.periodRetailStatistics(from,to,itemCode))}catch(e){setResult(null);setError(e instanceof Error?e.message:'통계를 불러오지 못했습니다.')}finally{setLoading(false)}}
 const summary=useMemo(()=>{if(!result?.points.length)return null;const values=result.points.map(point=>point.averagePrice),first=values[0],last=values.at(-1)??first,min=Math.min(...values),max=Math.max(...values);return{min,average:values.reduce((a,b)=>a+b,0)/values.length,max,change:regional?(min?((max-min)/min)*100:0):(first?((last-first)/first)*100:0)}},[result,regional])
 return <div className="app"><SiteHeader/><main className="lookup-page"><a className="price-back" href="/#data">← 생활 자료</a>
  <section className="price-hero"><div><p className="eyebrow">PRICE STATISTICS</p><h1>{title}</h1><p>{description}</p></div><div className="price-total lookup-summary"><small>WonderLife 저장 데이터</small><strong>{regional?'지역 비교':'최대 90일'}</strong><span>외부 API 추가 호출 없음</span></div></section>
  <nav className="price-api-tabs" aria-label="가격 API 메뉴"><a className={!regional?'active':''} href="/data/retail-price-history">기간별 소매가격</a><a className={regional?'active':''} href="/data/regional-prices">지역별 품목 가격</a><a href="/data/basket-price-index">장바구니 물가지수</a></nav>
  <nav className="lookup-view-tabs" aria-label={`${title} 보기`}><a href={regional?'/data/regional-prices':'/data/retail-price-history'}>가격표</a><a className="active" href={regional?'/data/regional-prices/statistics':'/data/retail-price-history/statistics'}>통계 그래프</a></nav>
  <form className="lookup-form statistics-form" onSubmit={search}><label><span>시작일</span><input type="date" value={from} max={to} onChange={e=>setFrom(e.target.value)} required/></label><label><span>종료일</span><input type="date" value={to} min={from} onChange={e=>setTo(e.target.value)} required/></label><label><span>품목</span><select value={itemCode} onChange={e=>setItemCode(e.target.value)} required><option value="">품목 선택</option>{items.map(item=><option value={item.itemCode} key={item.itemCode}>{item.itemName||item.itemCode}</option>)}</select></label><button disabled={loading||!items.length}>{loading?'분석 중…':'통계 보기'}</button></form>
  <p className="lookup-help">매일 DB에 저장된 조사 가격을 집계합니다. 품종·등급·단위가 다른 행이 포함될 수 있으므로 개별 가격 판단보다 전체 흐름 비교에 적합합니다.</p>
  {error&&<div className="lookup-message error"><b>통계를 불러오지 못했습니다.</b><span>{error}</span></div>}
  {!result&&!error&&<div className="lookup-message"><b>기간과 품목을 선택해 주세요.</b><span>{regional?'지역별 평균 가격 순위를':'날짜별 최저·평균·최고 가격 추이를'} 확인할 수 있습니다.</span></div>}
  {result&&summary&&<><section className="lookup-kpis"><article><small>분석 품목</small><b>{result.itemName}</b><span>{result.totalSamples.toLocaleString()}개 조사 행</span></article><article><small>평균 가격</small><b>{won(summary.average)}</b><span>표시 구간 평균</span></article><article><small>최저 · 최고</small><b>{won(summary.min)}</b><span>최고 {won(summary.max)}</span></article><article><small>{regional?'지역 격차':'기간 변화'}</small><b className={summary.change>0?'rise':summary.change<0?'fall':''}>{summary.change>0?'+':''}{summary.change.toFixed(1)}%</b><span>{regional?'최저 지역 대비 최고 지역':'첫 조사일 대비 마지막 조사일'}</span></article></section>
   <section className="price-statistics-panel"><header><div><small>PRICE ANALYSIS</small><h2>{regional?'지역별 평균 가격':'날짜별 가격 추이'}</h2></div><span>{result.from} ~ {result.to}</span></header>{regional?<RegionalBars result={result}/>:<PeriodChart result={result}/>}</section></>}
  {result&&!summary&&<div className="lookup-message"><b>표시할 통계 데이터가 없습니다.</b><span>조회 기간을 최근 조사일이 포함되도록 넓혀주세요.</span></div>}
  <section className="price-source"><b>집계 기준</b><span>{regional?'선택 기간의 지역별 조사 행을 평균하여 비교합니다.':'조사일별 가격의 최저·평균·최고를 표시합니다.'} 통계는 WonderLife DB에 저장된 자료만 사용합니다.</span></section>
 </main></div>
}

function PeriodChart({result}:{result:PublicPriceStatistics}){
 const points=result.points,width=900,height=300,padX=55,padY=30,values=points.flatMap(point=>[point.minPrice,point.averagePrice,point.maxPrice]),min=Math.min(...values),max=Math.max(...values),range=max-min||1
 const x=(index:number)=>padX+(points.length===1?(width-padX*2)/2:index*(width-padX*2)/(points.length-1)),y=(value:number)=>padY+(max-value)*(height-padY*2)/range
 const line=(key:'minPrice'|'averagePrice'|'maxPrice')=>points.map((point,index)=>`${x(index)},${y(point[key])}`).join(' '),labelEvery=Math.max(1,Math.ceil(points.length/6))
 return <div className="statistics-chart"><div className="chart-legend"><span className="min">최저</span><span className="avg">평균</span><span className="max">최고</span></div><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${result.itemName} 날짜별 가격 추이`}><line x1={padX} y1={padY} x2={padX} y2={height-padY}/><line x1={padX} y1={height-padY} x2={width-padX} y2={height-padY}/><polyline className="min-line" points={line('minPrice')}/><polyline className="avg-line" points={line('averagePrice')}/><polyline className="max-line" points={line('maxPrice')}/>{points.map((point,index)=><g key={point.label}><circle cx={x(index)} cy={y(point.averagePrice)} r="4"><title>{point.label} 평균 {won(point.averagePrice)}</title></circle>{(index%labelEvery===0||index===points.length-1)&&<text x={x(index)} y={height-8} textAnchor="middle">{point.label.slice(5)}</text>}</g>)}</svg><div className="statistics-range"><span>{won(min)}</span><span>{won(max)}</span></div></div>
}

function RegionalBars({result}:{result:PublicPriceStatistics}){
 const points=result.points,max=Math.max(...points.map(point=>point.averagePrice),1),min=Math.min(...points.map(point=>point.averagePrice))
 return <div className="regional-stat-bars">{points.map((point,index)=><article key={point.code}><span><b>{index+1}</b>{point.label}</span><div><i style={{width:`${Math.max(3,point.averagePrice/max*100)}%`}}/></div><strong>{won(point.averagePrice)}</strong><small>{point.sampleCount.toLocaleString()}건</small></article>)}<p>최고 지역과 최저 지역의 평균가격 차이는 {won(max-min)}입니다.</p></div>
}
