export type AngleMode='deg'|'rad'

const factorial=(value:number)=>{
 const n=Math.trunc(value)
 if(value!==n||n<0||n>170)throw new Error('팩토리얼은 0~170의 정수만 지원합니다.')
 let result=1
 for(let i=2;i<=n;i++)result*=i
 return result
}

export function scientific(expression:string,angle:AngleMode='deg'){
 const source=expression.replaceAll('π','pi').replace(/−/g,'-').replace(/[ \t\r\n]+/g,'').toLowerCase()
 let index=0
 const fail=():never=>{throw new Error('계산식을 확인해 주세요.')}
 const angleIn=(x:number)=>angle==='deg'?x*Math.PI/180:x
 const angleOut=(x:number)=>angle==='deg'?x*180/Math.PI:x
 const primary=():number=>{
  if(source[index]==='+'){index++;return primary()}
  if(source[index]==='-'){index++;return-primary()}
  if(source[index]==='('){index++;const value=sum();if(source[index++]!==')')fail();return value}
  const number=source.slice(index).match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/)
  if(number){index+=number[0].length;return Number(number[0])}
  const nameMatch=source.slice(index).match(/^[a-z]+/)
  if(!nameMatch)throw new Error('계산식을 확인해 주세요.')
  const name:string=nameMatch[0]
  index+=name.length
  if(name==='pi')return Math.PI
  if(name==='e')return Math.E
  if(source[index++]!=='(')fail()
  const value=sum();if(source[index++]!==')')fail()
  const functions:Record<string,(x:number)=>number>={sin:x=>Math.sin(angleIn(x)),cos:x=>Math.cos(angleIn(x)),tan:x=>Math.tan(angleIn(x)),asin:x=>angleOut(Math.asin(x)),acos:x=>angleOut(Math.acos(x)),atan:x=>angleOut(Math.atan(x)),sqrt:Math.sqrt,abs:Math.abs,ln:Math.log,log:Math.log10,exp:Math.exp}
  if(!functions[name])fail()
  return functions[name]!(value)
 }
 const postfix=()=>{let value=primary();while(source[index]==='!'){index++;value=factorial(value)}return value}
 const power=():number=>{const left=postfix();if(source[index]==='^'){index++;return Math.pow(left,power())}return left}
 const product=()=>{let value=power();while(source[index]==='*'||source[index]==='/'||source[index]==='%'){const op=source[index++],right=power();value=op==='*'?value*right:op==='/'?value/right:value%right}return value}
 const sum=()=>{let value=product();while(source[index]==='+'||source[index]==='-'){const op=source[index++],right=product();value=op==='+'?value+right:value-right}return value}
 if(!source)throw new Error('계산식을 입력해 주세요.')
 const result=sum()
 if(index!==source.length||!Number.isFinite(result))fail()
 return result
}

export function compoundInvestment(initial:number,monthly:number,annualRate:number,months:number){
 const r=annualRate/1200,n=Math.max(0,Math.trunc(months)),principal=Math.max(0,initial)+Math.max(0,monthly)*n
 const future=Math.max(0,initial)*Math.pow(1+r,n)+(r===0?Math.max(0,monthly)*n:Math.max(0,monthly)*(Math.pow(1+r,n)-1)/r)
 return{principal,future,profit:future-principal}
}
export function installment(price:number,down:number,annualRate:number,months:number){
 const financed=Math.max(0,price-down),n=Math.max(1,Math.trunc(months)),r=annualRate/1200
 const monthly=r===0?financed/n:financed*r*Math.pow(1+r,n)/(Math.pow(1+r,n)-1)
 return{financed,monthly,total:down+monthly*n,interest:monthly*n-financed}
}
export function splitBill(total:number,weights:number[],roundTo=1){
 const safe=weights.map(x=>Math.max(0,x)),sum=safe.reduce((a,b)=>a+b,0)
 if(sum<=0||roundTo<=0)throw new Error('인원별 비중을 확인해 주세요.')
 const rounded=safe.map(x=>Math.floor(total*x/sum/roundTo)*roundTo),remainder=Math.round((total-rounded.reduce((a,b)=>a+b,0))/roundTo)
 for(let i=0;i<remainder;i++)rounded[i%rounded.length]+=roundTo
 return rounded
}
export function bmi(weightKg:number,heightCm:number){const meters=heightCm/100,value=weightKg/(meters*meters);const category=value<18.5?'저체중':value<23?'정상':value<25?'과체중':value<30?'비만':'고도비만';return{value,category,minWeight:18.5*meters*meters,maxWeight:22.9*meters*meters}}
export function addCalendar(date:string,amount:number,unit:'days'|'months'|'years'){
 const [y,m,d]=date.split('-').map(Number);if(!y||!m||!d)throw new Error('날짜를 확인해 주세요.')
 const target=new Date(y,m-1,d,12),originalDay=d
 if(unit==='days')target.setDate(target.getDate()+amount)
 else{target.setDate(1);unit==='months'?target.setMonth(target.getMonth()+amount):target.setFullYear(target.getFullYear()+amount);target.setDate(Math.min(originalDay,new Date(target.getFullYear(),target.getMonth()+1,0).getDate()))}
 return `${target.getFullYear()}-${String(target.getMonth()+1).padStart(2,'0')}-${String(target.getDate()).padStart(2,'0')}`
}
export function workPay(hourly:number,regular:number,overtime:number,night:number,holiday:number){const base=hourly*regular,extra=hourly*(overtime*1.5+night*.5+holiday*1.5);return{base,extra,total:base+extra,effective:(regular+overtime+night+holiday)>0?(base+extra)/(regular+overtime+night+holiday):0}}
export function electricityCost(kwh:number,unitPrice:number,basic:number,vatRate=10){const energy=Math.max(0,kwh)*Math.max(0,unitPrice),subtotal=energy+Math.max(0,basic),vat=subtotal*Math.max(0,vatRate)/100;return{energy,subtotal,vat,total:subtotal+vat}}
export function currencyConversion(amount:number,rate:number,exchangeFee:number,cardFee:number){const base=amount*rate,exchange=base*exchangeFee/100,card=base*cardFee/100;return{base,exchange,card,total:base+exchange+card}}
export type GradeRow={credits:number,grade:number}
export function gradeAverage(rows:GradeRow[]){const credits=rows.reduce((s,x)=>s+Math.max(0,x.credits),0),points=rows.reduce((s,x)=>s+Math.max(0,x.credits)*Math.max(0,x.grade),0);return{credits,points,average:credits?points/credits:0}}
export function combination(n:number,r:number){n=Math.trunc(n);r=Math.trunc(r);if(n<0||r<0||r>n||n>170)throw new Error('n과 r 범위를 확인해 주세요.');r=Math.min(r,n-r);let x=1;for(let i=1;i<=r;i++)x=x*(n-r+i)/i;return x}
export function permutation(n:number,r:number){n=Math.trunc(n);r=Math.trunc(r);if(n<0||r<0||r>n||n>170)throw new Error('n과 r 범위를 확인해 주세요.');let x=1;for(let i=0;i<r;i++)x*=n-i;return x}
export function binomialProbability(n:number,k:number,p:number){if(p<0||p>1)throw new Error('확률은 0~1 사이여야 합니다.');return combination(n,k)*Math.pow(p,k)*Math.pow(1-p,n-k)}
