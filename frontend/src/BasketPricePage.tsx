import {useEffect,useMemo,useState} from 'react'
import {api,type PriceDashboard} from './api'
import {basketSummary,changeRate,signalFor,type BasketPriceItem} from './basketPriceStats'

const demo:PriceDashboard={asOfDate:'2026-09-02',source:'한국농수산식품유통공사(aT) 예시 데이터',demo:true,items:[
 {itemCode:'rice',name:'쌀',unit:'10kg',quantity:1,currentPrice:28100,dayAgoPrice:28000,weekAgoPrice:27700,monthAgoPrice:27400,yearAgoPrice:26500},
 {itemCode:'egg',name:'계란',unit:'30구',quantity:1,currentPrice:6890,dayAgoPrice:6810,weekAgoPrice:6500,monthAgoPrice:6420,yearAgoPrice:6200},
 {itemCode:'pork',name:'삼겹살',unit:'1kg',quantity:1,currentPrice:26800,dayAgoPrice:27000,weekAgoPrice:27200,monthAgoPrice:26100,yearAgoPrice:25300},
 {itemCode:'milk',name:'우유',unit:'1L',quantity:2,currentPrice:2950,dayAgoPrice:2950,weekAgoPrice:2950,monthAgoPrice:2890,yearAgoPrice:2800},
 {itemCode:'green-onion',name:'대파',unit:'1kg',quantity:1,currentPrice:5900,dayAgoPrice:5500,weekAgoPrice:4900,monthAgoPrice:4100,yearAgoPrice:4600},
 {itemCode:'apple',name:'사과',unit:'10개',quantity:1,currentPrice:30800,dayAgoPrice:30000,weekAgoPrice:27500,monthAgoPrice:24700,yearAgoPrice:23500},
]}

const won=new Intl.NumberFormat('ko-KR',{style:'currency',currency:'KRW',maximumFractionDigits:0})
const rate=(value:number|null)=>value===null?'비교 데이터 없음':`${value>=0?'+':''}${value.toFixed(1)}%`
const signalLabel={surge:'급등',buy:'평균보다 낮음',normal:'보통',new:'데이터 부족'}
const previewTrend=[91,93,92,95,97,96,101,104,103,107,109,110.5]

