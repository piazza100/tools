import {INDEXABLE_PATHS} from './sitePaths'
import {guides,guideSources} from '../src/guides'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  API_ORIGIN?: string
  PRICE_COLLECTION_JOB_TOKEN?: string
}

const API_PATHS = ['/api/', '/oauth2/', '/login/', '/logout']
const indexedCalculatorPaths=new Set(guides.flatMap(guide=>guide.calculatorPath?[guide.calculatorPath]:[]))
const reviewedGuidePaths=new Set(guides.map(guide=>`/guides/${guide.slug}`))
export const isIndexedCalculatorPath=(path:string)=>indexedCalculatorPaths.has(path)
export const shouldServeAdsOnPath=(path:string)=>indexedCalculatorPaths.has(path)||reviewedGuidePaths.has(path)
const ADSENSE_SCRIPT='<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7454918902572923" crossorigin="anonymous"></script>'
const escapeHtml=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!))
export const renderGuide=(slug:string)=>{
  const guide=guides.find(item=>item.slug===slug)
  if(!guide)return null
  const sections=guide.sections.map(section=>`<section><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('')
  const faq=guide.faq.map(item=>`<details><summary>${escapeHtml(item.q)}</summary><p>${escapeHtml(item.a)}</p></details>`).join('')
  const calculator=guide.calculatorPath?`<a class="guide-calculator-link" href="${escapeHtml(guide.calculatorPath)}">이 기준으로 직접 계산하기 →</a>`:''
  const sources=(guideSources[guide.slug]||[]).map(source=>`<li><a href="${escapeHtml(source.url)}">${escapeHtml(source.label)}</a><span>${escapeHtml(source.note)}</span></li>`).join('')
  const sourceSection=sources?`<section class="guide-sources"><h2>확인한 공식 자료</h2><p>WonderLife 운영팀이 아래 공식 자료와 계산기 구현을 대조해 내용을 검토했습니다. 제도와 요율은 적용 시점에 따라 달라질 수 있으므로 실제 결정 전 최신 공고를 다시 확인하세요.</p><ul>${sources}</ul></section>`:''
  return {guide,html:`<div class="app"><article class="guide-page"><a href="/guides">← 계산 가이드</a><p class="eyebrow">CALCULATION GUIDE</p><h1>${escapeHtml(guide.title)}</h1><p class="guide-lead">${escapeHtml(guide.summary)}</p>${calculator}${sections}<section><h2>자주 묻는 질문</h2>${faq}</section>${sourceSection}<aside class="guide-review"><b>작성·검토</b><span>WonderLife 운영팀 · 계산식, 예제 입력과 공식 자료를 교차 확인합니다.</span></aside><p class="guide-updated">마지막 검토: 2026년 10월 · 계산 결과는 참고용이며 실제 계약·심사·정산을 대신하지 않습니다.</p></article></div>`}
}
export const renderCalculator=(path:string)=>{
  const guide=guides.find(item=>item.calculatorPath===path)
  if(!guide)return null
  const sections=guide.sections.map(section=>`<section><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map(paragraph=>`<p>${escapeHtml(paragraph)}</p>`).join('')}</section>`).join('')
  return {guide,html:`<main class="guide-page calculator-prerender"><p class="eyebrow">WONDERLIFE CALCULATOR</p><h1>${escapeHtml(guide.title.replace(/ 가이드$/,''))}</h1><p class="guide-lead">${escapeHtml(guide.summary)}</p><a class="guide-calculator-link" href="#workspace">계산기 입력으로 이동 ↓</a>${sections}<p><a href="/guides/${escapeHtml(guide.slug)}">계산 예제와 공식 출처까지 자세히 보기 →</a></p></main>`}
}
function isApiRequest(pathname: string) {
  return API_PATHS.some((path) => pathname === path.slice(0, -1) || pathname.startsWith(path))
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const incoming = new URL(request.url)
    if (incoming.pathname === '/robots.txt') return new Response(`User-agent: *\nAllow: /\nSitemap: ${incoming.origin}/sitemap.xml\n`, {headers:{'content-type':'text/plain; charset=utf-8','cache-control':'public, max-age=3600'}})
    if (incoming.pathname === '/sitemap.xml') {
      const paths:string[]=[...INDEXABLE_PATHS].filter(path=>!path.startsWith('/calculators/')||isIndexedCalculatorPath(path))
      if(env.API_ORIGIN)try{
        const response=await fetch(`${env.API_ORIGIN.replace(/\/$/,'')}/api/public/education/school-pages`,{signal:AbortSignal.timeout(5000)})
        if(response.ok){const schools=await response.json() as {office:string;school:string}[];schools.forEach(s=>paths.push(`/data/education/school/${encodeURIComponent(s.office)}/${encodeURIComponent(s.school)}`))}
      }catch{/* Base sitemap stays available during upstream outages. */}
      const urls=[...new Set(paths)].map(path=>`  <url><loc>${incoming.origin}${path}</loc></url>`).join('\n')
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,{headers:{'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=3600'}})
    }
    if (!isApiRequest(incoming.pathname)) {
      const response = await env.ASSETS.fetch(request)
      const guideMatch=incoming.pathname.match(/^\/guides\/([^/]+)\/?$/)
      const renderedGuide=guideMatch?renderGuide(guideMatch[1]):null
      const renderedCalculator=renderCalculator(incoming.pathname)
      const educationMeta:Record<string,[string,string]>={
        '/guides/education-statistics':['교육 통계 읽는 법','학교 수·학생 수·학급 밀도와 동일 학교 증감률을 해석하는 방법을 계산 예제로 확인하세요.'],
        '/data/education':['대한민국 교육·학교 통계','전국 학교, 지역별 학생·학급 현황, 급식과 학사일정을 공식 데이터로 확인하세요.'],
        '/data/education/schools':['전국 학교 검색과 학교별 통계','학교명을 검색해 기본정보, 학생·교원·학급 지표, 급식과 학사일정을 확인하세요.'],
        '/data/education/regions':['지역별 학생 수·학교 수 비교','시도별 학생 수, 학교 수와 학급당 학생 수를 연도별로 비교하세요.'],
        '/data/education/meals-schedules':['전국 학교 급식·학사일정 통계','오늘 수집된 학교 급식과 앞으로 30일간의 학사일정 통계를 확인하세요.'],
        '/data/education/collection-status':['교육 통계 데이터 수집 현황','NEIS와 학교알리미 일배치의 수집 범위, 기준일과 백필 진행률을 확인하세요.'],
        '/data/education/trends':['학생 수 연도별 추이·시군구 증감','최근 3년 학생·학급·교원 수와 동일 학교 기준 시군구별 학생 증감을 확인하세요.'],
        '/data/education/disclosures':['학교알리미 전체 공시 자료','학교알리미 공시 원자료를 연도, API 유형, 지역과 학교명으로 조회합니다.'],
      }
      if(renderedGuide)educationMeta[incoming.pathname]=[renderedGuide.guide.title,renderedGuide.guide.summary]
      if(renderedCalculator)educationMeta[incoming.pathname]=[renderedCalculator.guide.title.replace(/ 가이드$/,''),renderedCalculator.guide.summary]
      if(incoming.pathname.startsWith('/calculators/')&&!renderedCalculator)educationMeta[incoming.pathname]=['WonderLife 보조 계산 도구','로그인 없이 입력하고 결과를 확인하는 WonderLife 생활 계산 도구입니다.']
      let schoolHasData=false
      if(/^\/data\/education\/school\/[^/]+\/[^/]+$/.test(incoming.pathname)){
        educationMeta[incoming.pathname]=['학교별 교육 통계','학교 기본정보와 수집된 공시 지표·급식·학사일정입니다.']
        if(env.API_ORIGIN)try{
          const identifiers=incoming.pathname.split('/').slice(4).join('/')
          const response=await fetch(`${env.API_ORIGIN.replace(/\/$/,'')}/api/public/education/schools/${identifiers}`,{signal:AbortSignal.timeout(5000)})
          if(response.ok){const detail=await response.json() as {school:{schoolName:string};metrics:unknown[];meals:unknown[];schedules:unknown[]};educationMeta[incoming.pathname]=[`${detail.school.schoolName} 학교 통계`,`${detail.school.schoolName} 학생·교원·학급 지표와 수집된 급식·학사일정을 확인하세요.`];schoolHasData=detail.metrics.length+detail.meals.length+detail.schedules.length>0}
        }catch{/* Unverified school pages remain noindex rather than thin search entries. */}
      }
      const meta=educationMeta[incoming.pathname]
      if(!meta||!response.headers.get('content-type')?.includes('text/html'))return response
      const headers=new Headers(response.headers)
      const isThinCalculator=incoming.pathname.startsWith('/calculators/')&&!isIndexedCalculatorPath(incoming.pathname)
      const robots=incoming.pathname.endsWith('/collection-status')||(incoming.pathname.includes('/school/')&&!schoolHasData)||isThinCalculator?'noindex, follow':'index, follow'
      const serveAds=robots==='index, follow'&&shouldServeAdsOnPath(incoming.pathname)
      headers.set('X-Robots-Tag',robots)
      const html=new Response(response.body,{status:response.status,headers})
      return new HTMLRewriter()
        .on('title',{element(element){element.setInnerContent(`${meta[0]} | WonderLife`)}})
        .on('meta[name="description"]',{element(element){element.setAttribute('content',meta[1])}})
        .on('meta[property="og:title"]',{element(element){element.setAttribute('content',`${meta[0]} | WonderLife`)}})
        .on('meta[property="og:description"]',{element(element){element.setAttribute('content',meta[1])}})
        .on('link[rel="canonical"]',{element(element){element.setAttribute('href',incoming.origin+incoming.pathname)}})
        .on('head',{element(element){element.append(`<meta name="robots" content="${robots}"><link rel="canonical" href="${incoming.origin}${incoming.pathname}">${serveAds?ADSENSE_SCRIPT:''}`,{html:true})}})
        .on('#root',{element(element){const initialContent=renderedGuide?.html||renderedCalculator?.html;if(initialContent)element.setInnerContent(initialContent,{html:true})}})
        .on('script[src*="pagead2.googlesyndication.com"]',{element(element){if(robots.startsWith('noindex'))element.remove()}})
        .transform(html)
    }

    const apiOrigin = String(env.API_ORIGIN || '').replace(/\/$/, '')
    if (!apiOrigin) return new Response('API proxy is not configured', { status: 503 })

    const target = new URL(incoming.pathname + incoming.search, apiOrigin)
    const headers = new Headers(request.headers)
    headers.delete('host')
    headers.set('X-Forwarded-Host', incoming.host)
    headers.set('X-Forwarded-Proto', 'https')

    const methodHasBody = request.method !== 'GET' && request.method !== 'HEAD'
    const upstreamRequest = new Request(target.toString(), {
      method: request.method,
      headers,
      body: methodHasBody ? request.body : undefined,
      redirect: 'manual',
    })
    const upstream = await fetch(upstreamRequest)
    return new Response(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: upstream.headers,
    })
  },
  async scheduled(_controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    const apiOrigin=String(env.API_ORIGIN||'').replace(/\/$/,'')
    const token=String(env.PRICE_COLLECTION_JOB_TOKEN||'')
    if(!apiOrigin||!token)throw new Error('Price collection cron is not configured')
    const collect=async(path:string)=>{const response=await fetch(`${apiOrigin}${path}`,{method:'POST',headers:{'X-Price-Job-Token':token}});const body=await response.text();if(!response.ok)throw new Error(`Collection failed: ${response.status} ${body}`);try{if(JSON.parse(body).success===false)throw new Error(`Collection partially failed: ${body}`)}catch(error){if(error instanceof SyntaxError)return;throw error}}
    ctx.waitUntil(Promise.all([collect('/api/internal/prices/collect'),collect('/api/internal/education/collect')]).then(()=>undefined))
  },
}
