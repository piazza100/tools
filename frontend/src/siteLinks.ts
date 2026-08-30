export type SiteLink={name:string;url:string;category:string;description:string;tags:string[];notice?:string}

export const siteLinkCategories=['전체','공공·행정','금융·경제','교통·여행','가격·쇼핑','커뮤니티','취업·생활','뉴스·날씨']

export const siteLinks:SiteLink[]=[
 {name:'정부24',url:'https://www.gov.kr/',category:'공공·행정',description:'민원 신청, 정부 서비스와 정책 정보를 찾는 대한민국 정부 대표 포털입니다.',tags:['민원','증명서','정부']},
 {name:'홈택스',url:'https://www.hometax.go.kr/',category:'공공·행정',description:'국세 신고·납부, 연말정산과 각종 세금 증명 업무를 처리합니다.',tags:['국세','연말정산','세금']},
 {name:'위택스',url:'https://www.wetax.go.kr/',category:'공공·행정',description:'취득세와 자동차세 등 지방세를 조회·신고·납부할 수 있습니다.',tags:['지방세','취득세','자동차세']},
 {name:'국민건강보험',url:'https://www.nhis.or.kr/',category:'공공·행정',description:'건강보험 자격, 보험료와 건강검진 관련 공식 정보를 제공합니다.',tags:['건강보험','보험료','검진']},
 {name:'국민연금공단',url:'https://www.nps.or.kr/',category:'공공·행정',description:'국민연금 가입 내역과 예상연금 관련 공식 서비스를 제공합니다.',tags:['국민연금','예상연금']},
 {name:'워크24',url:'https://www.work24.go.kr/',category:'취업·생활',description:'구직, 고용보험, 직업훈련과 취업지원 서비스를 한곳에서 제공합니다.',tags:['구직','고용보험','직업훈련']},
 {name:'도로명주소 안내',url:'https://www.juso.go.kr/',category:'공공·행정',description:'도로명주소 검색과 영문주소 변환에 필요한 공식 정보를 제공합니다.',tags:['주소','영문주소']},
 {name:'금융감독원 파인',url:'https://fine.fss.or.kr/',category:'금융·경제',description:'금융상품과 금융회사 조회, 소비자 보호 정보를 모은 금융 포털입니다.',tags:['금융상품','금융회사','보호']},
 {name:'DART',url:'https://dart.fss.or.kr/',category:'금융·경제',description:'상장회사 등의 공시 서류를 직접 확인하는 전자공시 시스템입니다.',tags:['공시','기업','투자']},
 {name:'한국은행 ECOS',url:'https://ecos.bok.or.kr/',category:'금융·경제',description:'금리, 물가, 환율 등 한국은행 경제통계를 검색할 수 있습니다.',tags:['통계','금리','환율']},
 {name:'코레일',url:'https://www.letskorail.com/',category:'교통·여행',description:'KTX와 일반열차 운행 정보 및 승차권 예매 서비스를 제공합니다.',tags:['기차','KTX','예매']},
 {name:'고속버스 통합예매',url:'https://www.kobus.co.kr/',category:'교통·여행',description:'고속버스 시간표를 조회하고 승차권을 예매할 수 있습니다.',tags:['버스','시간표','예매']},
 {name:'한국도로공사',url:'https://www.ex.co.kr/',category:'교통·여행',description:'고속도로 교통정보, 통행료와 휴게소 정보를 확인할 수 있습니다.',tags:['고속도로','통행료','교통']},
 {name:'다나와',url:'https://www.danawa.com/',category:'가격·쇼핑',description:'전자제품을 비롯한 여러 상품의 가격과 사양을 비교하는 사이트입니다.',tags:['가격비교','전자제품']},
 {name:'에누리',url:'https://www.enuri.com/',category:'가격·쇼핑',description:'쇼핑 상품의 가격 비교와 카테고리별 정보를 제공합니다.',tags:['가격비교','쇼핑']},
 {name:'뽐뿌',url:'https://www.ppomppu.co.kr/',category:'커뮤니티',description:'쇼핑 정보와 생활·재테크 게시판을 함께 운영하는 커뮤니티입니다.',tags:['쇼핑','핫딜','생활'],notice:'게시물 정보와 거래 조건은 원문에서 다시 확인하세요.'},
 {name:'오늘의유머',url:'https://www.todayhumor.co.kr/',category:'커뮤니티',description:'유머와 다양한 생활 주제 게시판을 제공하는 커뮤니티입니다.',tags:['유머','커뮤니티']},
 {name:'클리앙',url:'https://www.clien.net/',category:'커뮤니티',description:'IT 기기와 생활 정보를 중심으로 여러 게시판을 운영하는 커뮤니티입니다.',tags:['IT','기기','생활']},
 {name:'루리웹',url:'https://www.ruliweb.com/',category:'커뮤니티',description:'게임·취미 뉴스와 주제별 게시판을 제공하는 커뮤니티입니다.',tags:['게임','취미']},
 {name:'인벤',url:'https://www.inven.co.kr/',category:'커뮤니티',description:'게임별 뉴스, 공략과 이용자 게시판을 제공하는 게임 커뮤니티입니다.',tags:['게임','공략']},
 {name:'보배드림',url:'https://www.bobaedream.co.kr/',category:'커뮤니티',description:'자동차 정보와 중고차, 주제별 게시판을 운영하는 커뮤니티입니다.',tags:['자동차','중고차']},
 {name:'사람인',url:'https://www.saramin.co.kr/',category:'취업·생활',description:'채용공고와 기업·직무 관련 취업 정보를 제공합니다.',tags:['채용','기업','취업']},
 {name:'잡코리아',url:'https://www.jobkorea.co.kr/',category:'취업·생활',description:'채용공고 검색과 취업 준비 관련 서비스를 제공합니다.',tags:['채용','취업']},
 {name:'기상청 날씨누리',url:'https://www.weather.go.kr/',category:'뉴스·날씨',description:'대한민국 기상특보, 현재 날씨와 예보를 확인하는 공식 사이트입니다.',tags:['날씨','예보','특보']},
 {name:'에어코리아',url:'https://www.airkorea.or.kr/',category:'뉴스·날씨',description:'지역별 미세먼지와 대기오염 측정 정보를 제공합니다.',tags:['미세먼지','대기']}
]
