import {useEffect,useState} from 'react'
import {scientific,type AngleMode} from './practicalCalculations'
import {num} from './calculations'
import './ScientificCalculator.css'

type Props={title:string;restoreInput?:Record<string,unknown>|null;onCalculated:(title:string,input:unknown,result:unknown)=>void}
const keys=[
 ['abs','(',')','%','AC'],
 ['sin','cos','tan','π','⌫'],
 ['sin⁻¹','cos⁻¹','tan⁻¹','√','÷'],
 ['ln','log','e','xʸ','×'],
 ['7','8','9','x²','−'],
 ['4','5','6','1/x','+'],
 ['1','2','3','!','='],
 ['0','0','.','±','='],
]
const token:Record<string,string>={'abs':'abs(','sin':'sin(','cos':'cos(','tan':'tan(','sin⁻¹':'asin(','cos⁻¹':'acos(','tan⁻¹':'atan(','√':'sqrt(','ln':'ln(','log':'log(','π':'pi','xʸ':'^','x²':'^2','1/x':'1/','×':'*','÷':'/','−':'-'}

export default function ScientificCalculator({title,restoreInput,onCalculated}:Props){
 const [expression,setExpression]=useState(''),[display,setDisplay]=useState('0'),[angle,setAngle]=useState<AngleMode>('deg'),[error,setError]=useState('')
 useEffect(()=>{if(restoreInput?._calculatorType==='scientific'){const restored=String(restoreInput.expression||'');setExpression(restored);setDisplay(restored||'0');setAngle(restoreInput.angle==='rad'?'rad':'deg')}},[restoreInput])
 const evaluate=()=>{try{const value=scientific(expression,angle),shown=num(value,12);setDisplay(shown);setExpression(String(value));setError('');onCalculated(title,{expression,angle},{main:shown,raw:{value}})}catch(e){setError(e instanceof Error?e.message:'계산식을 확인해 주세요.');setDisplay('오류')}}
 const press=(key:string)=>{
  if(key==='='){evaluate();return}
  if(key==='AC'){setExpression('');setDisplay('0');setError('');return}
  if(key==='⌫'){const next=expression.slice(0,-1);setExpression(next);setDisplay(next||'0');return}
  if(key==='±'){const next=expression.startsWith('-')?expression.slice(1):`-${expression}`;setExpression(next);setDisplay(next||'0');return}
  const next=expression+(token[key]??key);setExpression(next);setDisplay(next)
 }
 return <div className="scientific-calculator">
  <div className="scientific-display"><div><button type="button" className={angle==='deg'?'selected':''} onClick={()=>setAngle('deg')}>DEG</button><button type="button" className={angle==='rad'?'selected':''} onClick={()=>setAngle('rad')}>RAD</button></div><input aria-label="계산식과 결과" value={display} onChange={event=>{setExpression(event.target.value);setDisplay(event.target.value)}} onKeyDown={event=>{if(event.key==='Enter')evaluate()}}/>{error&&<small role="alert">{error}</small>}</div>
  <div className="scientific-keys">{keys.flatMap((row,rowIndex)=>row.map((key,columnIndex)=><button type="button" className={`${/[0-9.]/.test(key)?'number ':''}${['+','−','×','÷','='].includes(key)?'operator ':''}${key==='0'&&rowIndex===7&&columnIndex===0?'zero ':''}`} key={`${rowIndex}-${columnIndex}`} onClick={()=>press(key)}>{key}</button>))}</div>
  <p className="scientific-help">괄호가 필요한 함수는 버튼을 누른 뒤 값을 입력하고 <b>)</b>를 눌러주세요. 키보드로 수식을 직접 입력할 수도 있습니다.</p>
 </div>
}
