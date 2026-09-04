# 내 장바구니 물가지수 수집 운영 가이드

WonderLife는 한국농수산식품유통공사(aT)의 최근일자 도·소매가격 API를 하루 한 번 호출하고, 원본 응답과 정제된 가격을 Aiven MySQL에 저장한다. 사용자가 통계 화면을 열 때는 외부 API를 다시 호출하지 않고 저장된 최신 데이터를 조회한다.

## 운영 흐름

```text
Cloudflare Worker Cron (매일 06:30 KST)
    ↓ 작업용 토큰으로 호출
Render WonderLife API
    ↓ 공공데이터 인증키로 조회
aT 최근일자 도·소매가격 API
    ↓
원본 응답 및 정제 가격 → Aiven MySQL
    ↓
/data/basket-price-index
```

수집 엔드포인트는 다음과 같다.

```text
POST /api/internal/prices/collect
```

모든 요청에 `X-Price-Job-Token` 헤더가 필요하다.

## 필요한 비밀 환경변수

### Render 백엔드

Render 서비스의 `Environment`에 다음 값을 Secret으로 등록한다.

```text
DATA_GO_KR_SERVICE_KEY=공공데이터포털에서 발급받은 인코딩 인증키
PRICE_COLLECTION_JOB_TOKEN=WonderLife 내부 수집용 무작위 토큰
```

- `DATA_GO_KR_SERVICE_KEY`는 Render 백엔드가 aT API를 호출할 때 사용한다.
- `PRICE_COLLECTION_JOB_TOKEN`은 외부인이 수집 엔드포인트를 실행하지 못하게 보호한다.
- 실제 값은 Git, README, 배포 로그에 기록하지 않는다.

### Cloudflare Worker

Cloudflare Worker의 `Settings → Variables and Secrets`에 다음 Secret을 등록한다.

```text
PRICE_COLLECTION_JOB_TOKEN=Render에 등록한 값과 동일한 토큰
```

Cloudflare에는 `DATA_GO_KR_SERVICE_KEY`를 등록하지 않는다. 공공데이터 API는 Render 백엔드만 호출한다.

## 자동 배치

Cloudflare Worker의 Cron Trigger는 [frontend/wrangler.jsonc](frontend/wrangler.jsonc)에 정의되어 있다.

```json
{
  "triggers": {
    "crons": ["30 21 * * *"]
  }
}
```

Cloudflare Cron은 UTC를 사용한다. `21:30 UTC`는 한국시간으로 다음 날 `06:30 KST`다.

프런트 Worker를 정상 배포하면 `scheduled()` 핸들러가 매일 Render의 수집 엔드포인트를 호출한다. 기본 호출은 같은 서울 달력 날짜에 실행 기록이 있으면 aT API를 다시 호출하지 않는다.

## 수동 실행

다음 PowerShell 명령은 로컬 `.env.local`에서 내부 토큰을 읽어 배포된 Render 백엔드를 호출한다. `실제백엔드주소`만 교체한다.

```powershell
$apiOrigin = "https://실제백엔드주소.onrender.com"
$jobToken = (
  Get-Content "D:\PROJECT2\WonderLife\.env.local" |
  Where-Object { $_ -like "PRICE_COLLECTION_JOB_TOKEN=*" }
).Split("=", 2)[1]

Invoke-RestMethod `
  -Method Post `
  -Uri "$apiOrigin/api/internal/prices/collect" `
  -Headers @{ "X-Price-Job-Token" = $jobToken }
```

정상적인 최초 실행 응답 예시는 다음과 같다.

```json
{
  "runId": 1,
  "itemCount": 463,
  "alreadyCollected": false,
  "forced": false,
  "businessDate": "2026-09-03",
  "status": "SUCCESS"
}
```

`itemCount`는 API 제공 데이터의 변경에 따라 달라질 수 있다.

## 이미 실행된 경우

같은 날짜에 기본 요청을 다시 보내면 외부 API를 호출하지 않고 기존 실행 상태를 반환한다.

```json
{
  "runId": 1,
  "itemCount": 0,
  "alreadyCollected": true,
  "forced": false,
  "businessDate": "2026-09-03",
  "status": "SUCCESS"
}
```

확인할 값:

- `alreadyCollected: true`: 오늘 실행 기록이 있어 외부 API를 호출하지 않았음
- `status: SUCCESS`: 기존 실행이 정상 완료됨
- `status: FAILED`: 기존 실행이 실패했으므로 원인을 확인하고 강제 재실행할 수 있음
- `status: RUNNING`: 다른 요청이 현재 수집을 진행하고 있음

## 강제 재실행

운영자가 장애 복구나 데이터 정정을 위해 같은 날 다시 수집해야 할 때만 `force=true`를 사용한다.

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri "$apiOrigin/api/internal/prices/collect?force=true" `
  -Headers @{ "X-Price-Job-Token" = $jobToken }
