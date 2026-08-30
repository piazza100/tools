import {useEffect,useMemo,useState} from 'react'

type Props={onCalculated:(title:string,input:unknown,result:unknown)=>void;restoreInput?:Record<string,unknown>|null}
type Payment={id:string;month:string;amount:string;actual:string;memo:string}
const now=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
const plus=(base:string,n:number)=>{const [y,m]=base.split('-').map(Number),d=new Date(y,m-1+n,1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`}
const valid=(v:string)=>/^\d{4}-(0[1-9]|1[0-2])$/.test(v)
const raw=(v:string)=>Number(v.replaceAll(',',''))||0
const won=(v:string)=>raw(v)*10000
const fromWon=(v:unknown)=>String(Math.round(Number(v||0)/10000))
const format=(v:string)=>{const x=v.replaceAll(',','').replace(/[^0-9.-]/g,'');if(!x)return '';return x.replace(/\B(?=(\d{3})+(?!\d))/g,',')}
const show=(v:number)=>`${Math.round(v/10000).toLocaleString()}만원`
const Month=({label,value,set}:{label:string;value:string;set:(v:string)=>void})=><label className="field"><span>{label}</span><input maxLength={7} value={value} placeholder="YYYY-MM" onChange={e=>set(e.target.value.replace(/[^0-9-]/g,''))}/></label>
const Money=({label,value,set}:{label:string;value:string;set:(v:string)=>void})=><label className="field"><span>{label}</span><span className="input-unit"><input inputMode="numeric" value={format(value)} onChange={e=>set(format(e.target.value))}/><em>만원</em></span></label>

export default function ApartmentPurchaseCalculator({onCalculated,restoreInput}:Props){
 const base=now()
 const [startMonth,setStartMonth]=useState(base),[closingMonth,setClosingMonth]=useState(plus(base,3))
 const [initialCash,setInitialCash]=useState(''),[monthlySaving,setMonthlySaving]=useState(''),[price,setPrice]=useState(''),[contract,setContract]=useState('')
 const [mortgage,setMortgage]=useState(''),[deposit,setDeposit]=useState(''),[saleProceeds,setSaleProceeds]=useState(''),[otherSource,setOtherSource]=useState('')
 const [brokerage,setBrokerage]=useState(''),[tax,setTax]=useState(''),[legal,setLegal]=useState(''),[moving,setMoving]=useState(''),[payTaxByCard,setPayTaxByCard]=useState(false)
 const [payments,setPayments]=useState<Payment[]>([]),[result,setResult]=useState<{required:number;closing:number;minimum:number;firstShortage?:string;planned:number;actual:number;rows:{month:string;closing:number;memo:string}[]}|null>(null),[error,setError]=useState('')
 useEffect(()=>{if(!restoreInput)return;const m=(k:string,s:(v:string)=>void)=>s(fromWon(restoreInput[k]));setStartMonth(String(restoreInput.startMonth||base));setClosingMonth(String(restoreInput.closingMonth||plus(base,3)));m('initialCash',setInitialCash);m('monthlySaving',setMonthlySaving);m('price',setPrice);m('contract',setContract);m('mortgage',setMortgage);m('deposit',setDeposit);m('saleProceeds',setSaleProceeds);m('otherSource',setOtherSource);m('brokerage',setBrokerage);m('tax',setTax);m('legal',setLegal);m('moving',setMoving);setPayTaxByCard(Boolean(restoreInput.payTaxByCard));const old=Array.isArray(restoreInput.payments)?restoreInput.payments as {month:string;amount:number;actual:number;memo:string}[]:[];setPayments(old.map(x=>({id:crypto.randomUUID(),month:x.month,amount:fromWon(x.amount),actual:fromWon(x.actual),memo:x.memo||''})));setResult(null)},[restoreInput])
 const add=()=>setPayments(v=>[...v,{id:crypto.randomUUID(),month:plus(startMonth,1),amount:'',actual:'',memo:''}])
 const update=(id:string,key:keyof Omit<Payment,'id'>,value:string)=>setPayments(v=>v.map(x=>x.id===id?{...x,[key]:value}:x))
 const calculate=()=>{try{
  if(!valid(startMonth)||!valid(closingMonth)||startMonth>closingMonth)throw new Error('계산 시작월과 잔금월을 올바르게 입력해 주세요.')
  if(won(price)<=0)throw new Error('0보다 큰 매매가격을 입력해 주세요.')
  const normalized=payments.filter(x=>x.amount||x.actual||x.memo).map((x,i)=>{if(!valid(x.month)||x.month<startMonth||x.month>closingMonth)throw new Error(`${i+1}번째 중도금 월은 계산 기간 안이어야 합니다.`);return {month:x.month,amount:won(x.amount),actual:won(x.actual||x.amount),memo:x.memo.slice(0,60)}}).sort((a,b)=>a.month.localeCompare(b.month))
  const input={planType:'purchase',startMonth,closingMonth,initialCash:won(initialCash),monthlySaving:won(monthlySaving),price:won(price),contract:won(contract),mortgage:won(mortgage),deposit:won(deposit),saleProceeds:won(saleProceeds),otherSource:won(otherSource),brokerage:won(brokerage),tax:won(tax),legal:won(legal),moving:won(moving),payTaxByCard,payments:normalized}
  const events=new Map<string,{amount:number;memo:string[]}>(),put=(month:string,amount:number,memo:string)=>{const e=events.get(month)||{amount:0,memo:[]};e.amount+=amount;if(memo)e.memo.push(memo);events.set(month,e)}
  put(startMonth,-input.contract,'계약금');normalized.forEach((x,i)=>put(x.month,-x.amount,x.memo||`중도금 ${i+1}회`))
  const balance=Math.max(0,input.price-input.contract-normalized.reduce((s,x)=>s+x.amount,0));put(closingMonth,input.mortgage+input.deposit+input.saleProceeds+input.otherSource-balance-input.brokerage-(payTaxByCard?0:input.tax)-input.legal-input.moving,payTaxByCard?'잔금 · 주담대 · 취득세 카드':'잔금 정산')
  const rows=[];let cash=input.initialCash,minimum=cash,firstShortage:string|undefined;for(let month=startMonth;month<=closingMonth;month=plus(month,1)){const e=events.get(month);cash+=input.monthlySaving+(e?.amount||0);if(cash<minimum)minimum=cash;if(cash<0&&!firstShortage)firstShortage=month;rows.push({month,closing:cash,memo:e?.memo.join(' · ')||''})}
  const required=Math.max(0,-cash),planned=input.contract+normalized.reduce((s,x)=>s+x.amount,0)+balance+input.brokerage+input.tax+input.legal+input.moving,actual=input.contract+normalized.reduce((s,x)=>s+x.actual,0)
  const next={required,closing:cash,minimum,firstShortage,planned,actual,rows};setResult(next);setError('');onCalculated('아파트 매매 자금 계획',input,{...next,main:`잔금 시 부족자금 ${show(required)}`})
 }catch(e){setResult(null);setError(e instanceof Error?e.message:'입력값을 확인해 주세요.')}}
 const reset=()=>{setStartMonth(base);setClosingMonth(plus(base,3));[setInitialCash,setMonthlySaving,setPrice,setContract,setMortgage,setDeposit,setSaleProceeds,setOtherSource,setBrokerage,setTax,setLegal,setMoving].forEach(s=>s(''));setPayTaxByCard(false);setPayments([]);setResult(null);setError('')}
 const balance=useMemo(()=>Math.max(0,won(price)-won(contract)-payments.reduce((s,x)=>s+won(x.amount),0)),[price,contract,payments])
 return <div className="housing-planner purchase-planner"><div className="planner-intro"><b>계약일부터 잔금일까지 필요한 현금을 확인하세요.</b><p>주택담보대출과 회수 자금은 잔금월 유입으로 계산합니다.</p></div>
  <fieldset><legend>일정·매매대금</legend><div className="form-grid compact"><Month label="계산 시작월" value={startMonth} set={setStartMonth}/><Month label="잔금 예정월" value={closingMonth} set={setClosingMonth}/><Money label="보유 현금" value={initialCash} set={setInitialCash}/><Money label="매월 저축액" value={monthlySaving} set={setMonthlySaving}/><Money label="매매가격" value={price} set={setPrice}/><Money label="계약금" value={contract} set={setContract}/></div><div className="purchase-balance">자동 계산 잔금 <b>{show(balance)}</b></div></fieldset>
  <fieldset><legend>중도금·계획 대비 실제</legend><button className="small-add" onClick={add}>+ 중도금 추가</button>{payments.map((x,i)=><div className="purchase-payment" key={x.id}><Month label={`${i+1}회차 월`} value={x.month} set={v=>update(x.id,'month',v)}/><Money label="계획 금액" value={x.amount} set={v=>update(x.id,'amount',v)}/><Money label="실제 납부액" value={x.actual} set={v=>update(x.id,'actual',v)}/><label className="field"><span>메모</span><input maxLength={60} value={x.memo} onChange={e=>update(x.id,'memo',e.target.value)}/></label><button onClick={()=>setPayments(v=>v.filter(p=>p.id!==x.id))}>삭제</button></div>)}</fieldset>
  <fieldset><legend>잔금월 자금 출처</legend><div className="form-grid compact"><Money label="주택담보대출 실행액" value={mortgage} set={setMortgage}/><Money label="전세보증금 회수" value={deposit} set={setDeposit}/><Money label="기존 주택 매각대금" value={saleProceeds} set={setSaleProceeds}/><Money label="기타 자금" value={otherSource} set={setOtherSource}/></div></fieldset>
  <fieldset><legend>거래 부대비용</legend><div className="form-grid compact"><Money label="중개보수" value={brokerage} set={setBrokerage}/><div className="saving-field"><Money label="예상 취득 관련 세금" value={tax} set={setTax}/><label className="saving-start-toggle"><input type="checkbox" checked={payTaxByCard} onChange={e=>setPayTaxByCard(e.target.checked)}/><span>카드 결제 (현금 차감 제외)</span></label></div><Money label="법무·등기·채권 비용" value={legal} set={setLegal}/><Money label="이사·수리비" value={moving} set={setMoving}/></div></fieldset>
  <button className="planner-reset" onClick={reset}>초기화</button><button className="primary planner-submit" onClick={calculate}>매매 자금 계산하기</button>{error&&<p className="planner-error">{error}</p>}
  {result&&<><section className="planner-summary"><div><small>잔금 시 부족자금</small><strong>{show(result.required)}</strong><p>{result.firstShortage?`${result.firstShortage}부터 현금이 부족합니다.`:'계산 기간 중 현금 부족이 없습니다.'}</p></div><dl aria-label="핵심 자금 지표"><div><dt>기간 중 최소 현금</dt><dd>{show(result.minimum)}</dd></div><div><dt>잔금 후 현금</dt><dd>{show(result.closing)}</dd></div><div><dt>총 계획 지출</dt><dd>{show(result.planned)}</dd></div><div><dt>현재까지 실제 납부</dt><dd>{show(result.actual)}</dd></div></dl></section><div className="table-wrap"><table><thead><tr><th>기간</th><th>월말 현금</th><th>이벤트</th></tr></thead><tbody>{result.rows.map(x=><tr key={x.month}><td>{x.month}</td><td className={x.closing<0?'shortage':''}>{show(x.closing)}</td><td>{x.memo||'—'}</td></tr>)}</tbody></table></div></>}
 </div>
}
