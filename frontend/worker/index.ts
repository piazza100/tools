interface Env {
  ASSETS: { fetch(request: Request): Promise<Response> }
  API_ORIGIN?: string
}

const API_PATHS = ['/api/', '/oauth2/', '/login/', '/logout']

function isApiRequest(pathname: string) {
  return API_PATHS.some((path) => pathname === path.slice(0, -1) || pathname.startsWith(path))
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const incoming = new URL(request.url)
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
