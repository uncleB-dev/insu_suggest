# 보장 설계 시뮬레이터 (insu_suggest)

설계사가 고객별 맞춤 보장 설계안을 만들어 URL로 공유하고, 고객이 직접 보장을
ON/OFF·금액 조정·저장하면 설계사가 대시보드에서 결과를 확인하는 웹 서비스.

이 저장소는 **Claude Design 핸드오프 번들**(`보장 설계 시뮬레이터.html`, Wanted/Montage
WDS 디자인 시스템)을 **Next.js + React** 로 충실히 이식한 UI 구현체입니다.

## 스택

| 레이어 | 기술 |
|---|---|
| 프레임워크 | Next.js 14 (App Router) |
| UI | React 18, 인라인 스타일 + WDS CSS 토큰 (`lib/colors_and_type.css`) |
| DB·인증 | **Supabase** (Postgres + Auth) — 프로젝트 `insu-suggest` (서울 리전) |
| 폰트 | Pretendard (jsDelivr) |
| 아이콘 | Wanted WDS 아이콘 (`lib/icons.js`) |

## 실행

```bash
npm install
cp .env.example .env.local   # Supabase URL/anon key 입력
npm run dev      # http://localhost:3000
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버
```

필수 환경변수 (`.env.local` / Vercel 프로젝트 설정):

```
NEXT_PUBLIC_SUPABASE_URL=https://rqngzsmenridabrluvxt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

## 라우트 (실데이터)

| 경로 | 설명 |
|---|---|
| `/login` | 설계사 로그인 (Supabase Auth) |
| `/admin` | 대시보드 — 내 설계안 목록 (RLS로 본인 것만) |
| `/admin/new` | 새 설계안 생성 → `create_plan` RPC, 고객 URL 발급 |
| `/admin/[planId]` | 설계안 상세 — 원안 vs 고객안 비교, 메모, 저장 이력 |
| `/p/[slug]` | 고객 페이지 — 인증 게이트 → 설계 조정 → 저장 (`get_plan_for_client`·`save_submission` RPC) |
| `/preview` | **디자인 프로토타입 내비게이터** (목 데이터, 8개 화면 미리보기) |

`/` 는 `/login` 으로 리다이렉트됩니다.

### 데모 로그인

- 설계사: `demo@insu.test` / `demo1234` (Supabase 시드)
- 새 설계안 생성 시 인증 생년월일을 입력하면, 발급된 `/p/[slug]` 에서 그 값으로 진입.

## 데이터 모델 (Supabase, PROJECT_PLAN §3)

- `advisors` — Auth 사용자와 1:1 (신규 가입 시 트리거로 자동 생성).
- `plans` — 설계안 1건. `access_code_hash`(bcrypt), `slug`(랜덤), `proposal_json`, `status(sent/viewed/saved)`.
- `submissions` — 고객 저장 결과 (1:N), `state_json`·`total_premium`·`client_memo`.
- **RLS**: 설계사는 본인 `advisor_id` 행만 접근. 고객은 테이블 직접 접근 불가 —
  `SECURITY DEFINER` RPC(`create_plan`/`get_plan_for_client`/`save_submission`)로만,
  내부에서 `access_code` 해시를 검증.

## 화면 구성 (UI_SPEC 8개 화면)

| # | 화면 | 컴포넌트 |
|---|---|---|
| 1 | 설계사 로그인 | `components/AdminScreens.jsx` → `LoginScreen` |
| 2 | 관리자 대시보드 (+ 보장 설명 관리) | `AdminScreens.jsx` → `DashboardScreen` |
| 3 | 새 설계안 생성 (3스텝·JSON 검증) | `components/NewPlanScreen.jsx` |
| 4 | 설계안 상세·비교 (원안 vs 고객안) | `components/DetailScreen.jsx` |
| 5 | 고객 인증 게이트 | `components/CustomerScreens.jsx` → `GateScreen` |
| 6 | 고객 설계 메인 (모바일 + 데스크탑) | `CustomerScreens.jsx` / `components/PlannerDesktop.jsx` |
| 7 | 저장 완료 | `CustomerScreens.jsx` → `SavedScreen` |
| 8 | 공통 상태 (로딩·에러·빈·토스트) | `components/CommonStates.jsx` |

공유 빌딩 블록: `components/Primitives.jsx` (버튼·칩·입력·스위치·뱃지·카드),
`components/Extras.jsx` (로고·한도 노트·금액 스텝퍼·토스트·폰 프레임·설계사 코멘트),
`components/PlannerCore.jsx` (설계 로직 훅·담보 카드·요약·저장 모달).

## 적용한 디자인 시스템

- Primary = 일렉트릭 블루 `#0066FF` (CTA·강조·선택). 보험 의미색은 WDS 상태색으로
  매핑 — 절감/감소 = 그린, 인상/경고 = 레드, 가입 한도 = 오렌지.
- Pretendard, 쿨뉴트럴 텍스트, inset 보더 카드(라운드 16), 블러 칩/내비,
  200~300ms 트랜지션.

## 컴플라이언스 반영

- 고객 이름은 항상 마스킹(`김*아`), 주민번호·병력 미표시.
- 보험료 옆 "참고/월" 맥락 표기, 금액 인상 시 가입 한도 안내, 저장 전 심사 재고지.
- 고객 인증 생년월일은 설계사가 생성 화면에서 직접 입력 — JSON·제안서에는 저장하지 않음.

## 데모 값

- 설계사 로그인: 비밀번호 `0000` → 의도적 오류, 그 외 값 → 진입
- 고객 인증 게이트: 기본 생년월일 `130506`
