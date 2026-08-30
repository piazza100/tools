export type HousingPlanInput={
 startMonth:string;moveInMonth:string;initialCash:number;monthlySaving:number;additionalFunds:number;depositReturn:number;includeStartMonthSaving?:boolean
 price:number;optionCost:number;contractRate:number;includeContractAtStart?:boolean;interimRate:number;interimCount:number;loanInstallments:number
 firstInterimMonth:string;interimInterval:number;interimMonths?:string[];annualLoanRate:number;balanceRate:number;acquisitionTaxRate:number;incidentalCost:number;loanRounds?:number[]
 manualEvents?:{month:string;amount:number;memo:string}[]
}
export type HousingPlanRow={month:string;opening:number;saving:number;extra:number;property:number;housing:number;closing:number;memo:string}
export type HousingPlanResult={rows:HousingPlanRow[];contract:number;interimTotal:number;interimLoanPrincipal:number;interimInterest:number;balance:number;acquisitionTax:number;moveInOutflow:number;requiredMortgage:number;totalProjectCost:number}

const validMonth=(value:string)=>/^\d{4}-(0[1-9]|1[0-2])$/.test(value)
const monthIndex=(value:string)=>{const [y,m]=value.split('-').map(Number);return y*12+m-1}
const monthText=(index:number)=>`${Math.floor(index/12)}-${String(index%12+1).padStart(2,'0')}`

export function housingPlan(input:HousingPlanInput):HousingPlanResult{
 if(!validMonth(input.startMonth)||!validMonth(input.moveInMonth))throw new Error('계산 시작월과 입주 예정월을 YYYY-MM 형식으로 입력해 주세요.')
 const start=monthIndex(input.startMonth),end=monthIndex(input.moveInMonth)
 if(!input.startMonth||!input.moveInMonth||end<start)throw new Error('입주월은 시작월 이후여야 합니다.')
 const contract=input.price*input.contractRate/100
 const interimTotal=input.price*input.interimRate/100
 const interimCount=Math.max(0,Math.floor(input.interimCount))
 const loanCount=Math.min(interimCount,Math.max(0,Math.floor(input.loanInstallments)))
 const loanRoundSet=new Set((input.loanRounds?.length?input.loanRounds:Array.from({length:loanCount},(_,i)=>i+1)).filter(round=>round>=1&&round<=interimCount))
 const installment=interimCount?interimTotal/interimCount:0
 if(interimCount&&!validMonth(input.firstInterimMonth))throw new Error('중도금 첫 납부월을 YYYY-MM 형식으로 입력해 주세요.')
 if(input.interimMonths?.some(month=>!validMonth(month)))throw new Error('회차별 중도금 납부월을 YYYY-MM 형식으로 입력해 주세요.')
 const firstInterim=monthIndex(input.firstInterimMonth)
 const paymentMonths=Array.from({length:interimCount},(_,i)=>input.interimMonths?.[i]?monthIndex(input.interimMonths[i]):firstInterim+i*Math.max(1,input.interimInterval))
 if(paymentMonths.some(month=>month<start||month>end))throw new Error('중도금 납부월은 계산 시작월부터 입주 예정월 사이여야 합니다.')
 if(paymentMonths.some((month,index)=>index>0&&month<=paymentMonths[index-1]))throw new Error('중도금 납부월은 이전 회차보다 뒤여야 합니다.')
 const loanDraws=Array.from({length:interimCount},(_,i)=>({round:i+1,month:paymentMonths[i],amount:installment})).filter(x=>loanRoundSet.has(x.round))
 const interimLoanPrincipal=loanDraws.reduce((sum,x)=>sum+x.amount,0)
 const interimInterest=loanDraws.reduce((sum,x)=>sum+x.amount*(input.annualLoanRate/100)*Math.max(0,end-x.month)/12,0)
 const balance=input.price*input.balanceRate/100
 const acquisitionTax=(input.price+input.optionCost)*input.acquisitionTaxRate/100
 const moveInOutflow=balance+input.optionCost+acquisitionTax+input.incidentalCost+interimLoanPrincipal+interimInterest
 const events=new Map<number,{property:number;housing:number;extra:number;memos:string[]}>()
 const add=(month:number,property:number,housing:number,memo:string,extra=0)=>{const current=events.get(month)||{property:0,housing:0,extra:0,memos:[]};current.property+=property;current.housing+=housing;current.extra+=extra;if(memo)current.memos.push(memo);events.set(month,current)}
 if(input.includeContractAtStart!==false)add(start,-contract,0,`계약금 ${input.contractRate}% 납부`)
 for(let i=0;i<interimCount;i++){
  const month=paymentMonths[i]
  const financed=loanRoundSet.has(i+1)
  add(month,financed?0:-installment,0,financed?`중도금 ${i+1}회차 대출 실행`:`중도금 ${i+1}회차 현금 납부`)
 }
 add(end,-moveInOutflow,input.depositReturn,'입주 정산 · 대출 원금·이자 상환')
 for(const event of input.manualEvents||[])add(monthIndex(event.month),0,0,event.memo||'직접 입력',event.amount)
 const rows:HousingPlanRow[]=[];let cash=input.initialCash
 for(let month=start;month<=end;month++){
  const opening=cash,event=events.get(month),saving=month===start&&!input.includeStartMonthSaving?0:input.monthlySaving
  const extra=(month===end?input.additionalFunds:0)+(event?.extra||0),property=event?.property||0,housing=event?.housing||0
  cash=opening+saving+extra+property+housing
  rows.push({month:monthText(month),opening,saving,extra,property,housing,closing:cash,memo:event?.memos.join(' · ')||''})
 }
 const requiredMortgage=Math.max(0,-cash)
 return {rows,contract,interimTotal,interimLoanPrincipal,interimInterest,balance,acquisitionTax,moveInOutflow,requiredMortgage,totalProjectCost:input.price+input.optionCost+acquisitionTax+input.incidentalCost+interimInterest}
}
