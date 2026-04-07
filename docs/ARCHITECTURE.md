# RunLab 데모 앱 — 기술 아키텍처 문서

> 작성일: 2026-04-08  
> 대상 독자: VC 기술 실사팀, 신규 인수 개발팀  
> 목적: 코드 인수 즉시 전체 구조를 파악할 수 있도록 각 파일의 역할과 상호 관계를 설명한다.

---

## 1. 프로젝트 개요

RunLab Demo는 AI 스마트 러닝워치 연구 프로젝트(RunLab)의 **참여자 컴플라이언스 관리 앱** 데모다. 연구 참여자가 스마트워치를 착용하고 매일 기상 EMA(Ecological Momentary Assessment) 설문을 완료하면 게임 캐릭터가 성장하는 gamification 메커니즘을 통해 장기 연구 참여율을 높이는 것을 목적으로 한다.

**기술 스택 요약**

| 항목 | 내용 |
|---|---|
| 프레임워크 | Next.js 16.2.2 (App Router) |
| 언어 | TypeScript 5 |
| UI 스타일링 | Tailwind CSS v4 |
| 애니메이션 | Framer Motion 12 |
| 상태 저장 | `localStorage` (외부 서버/DB 없음) |
| 런타임 | React 19 |
| 배포 | Vercel (Next.js 공식 플랫폼) |

---

## 2. 디렉토리 구조

```
runlab-demo/
├── src/
│   ├── app/                   # Next.js App Router 페이지 디렉토리
│   │   ├── layout.tsx         # 전역 HTML 레이아웃, 폰트, 메타데이터
│   │   ├── globals.css        # 전역 스타일 (Tailwind import + 커스텀 애니메이션)
│   │   ├── page.tsx           # 로그인 페이지 (루트 경로 "/")
│   │   ├── select/page.tsx    # 캐릭터 선택 페이지 ("/select")
│   │   ├── home/page.tsx      # 메인 홈 페이지 ("/home")
│   │   ├── alarm/page.tsx     # 알람 설정 페이지 ("/alarm")
│   │   ├── sleep/page.tsx     # 취침/알람 시뮬레이션 페이지 ("/sleep")
│   │   ├── ema/page.tsx       # 기상 EMA 설문 페이지 ("/ema")
│   │   └── dashboard/page.tsx # 관리자 대시보드 페이지 ("/dashboard")
│   └── store/
│       └── gameStore.ts       # 전역 상태 정의 및 localStorage CRUD 함수
├── public/                    # 정적 에셋 (SVG 아이콘)
├── package.json
├── next.config.ts
├── tailwind.config / postcss.config.mjs
└── tsconfig.json
```

---

## 3. 파일별 역할 설명

### `src/store/gameStore.ts`
앱 전체의 **단일 진실 공급원(Single Source of Truth)**이다. `GameState` 인터페이스 정의, `localStorage` 읽기/쓰기/초기화 함수, 캐릭터 성장 단계 계산 함수(`getStage`), 레벨당 필요 XP 계산 함수(`xpForLevel`), 동물 메타데이터 상수(`ANIMALS`)를 모두 이 파일에서 관리한다. 별도의 전역 상태 관리 라이브러리(Zustand, Redux 등) 없이 함수형 패턴으로 설계되어 있다.

### `src/app/layout.tsx`
Next.js App Router의 루트 레이아웃이다. Geist Sans 폰트 로딩, 전역 메타데이터(`<title>`, `<meta>`), 모바일 viewport 고정(`maximum-scale=1`, `userScalable=false`)을 담당한다. 앱이 모바일 웹앱처럼 동작하도록 설정되어 있다.

### `src/app/globals.css`
Tailwind CSS v4 import 선언과 전역 CSS 변수(`--background`, `--foreground`), 그리고 캐릭터 모션에 사용되는 커스텀 CSS 애니메이션 키프레임(`bounce-subtle`, `float`, `run`, `wiggle`, `sparkle`)을 정의한다. `.mobile-frame` 유틸리티 클래스도 여기서 선언한다.

### `src/app/page.tsx` — 로그인 페이지
연구 참여 코드(예: `SNU-001`)를 입력받는 진입점이다. 코드를 `saveState`로 저장한 뒤, 이미 동물을 선택한 사용자는 `/home`으로, 신규 사용자는 `/select`로 라우팅한다. 입력 오류 시 Framer Motion의 `x` 키프레임으로 흔들림 애니메이션을 적용한다.

### `src/app/select/page.tsx` — 캐릭터 선택 페이지
5종의 동물(강아지, 고양이, 토끼, 여우, 곰) 중 하나를 선택하여 `saveState({ animal })`로 저장하고 `/home`으로 이동한다. 각 동물 카드는 선택 시 scale/rotate 애니메이션이 적용되며, 선택 전까지 확인 버튼이 비활성화된다.

