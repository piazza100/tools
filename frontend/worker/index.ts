import {INDEXABLE_PATHS} from './sitePaths'

interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  API_ORIGIN?: string
  PRICE_COLLECTION_JOB_TOKEN?: string
}

const API_PATHS = ['/api/', '/oauth2/', '/login/', '/logout']
function isApiRequest(pathname: string) {
  return API_PATHS.some((path) => pathname === path.slice(0, -1) || pathname.startsWith(path))
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const incoming = new URL(request.url)
    if (incoming.pathname === '/robots.txt') return new Response(`User-agent: *\nAllow: /\nSitemap: ${incoming.origin}/sitemap.xml\n`, {headers:{'content-type':'text/plain; charset=utf-8','cache-control':'public, max-age=3600'}})
    if (incoming.pathname === '/sitemap.xml') {
      const urls=INDEXABLE_PATHS.map(path=>`  <url><loc>${incoming.origin}${path}</loc></url>`).join('\n')
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,{headers:{'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=3600'}})
    }
    if (!isApiRequest(incoming.pathname)) return env.ASSETS.fetch(request)

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
    ctx.waitUntil(fetch(`${apiOrigin}/api/internal/prices/collect`,{method:'POST',headers:{'X-Price-Job-Token':token}}).then(async response=>{
      const body=await response.text()
      if(!response.ok)throw new Error(`Price collection failed: ${response.status} ${body}`)
      try{if(JSON.parse(body).success===false)throw new Error(`Price collection partially failed: ${body}`)}catch(error){if(error instanceof SyntaxError)return;throw error}
    }))
  },
}
