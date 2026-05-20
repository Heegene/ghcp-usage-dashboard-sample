# GitHub Copilot 사용량 분석 대시보드

GitHub Copilot **유저 레벨** 사용 데이터(NDJSON)를 업로드하면, 개인별/기능별/언어별/모델별 메트릭을 자동으로 시각화하는 대시보드입니다.
GitHub [Engineering System Success Playbook (ESSP)](./2025-05-28-GitHub_ESSP_Playbook.pdf) 기반의 Leading Indicator도 함께 제공합니다.

> **English version follows below.**

## 주요 기능

| 메뉴 | 설명 |
|---|---|
| **개요** | 전체 유저 수, 인터랙션, 코드 생성, 수락률, LOC, Agent/Chat 채택률 등 Stat Cards |
| **유저별 활동** | 유저별 카드형 목록 — 검색, 정렬(ASC/DESC), Badge(Agent/Chat/언어) |
| **팀별 분석** | `user-teams-1-day`와 per-user 리포트를 조인한 팀별 비교/상세 분석 |
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

## 데이터 가져오기

### 1. 파일 업로드

기존처럼 per-user metrics NDJSON/JSON 파일을 업로드할 수 있습니다. 팀 단위 분석을 보려면 `user-teams-1-day` 리포트도 함께 업로드해야 합니다.

### 2. 브라우저에서 API로 가져오기

대시보드의 **API에서 가져오기** 탭에서 Enterprise 또는 Organization slug, 날짜 범위, GitHub token을 입력하면 다음 리포트를 자동으로 가져옵니다.

- `users-1-day`
- `user-teams-1-day`

이 기능은 Copilot Metrics API `apiVersion=2026-03-10`만 사용합니다. Token은 브라우저 메모리에서만 사용되며 저장하지 않습니다. Token은 GitHub API 호출에만 전송되고, signed report URL은 token 없이 다운로드합니다.

### 3. `gh` CLI helper로 가져오기

브라우저에 token을 입력하고 싶지 않다면, `gh auth login` 후 아래 명령으로 리포트를 생성할 수 있습니다.

```bash
npm run fetch:reports -- --enterprise <enterprise-slug> --from 2026-05-01 --to 2026-05-07 --out reports
```

Organization 범위는 다음처럼 실행합니다.

```bash
npm run fetch:reports -- --org <org> --from 2026-05-01 --to 2026-05-07 --out reports
```

생성된 `reports/copilot-users.ndjson`와 `reports/copilot-user-teams.ndjson` 파일을 대시보드에 업로드하면 됩니다.

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
│   │   ├── ApiImport.tsx            # Copilot Metrics API 가져오기
│   │   ├── FileUpload.tsx           # 파일 업로드 (드래그앤드롭)
│   │   ├── OverviewPage.tsx         # 개요 페이지
│   │   ├── TeamsPage.tsx            # 팀별 분석
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

## GitHub Pages 배포 설정

이 저장소는 Vite 정적 빌드를 GitHub Pages에 배포하도록 `.github/workflows/deploy.yml` 워크플로우를 사용합니다.

1. GitHub 저장소에서 **Settings → Pages**로 이동합니다.
2. **Build and deployment → Source**를 **GitHub Actions**로 선택합니다.
3. `main` 브랜치에 변경 사항을 push합니다.
4. Actions의 **Deploy to GitHub Pages** 워크플로우가 완료되면 다음 주소에서 확인합니다:

```text
https://heegene.github.io/ghcp-usage-dashboard-sample/
```

다른 저장소 이름으로 fork하거나 옮기는 경우, `vite.config.ts`의 `base` 값을 `/<repository-name>/` 형식으로 변경해야 합니다. 커스텀 도메인을 사용하는 경우에는 `base: '/'`로 설정하세요.

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
| **Team Analysis** | Team comparison and detail views by joining `user-teams-1-day` with per-user reports |
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

## Importing Data

### 1. File upload

You can upload per-user metrics NDJSON/JSON files as before. To enable team-level analysis, also upload the `user-teams-1-day` report.

### 2. Import from the browser

Use the **Import from API** tab to enter an Enterprise or Organization slug, date range, and GitHub token. The app automatically fetches:

- `users-1-day`
- `user-teams-1-day`

This uses only Copilot Metrics API `apiVersion=2026-03-10`. The token is used only in browser memory and is not stored. It is sent only to GitHub API; signed report URLs are downloaded without the token.

### 3. Import with the `gh` CLI helper

If you do not want to enter a token in the browser, run the helper after `gh auth login`.

```bash
npm run fetch:reports -- --enterprise <enterprise-slug> --from 2026-05-01 --to 2026-05-07 --out reports
```

For organization scope:

```bash
npm run fetch:reports -- --org <org> --from 2026-05-01 --to 2026-05-07 --out reports
```

Upload the generated `reports/copilot-users.ndjson` and `reports/copilot-user-teams.ndjson` files to the dashboard.

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
│   │   ├── ApiImport.tsx            # Copilot Metrics API import
│   │   ├── FileUpload.tsx           # File upload (drag & drop)
│   │   ├── OverviewPage.tsx         # Overview page
│   │   ├── TeamsPage.tsx            # Team analysis
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

## GitHub Pages Deployment

This repository uses the `.github/workflows/deploy.yml` workflow to deploy the Vite static build to GitHub Pages.

1. Go to **Settings → Pages** in the GitHub repository.
2. Set **Build and deployment → Source** to **GitHub Actions**.
3. Push changes to the `main` branch.
4. After the **Deploy to GitHub Pages** workflow completes, open:

```text
https://heegene.github.io/ghcp-usage-dashboard-sample/
```

If you fork or move the project to a different repository name, update `base` in `vite.config.ts` to `/<repository-name>/`. Use `base: '/'` when deploying with a custom domain.

## License

MIT
