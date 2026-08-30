import {useEffect,useMemo,useRef,useState,type MouseEvent} from 'react'
import {siteLinkCategories,siteLinks} from './siteLinks'
import TopButton from './TopButton'

export default function LinksPage(){
 const [query,setQuery]=useState(''),[category,setCategory]=useState('전체')
 const menuRef=useRef<HTMLDetailsElement>(null)
 useEffect(()=>{document.title='생활 사이트 모음 | WonderLife'},[])
 useEffect(()=>{const close=(event:PointerEvent)=>{if(menuRef.current?.open&&!menuRef.current.contains(event.target as Node))menuRef.current.open=false};document.addEventListener('pointerdown',close);return()=>document.removeEventListener('pointerdown',close)},[])
 const visible=useMemo(()=>siteLinks.filter(site=>(category==='전체'||site.category===category)&&`${site.name} ${site.description} ${site.tags.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase())),[query,category])
 const closeMenu=(event:MouseEvent<HTMLElement>)=>{const details=event.currentTarget.closest('details');if(details)details.open=false}
 return <div className="app"><header className="site-header"><a className="brand" href="/"><i>W</i><span>WonderLife<small>Everyday answers, made simple.</small></span></a><nav><a href="/#tools">계산기</a><a href="/#data">생활 자료</a><a href="/links" aria-current="page">생활 사이트</a><a href="/guides">이용 가이드</a><a href="/#history">계산 이력</a></nav><details ref={menuRef} className="mobile-menu"><summary>메뉴</summary><div onClick={closeMenu}><a href="/#tools">계산기</a><a href="/#data">생활 자료</a><a href="/links">생활 사이트</a><a href="/guides">이용 가이드</a><a href="/#history">전체 계산 이력</a></div></details></header>
 <main className="links-page"><p className="eyebrow">CURATED LIFE LINKS</p><h1>생활 사이트 모음</h1><p className="links-lead">공공 업무부터 교통, 취업과 커뮤니티까지 자주 찾는 사이트를 용도별로 정리했습니다. WonderLife가 직접 운영하지 않는 외부 사이트이며, 중요한 정보는 해당 사이트의 최신 안내를 확인하세요.</p>
 <div className="link-search"><input aria-label="생활 사이트 검색" placeholder="사이트명, 용도 또는 태그 검색" value={query} onChange={e=>setQuery(e.target.value)}/><span>{visible.length}개 사이트</span></div>
 <div className="category-chips" aria-label="사이트 카테고리">{siteLinkCategories.map(item=><button className={category===item?'selected':''} onClick={()=>setCategory(item)} key={item}>{item}</button>)}</div>
 <section className="site-grid" aria-live="polite">{visible.map(site=><article key={site.name}><div><small>{site.category}</small><h2>{site.name}</h2></div><p>{site.description}</p><div className="site-tags">{site.tags.map(tag=><span key={tag}>#{tag}</span>)}</div>{site.notice&&<p className="site-notice">{site.notice}</p>}<a href={site.url} target="_blank" rel="noopener noreferrer" aria-label={`${site.name} 외부 사이트 방문`}>사이트 방문 ↗</a></article>)}</section>{!visible.length&&<div className="empty-history">검색 조건에 맞는 사이트가 없습니다.</div>}
 <aside className="directory-policy"><h2>선정 및 관리 기준</h2><p>공식 기관 또는 널리 이용되는 생활 서비스를 중심으로 직접 분류하고 설명을 작성했습니다. 순위나 품질을 보증하지 않으며 유료 게재 링크는 현재 없습니다. 링크 오류나 수정 요청은 문의 페이지로 알려주세요.</p><b>마지막 링크 확인: 2026-08-30</b><a href="/contact">수정·오류 제보 →</a></aside></main>
 <TopButton/><nav className="mobile-bottom-nav" aria-label="모바일 빠른 메뉴"><a href="/">홈</a><a href="/#tools">계산기</a><a className="active" href="/links">사이트</a><a href="/#history">이력</a><a href="/guides">가이드</a></nav></div>
}
