export default function TopButton(){
 const goTop=()=>window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})
 return <button className="top-button" onClick={goTop} aria-label="페이지 맨 위로 이동"><span>↑</span> 맨 위</button>
}
