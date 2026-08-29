export function loadAdSense(){
 const client=import.meta.env.VITE_GOOGLE_ADSENSE_CLIENT?.trim()
 if(!/^ca-pub-\d{16}$/.test(client||'')||document.querySelector('script[data-wonderlife-adsense]'))return
 const script=document.createElement('script')
 script.async=true
 script.crossOrigin='anonymous'
 script.src=`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`
 script.dataset.wonderlifeAdsense='true'
 document.head.appendChild(script)
 const meta=document.createElement('meta');meta.name='google-adsense-account';meta.content=client;document.head.appendChild(meta)
}
