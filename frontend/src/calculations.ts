import {withholdingRows} from './data/withholding.generated'
import {withholdingRows2020} from './data/withholding-2020.generated'

export const won=(n:number)=>new Intl.NumberFormat('ko-KR',{maximumFractionDigits:0}).format(Math.round(n))+'원'
export const num=(n:number,d=2)=>new Intl.NumberFormat('ko-KR',{maximumFractionDigits:d}).format(n)
export const dateAtNoon=(s:string)=>{const [y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d,12)}
export const diffDays=(a:string,b:string)=>Math.round((dateAtNoon(b).getTime()-dateAtNoon(a).getTime())/86400000)
export function fullAge(birth:string,base:string){const b=dateAtNoon(birth),t=dateAtNoon(base);let age=t.getFullYear()-b.getFullYear();if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))age--;return age}
export function addDays(date:string,days:number){const d=dateAtNoon(date);d.setDate(d.getDate()+days);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export type LoanMethod='annuity'|'principal'|'bullet'
export function loan(principal:number,annualRate:number,months:number,method:LoanMethod){
 const r=annualRate/1200;let balance=principal,totalInterest=0;const rows=[] as {month:number;payment:number;principal:number;interest:number;balance:number}[]
 const annuity=r===0?principal/months:principal*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1)
 for(let i=1;i<=months;i++){const interest=balance*r;let principalPay=method==='annuity'?annuity-interest:method==='principal'?principal/months:i===months?principal:0;principalPay=Math.min(balance,principalPay);const payment=principalPay+interest;balance=Math.max(0,balance-principalPay);totalInterest+=interest;rows.push({month:i,payment,principal:principalPay,interest,balance})}
 return{first:rows[0]?.payment||0,last:rows.at(-1)?.payment||0,totalInterest,totalPayment:principal+totalInterest,rows}
}
export const minimumWages=[
 {year:2027,hourly:10700},{year:2026,hourly:10320},{year:2025,hourly:10030},{year:2024,hourly:9860},{year:2023,hourly:9620},{year:2022,hourly:9160},{year:2021,hourly:8720},{year:2020,hourly:8590},{year:2019,hourly:8350},{year:2018,hourly:7530},{year:2017,hourly:6470},{year:2016,hourly:6030},{year:2015,hourly:5580},{year:2014,hourly:5210},{year:2013,hourly:4860},{year:2012,hourly:4580},{year:2011,hourly:4320}
].map(x=>({...x,daily:x.hourly*8,monthly:x.hourly*209}))
const rates:Record<number,{pension:number;health:number;care:number;employment:number}>={
 2020:{pension:.045,health:.03335,care:.1025,employment:.008},2021:{pension:.045,health:.0343,care:.1152,employment:.008},2022:{pension:.045,health:.03495,care:.1227,employment:.009},2023:{pension:.045,health:.03545,care:.1281,employment:.009},2024:{pension:.045,health:.03545,care:.1295,employment:.009},2025:{pension:.045,health:.03545,care:.1295,employment:.009},2026:{pension:.0475,health:.03595,care:.1314,employment:.009},2027:{pension:.05,health:.03595,care:.1314,employment:.009}
}
export const salaryRateInfo=(year:number,period:'first'|'second'='second')=>({...rates[year]||rates[2026],employment:year===2022&&period==='first'?.008:(rates[year]||rates[2026]).employment})
export const pensionCaps:Record<number,{first:number;second:number}>={
 2020:{first:4860000,second:5030000},2021:{first:5030000,second:5240000},2022:{first:5240000,second:5530000},2023:{first:5530000,second:5900000},2024:{first:5900000,second:6170000},2025:{first:6170000,second:6370000},2026:{first:6370000,second:6590000},2027:{first:6590000,second:6590000}
}
export function monthlyWithholding(monthlyTaxable:number,dependents:number,year=2026){
 const amountInThousands=monthlyTaxable/1000
 const table=year<=2022?withholdingRows2020:withholdingRows
 const row=table.find(x=>amountInThousands>=x[0]&&amountInThousands<x[1])
 if(!row)return null
 const column=Math.min(4,Math.max(1,Math.trunc(dependents)))+1
 return Number(row[column])
}
export function salaryEstimate(annual:number,year:number,nonTaxMonthly:number,dependents:number,period:'first'|'second'='second'){
 const gross=annual/12,taxable=Math.max(0,gross-nonTaxMonthly),r=salaryRateInfo(year,period)
 const cap=(pensionCaps[year]||pensionCaps[2026])[period]
 const pension=Math.min(taxable,cap)*r.pension,health=taxable*r.health,care=health*r.care,employment=taxable*r.employment
 const annualTaxable=Math.max(0,(taxable*12)-Math.min(annual*.25,20000000)-1500000-Math.max(0,dependents-1)*1500000)
 const annualIncome=annualTaxable<=14000000?annualTaxable*.06:annualTaxable<=50000000?840000+(annualTaxable-14000000)*.15:annualTaxable<=88000000?6240000+(annualTaxable-50000000)*.24:15360000+(annualTaxable-88000000)*.35
 const income=monthlyWithholding(taxable,dependents,year)??Math.max(0,annualIncome/12),local=Math.floor(income*.1/10)*10,total=pension+health+care+employment+income+local
 return{gross,pension,health,care,employment,income,local,total,net:gross-total}
}
export function splitExpense(total:number,people:number,weights:number[]){const sum=weights.reduce((a,b)=>a+b,0)||people;return weights.slice(0,people).map(w=>total*w/sum)}