```

강제 실행은 다음 작업을 수행한다.

- aT API를 다시 호출한다.
- 해당 실행의 원본 응답 페이지를 교체한다.
- 동일 품목·조사일 가격을 갱신한다.
- 중복 가격 행을 생성하지 않는다.
- 수집 시도 횟수와 강제 실행 시각을 기록한다.

강제 실행 결과에는 `forced: true`가 표시된다.

```json
{
  "runId": 1,
  "itemCount": 463,
  "alreadyCollected": false,
  "forced": true,
  "businessDate": "2026-09-03",
  "status": "SUCCESS"
}
```

강제 실행도 일일 API 사용량을 소비한다. 정상 배치가 완료된 날에는 데이터 정정이 필요한 경우가 아니면 사용하지 않는다.

## 저장 데이터

Flyway 마이그레이션 `V3__create_daily_price_snapshots.sql`이 다음 테이블을 생성한다.

- `tools_price_collection_runs`: 일별 실행 상태, 시도 횟수, 성공·실패 정보
- `tools_price_raw_responses`: API 페이지별 원본 JSON
- `tools_price_items`: 품목·품종·등급·단위·소매/중도매 기준정보
- `tools_daily_price_snapshots`: 조사일 가격과 과거 비교 가격

가격 스냅샷은 `품목 ID + 조사일`을 유니크 키로 사용한다. 같은 날짜를 강제로 다시 수집하면 기존 값을 갱신한다.

## 응답 필드와 가격 처리

현재 확인한 aT API의 주요 필드는 다음과 같다.

- `exmn_ymd`: 조사일
- `se_cd`, `se_nm`: 소매 또는 중도매 구분
- `item_cd`, `item_nm`: 품목
- `vrty_cd`, `vrty_nm`: 품종
- `grd_cd`, `grd_nm`: 등급
- `unit`, `unit_sz`: 원래 단위
- `exmn_dd_prc`: 조사일 원래 단위 가격
- `exmn_dd_cnvs_prc`: 조사일 kg 환산 가격
- `dd1_bfr_prc`: 1일 전 가격
- `ww1_bfr_prc`: 1주 전 가격
- `mm1_bfr_prc`: 1개월 전 가격
- `yy1_bfr_prc`: 1년 전 가격

화면에 표시하는 장바구니 가격은 원래 조사 단위를 사용한다. kg 환산 가격은 단위가 다른 품목을 비교하거나 향후 분석할 수 있도록 별도로 보존한다.

## 장애 확인

### `401 Unauthorized`

- 요청의 `X-Price-Job-Token`이 누락됐는지 확인한다.
- Cloudflare와 Render의 `PRICE_COLLECTION_JOB_TOKEN`이 정확히 같은지 확인한다.
- 토큰 앞뒤에 공백이나 따옴표가 저장되지 않았는지 확인한다.

### `DATA_GO_KR_SERVICE_KEY is not configured`

- Render에 `DATA_GO_KR_SERVICE_KEY`가 등록됐는지 확인한다.
- 환경변수 추가 후 백엔드가 재배포됐는지 확인한다.

### 공공데이터 인증 오류

- 공공데이터포털 활용신청 상태를 확인한다.
- 현재 API에 발급된 인증키인지 확인한다.
- 키 재발급 직후라면 게이트웨이 반영 후 다시 시도한다.
- 대화나 로그에 노출된 인증키는 운영 전에 재발급한다.

### 자동 배치 실패

1. Cloudflare Worker의 Cron Trigger와 실행 로그를 확인한다.
2. Render 로그에서 `/api/internal/prices/collect` 요청과 예외를 확인한다.
3. 기본 수동 호출로 당일 실행 상태를 확인한다.
4. 상태가 `FAILED`이고 원인이 해결됐다면 `force=true`로 한 번만 재실행한다.

## 운영 원칙

- 평상시에는 자동 배치 하루 한 번만 사용한다.
- 사용자가 통계 화면을 열 때 외부 API를 호출하지 않는다.
- 강제 실행 권한은 운영자에게만 둔다.
- 실제 인증키와 내부 토큰을 코드나 문서에 기록하지 않는다.
- 실패했다고 기존 정상 가격 데이터를 삭제하지 않는다.
- 화면에는 가격 기준일과 조사 평균가격이라는 점을 표시한다.
- 조사 평균가격은 실제 매장 판매가격과 다를 수 있다.

