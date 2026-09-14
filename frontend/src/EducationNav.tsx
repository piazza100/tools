import {educationLinks} from './educationContent'
export default function EducationNav(){return <nav className="education-subnav" aria-label="교육 통계 메뉴">{educationLinks.map(item=><a key={item.path} href={item.path} aria-current={window.location.pathname===item.path?'page':undefined}>{item.label}</a>)}</nav>}
