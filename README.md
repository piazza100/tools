# WonderLife

날짜, 생활, 금융, 학습 계산기와 공식 생활 자료를 한곳에 제공하는 반응형 웹 서비스입니다.

- 비회원: 모든 계산 기능 사용 가능, 계산기별 최근 10개 이력을 현재 브라우저에 저장
- Google 로그인 회원: 브라우저 이력을 계정 DB로 이관하고 이후 계산 입력과 결과를 자동 저장·조회·삭제
- Frontend: React + TypeScript + Vite
- Backend: Java 17 + Spring Boot + MyBatis + Flyway
- Database: Aiven MySQL

## Local run

1. `.env.example`을 참고해 프로젝트 루트의 `.env.local`을 작성합니다. Spring Boot가 이 파일을 자동으로 불러오므로 IDE 실행 설정에 값을 중복 등록하지 않습니다. OS 또는 IDE 환경변수에 같은 키가 있으면 해당 값이 `.env.local`보다 우선합니다.
2. 백엔드: `mvn spring-boot:run`
3. 프런트엔드: `cd frontend` 후 `pnpm install`, `pnpm dev`

연봉 실수령액은 선택 연도의 사회보험료율과 일반적인 공제 가정을 사용한 참고용 추정치입니다. 실제 원천징수액은 국세청 간이세액표, 부양가족, 비과세 급여 및 회사 처리에 따라 달라집니다.

## AdSense

`frontend/.env.local`의 `VITE_GOOGLE_ADSENSE_CLIENT`에 승인받은 `ca-pub-...` 값을 설정하면 공식 AdSense 스크립트와 계정 메타 태그가 로드됩니다. 값이 없거나 placeholder이면 개발 화면에서 광고 요청을 보내지 않습니다. `ads.txt`는 실제 게시자 ID를 발급받은 뒤 추가합니다.

승인 신청 전 체크리스트:

1. 실제 도메인에 HTTPS로 배포하고 모든 계산기·가이드·정책 링크가 로그인 없이 열리는지 확인합니다.
2. Search Console에서 소유권을 확인하고 실제 도메인을 넣은 `sitemap.xml`을 제출합니다.
3. AdSense 게시자 ID 발급 후 `VITE_GOOGLE_ADSENSE_CLIENT=ca-pub-...`를 설정하고, `frontend/public/ads.txt`에 Google이 제공한 정확한 한 줄을 추가합니다.
4. 계산 가이드를 직접 검토해 서비스 계산식과 맞는지 확인하고, 얇은 자동 생성 Q&A를 대량 게시하지 않습니다.
5. 모바일 화면, 깨진 링크, 빈 페이지, 공사 중 문구가 없는지 확인한 뒤 사이트 검토를 요청합니다.

현재 저장소에는 서비스 소개, 개인정보처리방침, 이용약관, 문의, 6개의 계산 가이드, `robots.txt`, 기본 검색·공유 메타 태그가 포함되어 있습니다. 실제 도메인이 정해지기 전에는 잘못된 URL이 검색엔진에 전달되지 않도록 `sitemap.xml`을 생성하지 않습니다.

## Production deployment

### 1. Render backend

- PixelLife와 동일하게 저장소 루트의 `Dockerfile`을 사용하는 Docker Web Service로 생성합니다.
- Render에서 New Web Service를 만들고 Runtime은 Docker, Dockerfile path는 `./Dockerfile`로 지정합니다.
- Health check path: `/actuator/health`
- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`은 Render Secret 환경변수로 등록합니다.
- `FRONTEND_ORIGIN`과 `FRONTEND_URL`에는 Cloudflare Worker의 실제 HTTPS 도메인을 입력합니다.
- `GOOGLE_REDIRECT_URI`에는 `https://실제프런트도메인/login/oauth2/code/google`을 입력합니다.

### 2. Cloudflare Workers Static Assets frontend

- Worker `tools`에 Git 저장소를 연결하고 Build configuration의 Root directory를 `frontend`로 지정합니다.
- Build command: `pnpm build`
- Deploy command: `pnpm deploy` (`deploy` 스크립트가 프로덕션 빌드 후 Wrangler 배포까지 수행합니다.)
- Worker의 Variables and Secrets에 `API_ORIGIN=https://wonderlife-api.onrender.com`을 Text 변수로 등록합니다. 실제 Render 주소로 교체합니다.
- AdSense 승인 후 `VITE_GOOGLE_ADSENSE_CLIENT=ca-pub-...`도 등록합니다.
- `frontend/wrangler.jsonc`가 빌드 결과물인 `frontend/dist`만 정적 자산으로 배포합니다.
- `frontend/worker/index.ts`가 API와 OAuth 요청을 같은 도메인에서 Render로 프록시합니다.

### 3. Google OAuth

- 승인된 JavaScript 원본이 필요한 경우 실제 프런트 도메인을 등록합니다.
- 승인된 리디렉션 URI에는 `https://실제프런트도메인/login/oauth2/code/google`을 정확히 등록합니다.
- 배포 후 로그인, 새로고침 세션 유지, 로그아웃, 비회원 이력 이관을 실제 도메인에서 확인합니다.
