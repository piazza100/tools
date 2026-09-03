import {useEffect,useState,type ReactNode} from 'react'
import {addCalendar,binomialProbability,bmi,combination,compoundInvestment,currencyConversion,electricityCost,gradeAverage,installment,permutation,scientific,splitBill,workPay} from './practicalCalculations'
import {num,won} from './calculations'
import {focusNumericInput} from './numericInput'

type Props={id:string;title:string;restoreInput?:Record<string,unknown>|null;onCalculated:(title:string,input:unknown,result:unknown)=>void}
type Values=Record<string,string>
type CalcResult={main:string;lines:[string,string][];note:string;raw:unknown}
const defaults:Record<string,Values>={
 scientific:{expression:'sin(30) + sqrt(16)',angle:'deg'},investment:{initial:'10000000',monthly:'500000',rate:'5',months:'120'},installmentCalc:{price:'3000000',down:'0',rate:'6',months:'12'},
 dutchPay:{total:'100000',weights:'1,1,1',round:'100'},bmi:{weight:'65',height:'170'},dateAdd:{date:new Date().toISOString().slice(0,10),amount:'100',unit:'days'},
 workPay:{hourly:'10320',regular:'160',overtime:'10',night:'0',holiday:'0'},electricity:{kwh:'300',unitPrice:'150',basic:'1000',vat:'10'},currency:{amount:'100',rate:'1350',exchangeFee:'1',cardFee:'0.2'},
 grade:{credits:'3,3,2',grades:'4.5,4.0,3.5'},probability:{n:'10',r:'3',p:'0.5',mode:'combination'}
}
const n=(v:string)=>Number(v.replaceAll(',',''))
const grouped=(value:string)=>{const raw=value.replaceAll(',','').replace(/[^0-9.-]/g,'');if(!raw)return'';const [a,b]=raw.split('.');return Number(a||0).toLocaleString('ko-KR')+(raw.includes('.')?'.'+(b??''):'')}
function Field({label,value,onChange,type='number',children,full=false}:{label:string;value:string;onChange:(v:string)=>void;type?:string;children?:ReactNode;full?:boolean}){const numeric=type==='number';return <label className={`field${full?' full':''}`}><span>{label}</span>{children||<input type={numeric?'text':type} inputMode={numeric?'decimal':undefined} value={numeric?grouped(value):value} onFocus={numeric?e=>focusNumericInput(value,()=>onChange(''),e):undefined} onChange={e=>onChange(numeric?grouped(e.target.value):e.target.value)}/>}</label>}
function Select({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:[string,string][]}){return <Field label={label} value={value} onChange={onChange}><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></Field>}