export default function BasketPricePage(){
 const [data,setData]=useState<PriceDashboard|null>(null)
 const [loading,setLoading]=useState(true)
 const [preview,setPreview]=useState(false)
 useEffect(()=>{document.title='내 장바구니 물가지수 | WonderLife';document.querySelector('meta[name="description"]')?.setAttribute('content','매일 축적한 농축산물 가격으로 장바구니 비용과 품목별 상승 기여도를 확인하세요.');api.priceDashboard().then(value=>setData(value.items.length?value:demo)).catch(()=>setData(demo)).finally(()=>setLoading(false))},[])
 const displayed=preview?demo:data
 const items=useMemo(()=>displayed?.items||[],[displayed])
 const summary=useMemo(()=>basketSummary(items),[items])
 if(loading)return <div className="price-app"><PriceHeader/><main className="price-page"><p role="status">가격 데이터를 불러오는 중입니다…</p></main></div>
 return <div className="price-app"><PriceHeader/><main className="price-page">
  <a className="price-back" href="/">← WonderLife 홈</a>
  <section className="price-hero"><div><p className="eyebrow">MY BASKET PRICE INDEX</p><h1>내 장바구니 물가는<br/><em>얼마나 달라졌을까요?</em></h1><p>매일 수집한 가격으로 자주 사는 품목의 변화를 한눈에 확인합니다.</p></div><div className="price-total"><small>{preview?'90일 누적 후 예상 화면':'오늘의 장바구니'}</small><strong>{won.format(summary.total)}</strong><span className={(summary.monthRate||0)>0?'up':'down'}>한 달 전보다 {rate(summary.monthRate)}</span></div></section>
  <div className={`price-preview-notice${preview?' active':''}`} role="status"><div><b>{preview?'누적 데이터 샘플을 보는 중입니다':'아직 일별 데이터가 충분히 쌓이지 않았습니다'}</b><span>{preview?'아래 수치와 차트는 화면 구성을 보여주기 위한 예시이며 실제 가격이 아닙니다.':'90일간 데이터가 쌓였을 때 표시될 통계와 차트를 미리 확인할 수 있습니다.'}</span></div><button type="button" onClick={()=>setPreview(value=>!value)}>{preview?'실제 데이터로 돌아가기':'90일 누적 화면 미리보기'}</button></div>
  {displayed?.demo&&!preview&&<div className="price-demo" role="status"><b>화면 예시</b> API 데이터가 없어 예시 가격을 표시합니다. 실제 통계로 오해하지 마세요.</div>}
  <section className="price-kpis" aria-label="장바구니 주요 통계">
   <article><small>7일 변화</small><b>{rate(summary.weekRate)}</b><span>같은 구성 기준</span></article>
   <article><small>30일 변화</small><b>{rate(summary.monthRate)}</b><span>개인 장바구니 지수</span></article>
   <article><small>1년 변화</small><b>{rate(summary.yearRate)}</b><span>계절 차이 포함</span></article>
   <article><small>가격 기준일</small><b>{preview?'샘플 90일':displayed?.asOfDate||'-'}</b><span>{preview?'실제 가격 아님':'하루 한 번 갱신'}</span></article>
  </section>
  {preview&&<section className="price-panel price-trend-preview"><header><div><small>90-DAY PREVIEW</small><h2>장바구니 물가지수 추이</h2></div><span>시작일 = 100</span></header><div className="preview-chart" aria-label="90일 누적 장바구니 물가지수 샘플 차트"><svg viewBox="0 0 720 210" role="img"><title>90일 동안 물가지수가 91에서 110.5로 상승한 예시</title><line x1="38" y1="168" x2="700" y2="168"/><line x1="38" y1="32" x2="38" y2="168"/><line className="baseline" x1="38" y1="100" x2="700" y2="100"/><polyline points={previewTrend.map((value,index)=>`${38+index*60},${168-(value-88)*6}`).join(' ')}/>{previewTrend.map((value,index)=><circle key={index} cx={38+index*60} cy={168-(value-88)*6} r="4"/>)}</svg><div><span>90일 전</span><b>기준 100</b><span>현재 110.5</span></div></div><p>실제 화면에서는 매일 저장된 동일 품목·단위 가격만 연결하고, 누락일은 임의로 채우지 않습니다.</p></section>}
  <section className="price-grid">
   <article className="price-panel"><header><div><small>ITEMS</small><h2>주요 품목 가격</h2></div><span>{preview?'누적 화면 예시':'최근 조사 평균'}</span></header><div className="price-items">{items.map(item=>{const change=changeRate(item.currentPrice,item.monthAgoPrice);const signal=signalFor(item);return <div key={item.itemCode}><div><b>{item.name}</b><small>{item.unit} 기준</small></div><strong>{won.format(item.currentPrice)}</strong><span className={change!==null&&change>0?'up':'down'}>{rate(change)}</span><em className={`signal ${signal}`}>{signalLabel[signal]}</em></div>})}</div></article>
   <article className="price-panel contribution"><header><div><small>CONTRIBUTION</small><h2>무엇이 상승을 이끌었나요?</h2></div></header>{summary.contributions.slice(0,5).map(item=><div className="contribution-row" key={item.itemCode}><span>{item.name}</span><div><i style={{width:`${Math.max(2,item.share)}%`}}/></div><b>{item.delta>0?`+${won.format(item.delta)}`:won.format(item.delta)}</b><small>{item.share.toFixed(0)}%</small></div>)}<p>양의 가격 상승분 가운데 각 품목이 차지한 비중입니다. 수량이 반영됩니다.</p></article>
  </section>
  <section className="price-panel price-signals"><header><div><small>DAILY SIGNALS</small><h2>오늘 확인할 가격 신호</h2></div></header><div>{items.filter(item=>signalFor(item)!=='normal').map(item=><article key={item.itemCode}><em className={`signal ${signalFor(item)}`}>{signalLabel[signalFor(item)]}</em><b>{item.name}</b><p>{signalFor(item)==='surge'?`7일 전보다 ${rate(changeRate(item.currentPrice,item.weekAgoPrice))} 올랐습니다.`:signalFor(item)==='buy'?`한 달 전보다 ${rate(Math.abs(changeRate(item.currentPrice,item.monthAgoPrice)||0))} 낮습니다.`:'비교할 이력이 아직 충분하지 않습니다.'}</p></article>)}</div></section>
  <footer className="price-source"><b>데이터 출처</b><span>{preview?'누적 화면 확인용 샘플 데이터':displayed?.source} · 조사 평균가격이며 실제 매장 판매가격과 다를 수 있습니다.</span><a href="https://www.data.go.kr/data/15156063/openapi.do?recommendDataYn=Y" target="_blank" rel="noreferrer">공식 API 확인 →</a></footer>
 </main></div>
}

function PriceHeader(){return <header className="site-header"><a className="brand" href="/"><i>W</i><span>WonderLife<small>Everyday answers, made simple.</small></span></a><nav><a href="/#tools">계산기</a><a href="/#data" aria-current="page">생활 자료</a><a href="/links">생활 사이트</a><a href="/guides">이용 가이드</a></nav></header>}
