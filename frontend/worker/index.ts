interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  API_ORIGIN?: string
}

const API_PATHS = ['/api/', '/oauth2/', '/login/', '/logout']
const INDEXABLE_PATHS = [
  '/', '/guides', '/links', '/about', '/privacy', '/terms', '/contact', '/methodology', '/data/minimum-wage', '/data/salary-take-home', '/data/korean-holidays', '/data/basket-price-index',
  '/calculators/date-difference','/calculators/age-calculator','/calculators/d-day','/calculators/business-days','/calculators/percentage','/calculators/vat','/calculators/unit-converter','/calculators/aspect-ratio','/calculators/text-counter','/calculators/random-picker','/calculators/timezone-converter','/calculators/travel-expense','/calculators/fuel-cost','/calculators/savings-goal','/calculators/savings-interest','/calculators/part-time-pay','/calculators/wage-converter','/calculators/social-insurance','/calculators/study-plan','/calculators/recurring-schedule','/calculators/loan-payment','/calculators/apartment-funding-plan','/calculators/funding-source','/calculators/mortgage-capacity','/calculators/monthly-budget','/calculators/jeonse-vs-rent','/calculators/early-loan-repayment','/calculators/retirement-pay','/calculators/parental-leave-income','/calculators/car-cost','/calculators/moving-cost',
  '/guides/date-difference','/guides/unit-conversion','/guides/travel-expense','/guides/business-days','/guides/savings-interest','/guides/part-time-insurance','/guides/wage-conversion','/guides/housing-subscription-plan','/guides/housing-loan-capacity','/guides/monthly-budget-plan','/guides/jeonse-monthly-rent','/guides/early-loan-repayment','/guides/retirement-leave-pay','/guides/parental-leave-income','/guides/car-ownership-cost','/guides/moving-budget',
]

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
}