export const practicalIds=['scientific','investment','installmentCalc','dutchPay','bmi','dateAdd','workPay','electricity','currency','grade','probability']
export default function PracticalCalculator({id,title,restoreInput,onCalculated}:Props){
 const [v,setV]=useState<Values>(()=>({...defaults[id]})),[result,setResult]=useState<CalcResult|null>(null),[error,setError]=useState('')
 useEffect(()=>{setV({...defaults[id]});setResult(null);setError('')},[id])
 useEffect(()=>{if(restoreInput?._calculatorType===id)setV({...defaults[id],...Object.fromEntries(Object.entries(restoreInput).filter(([k])=>!k.startsWith('_')).map(([k,x])=>[k,String(x??'')]))})},[restoreInput,id])
 const set=(key:string)=>(value:string)=>setV(old=>({...old,[key]:value}))
 const field=(key:string,label:string)=><Field label={label} value={v[key]} onChange={set(key)}/>
 const calculate=()=>{try{let r:CalcResult
  if(id==='scientific'){const x=scientific(v.expression,v.angle as 'deg'|'rad');r={main:num(x,12),lines:[['각도 단위',v.angle==='deg'?'도( DEG )':'라디안( RAD )'],['계산식',v.expression]],note:'^는 거듭제곱, %는 나머지 연산입니다. sin·cos·tan·역삼각함수·log·ln·sqrt·abs·팩토리얼을 지원합니다.',raw:{value:x}}}
  else if(id==='investment'){const x=compoundInvestment(n(v.initial),n(v.monthly),n(v.rate),n(v.months));r={main:`예상 자산 ${won(x.future)}`,lines:[['납입 원금',won(x.principal)],['예상 수익',won(x.profit)],['투자 기간',`${v.months}개월`]],note:'매월 말 납입하고 입력 수익률이 일정한 월복리 세전 가정입니다. 원금 손실과 수수료는 포함하지 않습니다.',raw:x}}
  else if(id==='installmentCalc'){const x=installment(n(v.price),n(v.down),n(v.rate),n(v.months));r={main:`월 ${won(x.monthly)}`,lines:[['할부 원금',won(x.financed)],['총 이자',won(x.interest)],['총 지출',won(x.total)]],note:'원리금균등 방식의 단순 추정입니다. 카드사·판매처의 회차별 수수료와 원 단위 처리는 다를 수 있습니다.',raw:x}}
  else if(id==='dutchPay'){const weights=v.weights.split(',').map(n),x=splitBill(n(v.total),weights,n(v.round));r={main:`${x.length}명 정산`,lines:x.map((amount,i)=>[`${i+1}번`,won(amount)]),note:'쉼표로 입력한 비중에 따라 나누며 반올림 차액은 앞사람부터 배분해 합계를 보존합니다.',raw:{shares:x}}}
  else if(id==='bmi'){const x=bmi(n(v.weight),n(v.height));if(!Number.isFinite(x.value)||n(v.height)<=0)throw new Error('키와 체중을 확인해 주세요.');r={main:`BMI ${num(x.value,1)} · ${x.category}`,lines:[['참고 정상 체중',`${num(x.minWeight,1)}~${num(x.maxWeight,1)}kg`],['입력 체중',`${num(n(v.weight),1)}kg`]],note:'대한비만학회 성인 기준을 단순 적용한 참고값이며 성장기·임신·근육량에 따라 해석이 달라집니다.',raw:x}}
  else if(id==='dateAdd'){const x=addCalendar(v.date,n(v.amount),v.unit as 'days'|'months'|'years');r={main:x,lines:[['기준일',v.date],['이동',`${v.amount}${v.unit==='days'?'일':v.unit==='months'?'개월':'년'}`]],note:'달력 날짜 기준입니다. 월·연 이동 시 해당 월에 같은 일이 없으면 그 달의 마지막 날을 사용합니다.',raw:{date:x}}}
  else if(id==='workPay'){const x=workPay(n(v.hourly),n(v.regular),n(v.overtime),n(v.night),n(v.holiday));r={main:`예상 급여 ${won(x.total)}`,lines:[['기본급',won(x.base)],['가산분 포함 금액',won(x.extra)],['실질 시간당 금액',won(x.effective)]],note:'연장 1.5배, 야간 가산 0.5배, 휴일 1.5배를 입력 시간에 각각 적용한 세전 참고값입니다. 중복 가산과 사업장 요건을 확인하세요.',raw:x}}
  else if(id==='electricity'){const x=electricityCost(n(v.kwh),n(v.unitPrice),n(v.basic),n(v.vat));r={main:`예상 ${won(x.total)}`,lines:[['전력량 요금',won(x.energy)],['기본요금 포함',won(x.subtotal)],['부가세',won(x.vat)]],note:'고지서에서 확인한 평균 kWh 단가와 기본요금을 직접 입력하는 추정입니다. 누진구간, 기후환경요금, 연료비조정액, 전력기금은 별도입니다.',raw:x}}
  else if(id==='currency'){const x=currencyConversion(n(v.amount),n(v.rate),n(v.exchangeFee),n(v.cardFee));r={main:`최종 ${won(x.total)}`,lines:[['환산 금액',won(x.base)],['환전 수수료',won(x.exchange)],['카드 수수료',won(x.card)]],note:'직접 입력한 1 외화당 원화 환율을 적용합니다. 승인·매입 시점 환율과 카드사 정책에 따라 실제 청구액은 달라집니다.',raw:x}}
  else if(id==='grade'){const credits=v.credits.split(',').map(n),grades=v.grades.split(',').map(n);if(credits.length!==grades.length)throw new Error('학점과 성적의 개수를 맞춰 주세요.');const x=gradeAverage(credits.map((credits,i)=>({credits,grade:grades[i]})));r={main:`평점 ${num(x.average,2)}`,lines:[['총 이수학점',num(x.credits)],['총 평점합',num(x.points,2)],['과목 수',`${credits.length}개`]],note:'쉼표 순서대로 과목 학점과 성적을 짝지어 가중평균합니다. 학교의 재수강·P/F·반올림 규정을 확인하세요.',raw:x}}
  else{const mode=v.mode,p=n(v.p),x=mode==='permutation'?permutation(n(v.n),n(v.r)):mode==='binomial'?binomialProbability(n(v.n),n(v.r),p):combination(n(v.n),n(v.r));r={main:mode==='binomial'?num(x*100,8)+'%':num(x,8),lines:[['유형',mode==='combination'?'조합 nCr':mode==='permutation'?'순열 nPr':'이항확률'],['입력',`n=${v.n}, r=${v.r}${mode==='binomial'?`, p=${v.p}`:''}`]],note:'n과 r은 0~170 정수, 이항확률 p는 0~1 범위를 지원합니다.',raw:{value:x}}}
  setError('');setResult(r);onCalculated(title,v,r)
 }catch(e){setResult(null);setError(e instanceof Error?e.message:'입력값을 확인해 주세요.')}}
 const fields=()=>{switch(id){
  case'scientific':return <><Field full label="계산식" type="text" value={v.expression} onChange={set('expression')}/><Select label="각도 단위" value={v.angle} onChange={set('angle')} options={[["deg","DEG (도)"],["rad","RAD (라디안)"]]}/></>
  case'investment':return <>{field('initial','초기 투자금')}{field('monthly','월 납입액')}{field('rate','연 예상 수익률 (%)')}{field('months','투자 기간 (개월)')}</>
  case'installmentCalc':return <>{field('price','구매 가격')}{field('down','선납금')}{field('rate','연 이자율 (%)')}{field('months','할부 기간 (개월)')}</>
  case'dutchPay':return <>{field('total','총 금액')}<Field label="인원별 비중 (쉼표 구분)" type="text" value={v.weights} onChange={set('weights')}/>{field('round','반올림 단위 (원)')}</>
  case'bmi':return <>{field('height','키 (cm)')}{field('weight','체중 (kg)')}</>
  case'dateAdd':return <><Field label="기준일" type="date" value={v.date} onChange={set('date')}/>{field('amount','더하거나 뺄 값')}<Select label="단위" value={v.unit} onChange={set('unit')} options={[["days","일"],["months","개월"],["years","년"]]}/></>
  case'workPay':return <>{field('hourly','시급')}{field('regular','기본 근로시간')}{field('overtime','연장 근로시간')}{field('night','야간 근로시간')}{field('holiday','휴일 근로시간')}</>
  case'electricity':return <>{field('kwh','월 사용량 (kWh)')}{field('unitPrice','평균 단가 (원/kWh)')}{field('basic','기본요금')}{field('vat','부가세율 (%)')}</>
  case'currency':return <>{field('amount','외화 금액')}{field('rate','1 외화당 원화 환율')}{field('exchangeFee','환전 수수료율 (%)')}{field('cardFee','해외 카드 수수료율 (%)')}</>
  case'grade':return <><Field label="과목별 학점 (쉼표 구분)" type="text" value={v.credits} onChange={set('credits')}/><Field label="과목별 성적 (쉼표 구분)" type="text" value={v.grades} onChange={set('grades')}/></>
  default:return <>{field('n','전체 수 n')}{field('r','선택·성공 수 r')}<Select label="계산 유형" value={v.mode} onChange={set('mode')} options={[["combination","조합 nCr"],["permutation","순열 nPr"],["binomial","이항확률"]]}/>{v.mode==='binomial'&&field('p','1회 성공확률 p (0~1)')}</>
 }}
 return <><div className="form-grid">{fields()}<button className="primary" onClick={calculate}>계산하기</button></div>{error&&<p className="planner-error" role="alert">{error}</p>}{result&&<section className="result" aria-live="polite"><small>계산 결과</small><strong>{result.main}</strong>{result.lines.map(([a,b])=><div className="result-row" key={a}><span>{a}</span><b>{b}</b></div>)}<p>{result.note}</p></section>}<div className="standard-note"><b>기준과 가정</b><span>입력값을 브라우저에서 계산 · 표시 단계에서 반올림 · 중요한 결정 전 실제 명세와 기준 확인</span></div></>
}
