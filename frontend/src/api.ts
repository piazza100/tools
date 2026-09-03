export type Member={id:number;email:string}
export type History={id:number;calculatorType:string;title:string;inputJson:string;resultJson:string;createdAt:string}
export type SaveHistory={calculatorType:string;title:string;inputJson:string;resultJson:string}
export type PublicShare=SaveHistory&{shareToken:string;createdAt:string}
export type PriceItem={itemCode:string;name:string;unit:string;quantity:number;currentPrice:number;dayAgoPrice:number|null;weekAgoPrice:number|null;monthAgoPrice:number|null;yearAgoPrice:number|null}
export type PriceDashboard={asOfDate:string;source:string;demo:boolean;items:PriceItem[]}
let csrf=''
async function token(){if(csrf)return csrf;const r=await fetch('/api/csrf',{credentials:'include'});if(!r.ok)throw new Error('로그인이 필요합니다.');csrf=(await r.json()).token;return csrf}
async function req<T>(path:string,init?:RequestInit){const method=(init?.method||'GET').toUpperCase();const r=await fetch('/api'+path,{...init,credentials:'include',headers:{'Content-Type':'application/json',...(['POST','DELETE'].includes(method)?{'X-XSRF-TOKEN':await token()}:{}),...init?.headers}});if(!r.ok)throw new Error('요청을 처리하지 못했습니다.');return r.status===204?undefined as T:r.json() as Promise<T>}
export const api={me:()=>req<Member>('/me'),histories:()=>req<History[]>('/histories'),save:(body:SaveHistory)=>req<History>('/histories',{method:'POST',body:JSON.stringify(body)}),importHistories:(histories:SaveHistory[])=>req<History[]>('/histories/import',{method:'POST',body:JSON.stringify({histories})}),remove:(id:number)=>req<void>(`/histories/${id}`,{method:'DELETE'}),createShare:(body:SaveHistory)=>req<{token:string}>('/shares',{method:'POST',body:JSON.stringify(body)}),publicShare:(token:string)=>req<PublicShare>(`/public/shares/${encodeURIComponent(token)}`),priceDashboard:()=>req<PriceDashboard>('/public/prices/dashboard')}
