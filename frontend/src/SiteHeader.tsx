import {useEffect,useRef,useState,type MouseEvent,type ReactNode} from 'react'

type MenuItem='home'|'tools'|'data'|'links'|'guides'|'history'

export default function SiteHeader({account}:{account?:ReactNode}){
 const menuRef=useRef<HTMLDetailsElement>(null)
 const [locationKey,setLocationKey]=useState(()=>window.location.pathname+window.location.hash)
 useEffect(()=>{const close=(event:PointerEvent)=>{if(menuRef.current?.open&&!menuRef.current.contains(event.target as Node))menuRef.current.open=false};const update=()=>setLocationKey(window.location.pathname+window.location.hash);document.addEventListener('pointerdown',close);window.addEventListener('hashchange',update);window.addEventListener('popstate',update);window.addEventListener('wonderlife:location',update);return()=>{document.removeEventListener('pointerdown',close);window.removeEventListener('hashchange',update);window.removeEventListener('popstate',update);window.removeEventListener('wonderlife:location',update)}},[])
 const path=locationKey.split('#')[0],hash=locationKey.includes('#')?'#'+locationKey.split('#')[1]:''
 const current=(item:MenuItem)=>item==='home'?path==='/'&&!hash:item==='links'?path==='/links':item==='guides'?path.startsWith('/guides'):item==='data'?path.startsWith('/data/')||(path==='/'&&hash==='#data'):item==='history'?path==='/'&&hash==='#history':path.startsWith('/calculators/')||(path==='/'&&hash==='#tools')
 const navLink=(item:MenuItem)=>current(item)?'page':undefined
 const closeMenu=(event:MouseEvent<HTMLElement>)=>{const details=event.currentTarget.closest('details');if(details)details.open=false}
 return <header className="site-header"><a className="brand" href="/"><i>W</i><span>WonderLife<small>Everyday answers, made simple.</small></span></a><nav><a href="/#tools" aria-current={navLink('tools')}>계산기</a><a href="/#data" aria-current={navLink('data')}>생활 자료</a><a href="/links" aria-current={navLink('links')}>생활 사이트</a><a href="/guides" aria-current={navLink('guides')}>이용 가이드</a><a href="/#history" aria-current={navLink('history')}>계산 이력</a></nav><div className="header-actions">{account}<details ref={menuRef} className="mobile-menu"><summary>메뉴</summary><div onClick={closeMenu}><a href="/" aria-current={navLink('home')}>홈</a><a href="/#tools" aria-current={navLink('tools')}>계산기</a><a href="/#data" aria-current={navLink('data')}>생활 자료</a><a href="/links" aria-current={navLink('links')}>생활 사이트</a><a href="/guides" aria-current={navLink('guides')}>이용 가이드</a><a href="/#history" aria-current={navLink('history')}>전체 계산 이력</a></div></details></div></header>
}