### `src/app/home/page.tsx` — 메인 홈 페이지
앱의 **중심 허브 페이지**다. 다음 정보를 한 화면에 통합 표시한다:
- 캐릭터 카드: 현재 레벨, 동물 이모지(성장 단계별), XP 진행 바, 연속 참여 스트릭
- 알람/취침 카드: 현재 설정된 기상 알람 시간, `/alarm` 및 `/sleep` 진입 버튼
- 주간 착용 현황: 요일별 워치 착용 여부 시각화
- 오늘의 미션: EMA 완료 여부, 워치 착용 여부, 러닝 기록 동기화 상태
- 시연 패널(Demo Panel): VC/데모용으로 레벨 조작, XP 부여, 패널티 시뮬레이션, 상태 초기화 기능을 제공하는 숨겨진 컨트롤 패널

### `src/app/alarm/page.tsx` — 알람 설정 페이지
기상 알람 시간과 취침 리마인더 시간을 설정하는 페이지다. 드럼롤 방식의 `TimeWheel` 컴포넌트(페이지 내 인라인 정의)로 시/분을 조작하고, 저장 시 `saveState`로 `alarmHour`, `alarmMinute`, `bedtimeHour`, `bedtimeMinute`를 갱신한다. 두 시간을 기반으로 예상 수면 시간을 실시간 계산하여 표시한다.

### `src/app/sleep/page.tsx` — 취침/알람 시뮬레이션 페이지
취침부터 기상까지의 **4단계 플로우**를 단일 페이지에서 `AnimatePresence`와 phase 상태로 관리한다.

| Phase | 설명 |
|---|---|
| `bedtime` | 워치 착용 안내 및 취침 시작 버튼 |
| `sleeping` | 어두운 화면, 시계, 수면 중 애니메이션 |
| `alarm` | 알람 진동 시뮬레이션, 슬라이드-투-해제(Slide to Dismiss) UI |
| `dismiss` | 알람 해제 완료, EMA 페이지로 자동 전환 |

취침 시작 시 `saveState({ isSleeping: true, todayWatchWorn: true })`를 호출해 워치 착용 미션을 완료 처리한다. 알람 해제 후 `/ema`로 자동 라우팅한다.

### `src/app/ema/page.tsx` — EMA 설문 페이지
3개 문항(수면 질, 근육통/피로, 기분)을 5점 척도 이모지 버튼으로 응답받는다. 전체 응답 완료 시 제출 버튼이 활성화되며, 제출 시 `saveState({ todayEMA: true, xp: xp+30, streak: streak+1 })`를 호출한다. 제출 후 캐릭터 축하 애니메이션과 `+30 XP` 획득 표시를 보여주고 2.5초 뒤 `/home`으로 자동 이동한다.

### `src/app/dashboard/page.tsx` — 관리자 대시보드
**연구 관리자용 뷰**로, 하드코딩된 더미 데이터(참여자 10명)를 기반으로 전체 참여 현황을 시각화한다. 전체 참여자 수, 평균 착용률, 위험 참여자 수 요약 카드, 주간 착용률 바 차트, 참여자별 착용률·EMA 응답률·스트릭 테이블을 포함한다. 실제 백엔드와 연결되지 않은 데모 전용 뷰이며, CSV 내보내기는 향후 구현 예정으로 표시되어 있다.

---

## 4. 상태 관리 구조

### `GameState` 인터페이스 전체 필드

```typescript
interface GameState {
  participantCode: string;        // 연구 참여 코드 (예: "SNU-001")
  animal: AnimalType | null;      // 선택한 동물 ("dog" | "cat" | "rabbit" | "fox" | "bear")
  xp: number;                     // 현재 레벨에서 누적된 경험치
  level: number;                  // 현재 레벨 (1~10)
  streak: number;                 // 연속 참여 일수
  todayEMA: boolean;              // 오늘 EMA 설문 완료 여부
  todayWatchWorn: boolean;        // 오늘 워치 착용 확인 여부
  alarmHour: number;              // 기상 알람 시 (0~23)
  alarmMinute: number;            // 기상 알람 분 (0~59)
  bedtimeHour: number;            // 취침 리마인더 시 (0~23)
  bedtimeMinute: number;          // 취침 리마인더 분 (0~59)
  isSleeping: boolean;            // 현재 취침 모드 활성 여부
  emaHistory: {                   // 과거 EMA 응답 기록
    date: string;                 //   날짜 ("YYYY-MM-DD")
    sleep: number;                //   수면 질 (1~5)
    muscle: number;               //   근육통/피로 (1~5)
    mood: number;                 //   기분 (1~5)
  }[];
}
```

