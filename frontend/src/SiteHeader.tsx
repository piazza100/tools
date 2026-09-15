import {useEffect,useRef,useState,type MouseEvent,type ReactNode} from 'react'
import {dataGroups,isNavigationCurrent,primaryLinks} from './siteNavigation'

export default function SiteHeader({account}:{account?:ReactNode}){
 const headerRef=useRef<HTMLElement>(null)
 const [locationKey,setLocationKey]=useState(()=>window.location.pathname+window.location.hash)
 useEffect(()=>{
  const close=()=>headerRef.current?.querySelectorAll('details[open]').forEach(item=>item.removeAttribute('open'))
  const outside=(event:PointerEvent)=>{if(!headerRef.current?.contains(event.target as Node))close()}
  const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){headerRef.current?.querySelector<HTMLElement>('details[open] > summary')?.focus();close()}}
  const update=()=>{setLocationKey(window.location.pathname+window.location.hash);close()}
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape)
  window.addEventListener('hashchange',update);window.addEventListener('popstate',update);window.addEventListener('wonderlife:location',update)
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);window.removeEventListener('hashchange',update);window.removeEventListener('popstate',update);window.removeEventListener('wonderlife:location',update)}
 },[])
 const current=(href:string)=>isNavigationCurrent(href,locationKey)?'page' as const:undefined
 const closeLinks=(event:MouseEvent<HTMLElement>)=>{if((event.target as HTMLElement).closest('a'))headerRef.current?.querySelectorAll('details[open]').forEach(item=>item.removeAttribute('open'))}
 const dataMenu=<>{dataGroups.map(group=><section key={group.label}><h2>{group.label}</h2>{group.links.map(link=><a key={link.href} href={link.href} aria-current={current(link.href)}>{link.label}</a>)}</section>)}</>
 return <header ref={headerRef} className="site-header">
  <a className="brand" href="/"><i>W</i><span>WonderLife<small>Everyday answers, made simple.</small></span></a>
  <nav className="primary-nav" aria-label="주 메뉴" onClick={closeLinks}>
   {primaryLinks.map(link=>link.href==='/#data'?<details key={link.href} className="data-menu"><summary className={current(link.href)?'is-current':''}>{link.label}<span aria-hidden="true">⌄</span></summary><div className="data-menu-panel"><a className="data-menu-home" href={link.href}>통계·자료 전체 보기 →</a><div className="data-menu-groups">{dataMenu}</div></div></details>:<a key={link.href} href={link.href} aria-current={current(link.href)}>{link.label}</a>)}
  </nav>
  <div className="header-actions"><a className="history-link" href="/#history" aria-current={current('/#history')}>계산 이력</a>{account}
   <details className="mobile-menu"><summary>메뉴</summary><div onClick={closeLinks}><a href="/" aria-current={current('/')}>홈</a>{primaryLinks.map(link=><section className="mobile-menu-section" key={link.href}><a href={link.href} aria-current={current(link.href)}>{link.label}</a>{link.href==='/#data'&&<div className="mobile-data-groups">{dataMenu}</div>}</section>)}<a href="/#history" aria-current={current('/#history')}>계산 이력</a></div></details>
  </div>
 </header>
}
