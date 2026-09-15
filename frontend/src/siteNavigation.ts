export const primaryLinks=[{href:'/#tools',label:'계산기'},{href:'/#data',label:'통계·자료'},{href:'/links',label:'생활 사이트'},{href:'/guides',label:'가이드'}] as const
export const dataGroups=[
 {label:'물가',links:[{href:'/data/retail-price-history',label:'기간별 소매가격'},{href:'/data/regional-prices',label:'지역별 품목 가격'},{href:'/data/basket-price-index',label:'장바구니 물가지수'}]},
 {label:'교육',links:[{href:'/data/education',label:'교육 통계'}]},
 {label:'기준표',links:[{href:'/data/minimum-wage',label:'연도별 최저시급'},{href:'/data/salary-take-home',label:'연봉 실수령액표'},{href:'/data/korean-holidays',label:'연도별 공휴일'}]},
] as const
export function isNavigationCurrent(href:string,location:string){
 const [path,hash='']=location.split('#')
 if(href==='/')return path==='/'&&!hash
 if(href==='/#tools')return path.startsWith('/calculators/')||(path==='/'&&hash==='tools')
 if(href==='/#data')return path.startsWith('/data/')||(path==='/'&&hash==='data')
 if(href==='/#history')return path==='/'&&hash==='history'
 if(href==='/guides')return path==='/guides'||path.startsWith('/guides/')||path==='/methodology'
 return path===href||path.startsWith(href+'/')
}
export const calculatorCategories=['금융·급여','주거','날짜·시간','생활·건강','수학·학습'] as const
export function calculatorCategory(id:string,group:string){if(['housingPlan','apartmentPurchase','fundingSource','capacity','rentCompare','moving'].includes(id))return '주거';return ({돈:'금융·급여',근로:'금융·급여',주거:'주거','날짜·시간':'날짜·시간',생활:'생활·건강',건강:'생활·건강',수학:'수학·학습',성장:'수학·학습'} as Record<string,string>)[group]||group}
