export function focusNumericInput(value:string|number|undefined,clear:()=>void,event:{currentTarget:HTMLInputElement}){
 const normalized=String(value??'').replaceAll(',','').trim()
 if(normalized!==''&&/^[+-]?0+(?:\.0*)?$/.test(normalized))clear()
 else event.currentTarget.select()
}
