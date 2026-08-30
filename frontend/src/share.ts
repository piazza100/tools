export type SharedCalculation={calculatorType:string;title:string;input:unknown;result:unknown;version:1}
const MAX_SHARE_LENGTH=12000
const toBase64Url=(text:string)=>{const bytes=new TextEncoder().encode(text);let binary='';for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,'')}
const fromBase64Url=(value:string)=>{const normalized=value.replaceAll('-','+').replaceAll('_','/'),padding='='.repeat((4-normalized.length%4)%4),binary=atob(normalized+padding),bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}
export const encodeShare=(payload:Omit<SharedCalculation,'version'>)=>{const encoded=toBase64Url(JSON.stringify({...payload,version:1}));if(encoded.length>MAX_SHARE_LENGTH)throw new Error('공유할 입력 내용이 너무 많습니다. 메모를 줄인 뒤 다시 시도해 주세요.');return encoded}
export const decodeShare=(value:string|null):SharedCalculation|null=>{if(!value||value.length>MAX_SHARE_LENGTH)return null;try{const payload=JSON.parse(fromBase64Url(value)) as SharedCalculation;if(payload.version!==1||typeof payload.calculatorType!=='string'||typeof payload.title!=='string'||!payload.input||!payload.result)return null;return payload}catch{return null}}
export const sharedFromLocation=()=>decodeShare(new URLSearchParams(window.location.hash.slice(1)).get('share'))
export const shareUrl=(payload:Omit<SharedCalculation,'version'>)=>{const url=new URL(window.location.origin+'/');url.hash=new URLSearchParams({share:encodeShare(payload)}).toString();return url.toString()}
export const shortShareTokenFromLocation=()=>{const token=new URLSearchParams(window.location.hash.slice(1)).get('s');return token&&/^[A-Za-z0-9_-]{16}$/.test(token)?token:null}
export const shortShareUrl=(token:string,origin=window.location.origin)=>{const url=new URL(origin+'/');url.hash=`s=${token}`;return url.toString()}