### 저장 방식 (`localStorage`)

| 함수 | 동작 |
|---|---|
| `loadState()` | `localStorage.getItem("runlab-demo-state")`로 읽어 `defaultState`와 병합 반환. SSR 환경(`window === undefined`)에서는 `defaultState` 반환 |
| `saveState(partial)` | 기존 state와 partial 객체를 spread merge한 뒤 `localStorage.setItem`으로 저장 |
| `resetState()` | `localStorage.removeItem("runlab-demo-state")`로 전체 초기화 |

저장 키: `"runlab-demo-state"` (단일 JSON 문자열로 직렬화)

**주의**: 전역 상태 관리 라이브러리를 사용하지 않으므로, 각 페이지 컴포넌트는 마운트 시점에 `loadState()`를 직접 호출해야 한다. 여러 컴포넌트가 동시에 상태를 구독하는 reactive 구조가 아니며, 페이지 전환 시 `loadState()` 재호출로 최신 상태를 가져오는 단방향 패턴이다.

---

## 5. 페이지 플로우

```
[최초 진입]
     │
     ▼
  "/" (로그인)
  참여 코드 입력
     │
     ├─ animal == null ──▶ "/select" (캐릭터 선택)
     │                          │
     │                          ▼
     └─ animal 있음  ──▶ "/home" (메인 허브)
                               │
               ┌───────────────┼────────────────┐
               │               │                │
               ▼               ▼                ▼
          "/alarm"        "/sleep"         "/dashboard"
          알람 설정      취침 시뮬레이션     관리자 뷰
                              │
                    [Phase: bedtime → sleeping → alarm → dismiss]
                              │
                              ▼
                           "/ema"
                         EMA 설문
                              │
                              ▼
                           "/home"
                     (XP+30, streak+1 반영)
```

**일반 사용자 일상 루틴:**
1. 저녁: `/home` → 취침 시작 버튼 → `/sleep` (Phase: bedtime)
2. 취침: `/sleep` (Phase: sleeping) → 워치 착용 미션 자동 완료
3. 기상: 알람 해제 슬라이드 → `/sleep` (Phase: dismiss) → `/ema` 자동 전환
4. 설문: `/ema` 3문항 응답 제출 → XP +30, 스트릭 +1 → `/home` 복귀

---

## 6. 캐릭터 성장 시스템

### 성장 단계

```typescript
function getStage(level: number): "egg" | "baby" | "young" | "adult" {
  if (level <= 2) return "egg";    // Lv.1~2: 알 단계
  if (level <= 4) return "baby";   // Lv.3~4: 새끼 단계
  if (level <= 7) return "young";  // Lv.5~7: 청소년 단계
  return "adult";                  // Lv.8~10: 성체 단계
}
```

### 레벨당 필요 XP

```typescript
function xpForLevel(level: number): number {
  return level * 50;
  // Lv.1: 50 XP, Lv.2: 100 XP, Lv.3: 150 XP, ... Lv.10: 500 XP
}
```

### XP 획득 경로

| 행동 | 획득 XP |
|---|---|
| EMA 설문 완료 | +30 XP |
| (시연 패널) XP 직접 부여 | +30 XP |

현재 구현에서는 EMA 제출이 유일한 실제 XP 획득 경로이며, 워치 착용 미션(+10 XP 라벨 표시)은 UI에 표시만 되고 실제 지급 로직은 구현되어 있지 않다.

### 패널티 규칙

7일 연속 미참여 시 레벨 1, XP 0, 스트릭 0으로 초기화 — 캐릭터가 알 단계로 퇴화한다. 현재 데모에서는 홈 화면의 시연 패널에서 수동으로 패널티를 시뮬레이션할 수 있다(실제 날짜 기반 자동 판정 로직은 미구현).

### 동물별 시각 메타데이터 (`ANIMALS` 상수)

각 동물은 성장 단계별 이모지 4개와 테마 컬러(hex)를 가진다. 이 컬러는 캐릭터 카드 배경 그라디언트, XP 바, 레벨 뱃지에 동적으로 적용된다.

| 동물 | 색상 | egg | baby | young | adult |
|---|---|---|---|---|---|
| 강아지 | `#F59E0B` | 🥚 | 🐶 | 🐕 | 🦮 |
| 고양이 | `#8B5CF6` | 🥚 | 🐱 | 😺 | 🐈‍⬛ |
| 토끼 | `#EC4899` | 🥚 | 🐰 | 🐇 | 🐇 |
| 여우 | `#F97316` | 🥚 | 🦊 | 🦊 | 🦊 |
| 곰 | `#6366F1` | 🥚 | 🐻 | 🐻 | 🐻‍❄️ |

---

