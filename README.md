# GitHub Copilot 사용량 분석 대시보드

GitHub Copilot **유저 레벨** 사용 데이터(NDJSON)를 업로드하면, 개인별/기능별/언어별/모델별 메트릭을 자동으로 시각화하는 대시보드입니다.
GitHub [Engineering System Success Playbook (ESSP)](./2025-05-28-GitHub_ESSP_Playbook.pdf) 기반의 Leading Indicator도 함께 제공합니다.

> **English version follows below.**

## 주요 기능

| 메뉴 | 설명 |
|---|---|
| **개요** | 전체 유저 수, 인터랙션, 코드 생성, 수락률, LOC, Agent/Chat 채택률 등 Stat Cards |
| **유저별 활동** | 유저별 카드형 목록 — 검색, 정렬(ASC/DESC), Badge(Agent/Chat/언어) |
| **기능 채택** | code_completion, agent_mode, chat 등 기능별 유저 수/코드 생성/LOC 차트 |
| **언어 & IDE** | 프로그래밍 언어별 + IDE별 탭 전환 차트 (바 위 숫자 표시) |
| **모델 사용** | AI 모델별(정확한 버전명) 유저 분포 Pie + 코드 생성 Bar |
| **ESSP 인사이트** | ESSP 4개 Zone × 8개 Leading Indicator + 계산식 + 근거. Activation Rate(선택) |
| **추세 분석** | 일별 시계열 Area/Line 차트 — 메트릭 선택 가능 |

## 추가 기능

- **한국어/영어 전환** — 헤더 우측 Globe 버튼
- **날짜 범위 필터** — 좌측 사이드바 하단 Date Picker
- **Activation Rate** — ESSP 페이지에서 라이선스 수 입력 시에만 계산 (선택 항목)

## 데이터 형식

GitHub Copilot User Metrics API에서 내보낸 **NDJSON** 파일 (한 줄 = 한 유저의 하루 활동):

```json
{"day":"2026-02-25","user_login":"alice","code_generation_activity_count":65,...}
```

주요 필드: `user_login`, `day`, `user_initiated_interaction_count`, `code_generation_activity_count`, `code_acceptance_activity_count`, `loc_added_sum`, `used_agent`, `used_chat`, `totals_by_feature[]`, `totals_by_ide[]`, `totals_by_language_feature[]`, `totals_by_language_model[]`

## 기술 스택

- **React 19** + **TypeScript**
- **Vite** (빌드)
- **Tailwind CSS 4** (스타일)
- **Recharts** (차트)
- **shadcn/ui** (컴포넌트)
- **Framer Motion** (애니메이션)

## 프로젝트 구조

```
src/
├── App.tsx                          # 메인 레이아웃 (사이드바 + 라우팅)
├── main.tsx                         # 엔트리포인트 (I18nProvider)
├── lib/
│   ├── types.ts                     # 유저 레벨 데이터 타입 정의
│   ├── metrics.ts                   # NDJSON 파싱 + 집계 로직
│   ├── i18n.tsx                     # 한국어/영어 번역 시스템
│   └── utils.ts                     # 유틸리티
├── components/
│   ├── dashboard/
│   │   ├── FileUpload.tsx           # 파일 업로드 (드래그앤드롭)
│   │   ├── OverviewPage.tsx         # 개요 페이지
│   │   ├── UsersPage.tsx            # 유저별 활동
│   │   ├── FeaturesPage.tsx         # 기능 채택
│   │   ├── LanguagesPage.tsx        # 언어 & IDE
│   │   ├── ModelsPage.tsx           # 모델 사용
│   │   ├── EsspPage.tsx             # ESSP 인사이트
│   │   └── TrendPage.tsx            # 추세 분석
│   └── ui/                          # shadcn/ui 컴포넌트
└── styles/
    └── theme.css                    # 테마 변수
```

## 실행 방법

```bash
npm install
npm run dev
```

## 라이선스

MIT

---

# English Version

# GitHub Copilot Usage Analytics Dashboard

Upload GitHub Copilot **user-level** usage data (NDJSON) to automatically visualize per-user, per-feature, per-language, and per-model metrics.
Also provides Leading Indicators based on the GitHub [Engineering System Success Playbook (ESSP)](./2025-05-28-GitHub_ESSP_Playbook.pdf).

## Key Features

| Page | Description |
|---|---|
| **Overview** | Stat cards: total users, interactions, code generations, acceptance rate, LOC, Agent/Chat adoption |
| **User Activity** | Per-user card list with search, sort (ASC/DESC), badges (Agent/Chat/languages) |
| **Feature Adoption** | Charts by feature (code_completion, agent_mode, chat, etc.) — user count, code gen, LOC |
| **Language & IDE** | Tab-switched charts by programming language and IDE (with bar value labels) |
| **Model Usage** | Per-model (exact version names) user distribution pie + code gen bar |
| **ESSP Insights** | 4 ESSP Zones × 8 Leading Indicators with formulas + rationale. Optional Activation Rate |
| **Trend Analysis** | Daily time-series area/line charts with metric selector |

## Additional Features

- **Korean/English toggle** — Globe button in header
- **Date range filter** — Date picker in left sidebar
- **Activation Rate** — Calculated only when license count is entered (optional)

## Data Format

NDJSON file exported from the GitHub Copilot User Metrics API (one line = one user's daily activity):

```json
{"day":"2026-02-25","user_login":"alice","code_generation_activity_count":65,...}
```

Key fields: `user_login`, `day`, `user_initiated_interaction_count`, `code_generation_activity_count`, `code_acceptance_activity_count`, `loc_added_sum`, `used_agent`, `used_chat`, `totals_by_feature[]`, `totals_by_ide[]`, `totals_by_language_feature[]`, `totals_by_language_model[]`

## Tech Stack

- **React 19** + **TypeScript**
- **Vite** (build)
- **Tailwind CSS 4** (styling)
- **Recharts** (charts)
- **shadcn/ui** (components)
- **Framer Motion** (animations)

## Project Structure

```
src/
├── App.tsx                          # Main layout (sidebar + routing)
├── main.tsx                         # Entry point (I18nProvider)
├── lib/
│   ├── types.ts                     # User-level data type definitions
│   ├── metrics.ts                   # NDJSON parsing + aggregation logic
│   ├── i18n.tsx                     # Korean/English translation system
│   └── utils.ts                     # Utilities
├── components/
│   ├── dashboard/
│   │   ├── FileUpload.tsx           # File upload (drag & drop)
│   │   ├── OverviewPage.tsx         # Overview page
│   │   ├── UsersPage.tsx            # User activity
│   │   ├── FeaturesPage.tsx         # Feature adoption
│   │   ├── LanguagesPage.tsx        # Language & IDE
│   │   ├── ModelsPage.tsx           # Model usage
│   │   ├── EsspPage.tsx             # ESSP insights
│   │   └── TrendPage.tsx            # Trend analysis
│   └── ui/                          # shadcn/ui components
└── styles/
    └── theme.css                    # Theme variables
```

## Getting Started

```bash
npm install
npm run dev
```

## License

MIT