## 7. 컴포넌트-스토어 의존성 매트릭스

| 파일 | `loadState` | `saveState` | `resetState` | `getStage` | `xpForLevel` | `ANIMALS` |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| `page.tsx` (로그인) | O | O | | | | |
| `select/page.tsx` | | O | | | | O |
| `home/page.tsx` | O | O | O | O | O | O |
| `alarm/page.tsx` | O | O | | | | |
| `sleep/page.tsx` | O | O | | O | | O |
| `ema/page.tsx` | O | O | | O | | O |
| `dashboard/page.tsx` | | | | | | |

`dashboard/page.tsx`는 `gameStore`를 전혀 사용하지 않으며 하드코딩된 더미 데이터만 렌더링한다.

---

## 8. 스타일링 전략

### Tailwind CSS v4

- `globals.css`에서 `@import "tailwindcss"`로 단일 임포트 사용 (v4 방식).
- `@theme inline` 블록으로 CSS 변수를 Tailwind 토큰에 연결한다.
- 별도의 `tailwind.config.js`가 없으며, PostCSS 플러그인(`@tailwindcss/postcss`)으로 처리된다.
- 유틸리티 클래스는 모두 JSX 인라인으로 작성하며, 조건부 스타일은 삼항 연산자로 클래스 문자열을 조합하는 패턴을 사용한다.

**`.mobile-frame` 패턴**: 모든 페이지의 최상위 div에 `mobile-frame` 클래스를 적용하여 `max-width: 430px`, `margin: 0 auto`로 모바일 폼팩터를 강제한다. 데스크톱에서도 스마트폰 화면처럼 렌더링된다.

### Framer Motion 12

- **진입 애니메이션**: 대부분의 카드/섹션에 `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}`를 적용하여 페이지 로드 시 아래에서 위로 페이드인된다.
- **페이지 전환**: `AnimatePresence` + `mode="wait"`로 phase 간 전환 시 exit 애니메이션이 완료된 후 enter 애니메이션이 시작된다 (sleep 페이지).
- **인터랙티브 피드백**: `whileTap={{ scale: 0.95~0.97 }}`을 버튼에 일관 적용하여 누를 때 시각적 반응을 제공한다.
- **반복 애니메이션**: 캐릭터 이모지는 `transition: { repeat: Infinity }`로 무한 부유 애니메이션이 적용된다.
- **물리 기반 제스처**: sleep 페이지의 Slide-to-Dismiss 핸들은 `drag="x"`, `dragConstraints`, `onDragEnd`로 구현되어 있다.

---

## 9. 배포 구조

### Vercel 자동 배포

별도의 `vercel.json` 설정 파일이 없으며, Vercel의 **Zero-Configuration** 방식으로 Next.js 앱을 자동 감지하여 배포한다.

```
GitHub 리포지토리 push
        │
        ▼
   Vercel 빌드 트리거
        │
   next build 실행
        │
   App Router 기반 서버리스 함수 생성
   (각 page.tsx → Edge/Serverless Function)
        │
        ▼
   글로벌 CDN 배포 (Vercel Edge Network)
```

**빌드 명령어**: `next build`  
**런타임**: Node.js 서버리스 + Vercel Edge Network  
**환경변수**: 현재 필요한 서버 사이드 환경변수 없음 (모든 상태는 클라이언트 `localStorage`)

**주의**: 모든 페이지가 `"use client"` 지시어를 사용하므로 서버 사이드 렌더링(SSR)에서는 `loadState()`가 `defaultState`를 반환하고, 클라이언트 하이드레이션 후 `useEffect`를 통해 실제 상태를 로딩하는 패턴이다. `layout.tsx`만 서버 컴포넌트로 유지된다.

---

## 10. 주요 기술 결정 사항 및 확장 고려점

| 현재 결정 | 배경 | 확장 시 고려사항 |
|---|---|---|
| `localStorage` 전용 상태 관리 | 백엔드 없는 데모 목적, 빠른 구현 | 실제 서비스 전환 시 Supabase/Firebase 등 원격 DB 연동 필요 |
| 글로벌 상태 관리 라이브러리 미사용 | 페이지 수가 적고 단방향 흐름이 명확 | 상태 공유 컴포넌트 증가 시 Zustand 도입 검토 |
| 더미 데이터 하드코딩 (dashboard) | VC 데모 용도 | REST API 또는 GraphQL 엔드포인트로 교체 필요 |
| `"use client"` 전면 적용 | localStorage 접근 필요 | 서버 컴포넌트 분리로 초기 번들 사이즈 최적화 가능 |
| 날짜 기반 패널티 자동화 미구현 | 데모 범위 외 | 서버 크론잡 또는 클라이언트 앱 재진입 시 날짜 비교 로직 추가 필요 |
