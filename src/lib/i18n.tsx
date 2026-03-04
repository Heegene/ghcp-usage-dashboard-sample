import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'ko' | 'en';

const translations = {
  // Header
  'app.title': { ko: 'Copilot 사용 분석', en: 'Copilot Usage Analytics' },
  'app.subtitle': { ko: '유저 레벨 대시보드', en: 'User-Level Dashboard' },
  'app.days_of_data': { ko: '일간 데이터', en: 'days of data' },
  'app.users': { ko: '명', en: 'users' },
  'app.clear': { ko: '초기화', en: 'Clear' },

  // Upload
  'upload.title': { ko: 'Copilot 사용량 분석', en: 'Analyze Copilot Usage' },
  'upload.desc': { ko: 'GitHub Copilot 유저별 사용량 NDJSON 파일을 업로드하여 개인별 메트릭을 시각화합니다.', en: 'Upload your GitHub Copilot user-level usage NDJSON file to visualize individual metrics.' },
  'upload.drop': { ko: 'NDJSON 파일을 드래그하거나 클릭하여 업로드', en: 'Drag & drop NDJSON file or click to upload' },
  'upload.formats': { ko: '지원 형식: .ndjson, .json, .jsonl', en: 'Supported: .ndjson, .json, .jsonl' },
  'upload.how': { ko: '메트릭 파일 가져오는 방법', en: 'How to get your metrics' },
  'upload.step1': { ko: 'GitHub 조직 설정으로 이동', en: 'Go to your GitHub organization settings' },
  'upload.step2': { ko: 'Copilot → Usage 탭 이동', en: 'Navigate to Copilot → Usage' },
  'upload.step3': { ko: 'NDJSON 형식으로 내보내기', en: 'Export the usage data as NDJSON' },
  'upload.step4': { ko: '여기에 파일 업로드', en: 'Upload the file here' },
  'upload.success': { ko: '메트릭 로드 성공!', en: 'Metrics loaded successfully!' },
  'upload.error': { ko: '파일 파싱 실패. 형식을 확인해주세요.', en: 'Failed to parse metrics data.' },
  'upload.no_data': { ko: '유효한 메트릭 없음. 콘솔을 확인하세요.', en: 'No valid metrics found.' },
  'app.cleared': { ko: '대시보드 초기화됨', en: 'Dashboard cleared' },

  // Sidebar nav
  'nav.overview': { ko: '개요', en: 'Overview' },
  'nav.users': { ko: '유저별 활동', en: 'User Activity' },
  'nav.features': { ko: '기능 채택', en: 'Feature Adoption' },
  'nav.languages': { ko: '언어 & IDE', en: 'Language & IDE' },
  'nav.models': { ko: '모델 사용', en: 'Model Usage' },
  'nav.essp': { ko: 'ESSP 인사이트', en: 'ESSP Insights' },
  'nav.trend': { ko: '추세 분석', en: 'Trend Analysis' },

  // Overview
  'overview.title': { ko: '대시보드 개요', en: 'Dashboard Overview' },
  'overview.total_users': { ko: '전체 유저', en: 'Total Users' },
  'overview.total_interactions': { ko: '전체 인터랙션', en: 'Total Interactions' },
  'overview.code_generations': { ko: '코드 생성', en: 'Code Generations' },
  'overview.acceptance_rate': { ko: '수락률', en: 'Acceptance Rate' },
  'overview.loc_added': { ko: '추가된 LOC', en: 'LOC Added' },
  'overview.agent_adoption': { ko: 'Agent 채택률', en: 'Agent Adoption' },
  'overview.chat_adoption': { ko: 'Chat 채택률', en: 'Chat Adoption' },
  'overview.avg_interactions': { ko: '유저당 평균 인터랙션', en: 'Avg Interactions/User' },
  'overview.avg_codegen': { ko: '유저당 평균 코드 생성', en: 'Avg Code Gen/User' },
  'overview.avg_loc': { ko: '유저당 평균 LOC 추가', en: 'Avg LOC Added/User' },
  'overview.per_day': { ko: '/일', en: '/day' },

  // Users
  'users.title': { ko: '유저별 활동', en: 'User Activity' },
  'users.search': { ko: '유저 검색...', en: 'Search users...' },
  'users.login': { ko: '유저', en: 'User' },
  'users.days_active': { ko: '활동 일수', en: 'Days Active' },
  'users.interactions': { ko: '인터랙션', en: 'Interactions' },
  'users.code_gen': { ko: '코드 생성', en: 'Code Gen' },
  'users.acceptance': { ko: '수락', en: 'Acceptance' },
  'users.acceptance_rate': { ko: '수락률', en: 'Rate' },
  'users.loc_added': { ko: 'LOC 추가', en: 'LOC Added' },
  'users.agent': { ko: 'Agent', en: 'Agent' },
  'users.chat': { ko: 'Chat', en: 'Chat' },
  'users.features': { ko: '기능 수', en: 'Features' },
  'users.sort_by': { ko: '정렬 기준', en: 'Sort by' },

  // Features
  'features.title': { ko: '기능별 채택 현황', en: 'Feature Adoption' },
  'features.name': { ko: '기능', en: 'Feature' },
  'features.user_count': { ko: '사용 유저 수', en: 'User Count' },
  'features.interactions': { ko: '인터랙션', en: 'Interactions' },
  'features.code_gen': { ko: '코드 생성', en: 'Code Gen' },
  'features.loc_added': { ko: 'LOC 추가', en: 'LOC Added' },

  // Languages
  'languages.title': { ko: '언어 & IDE 분석', en: 'Language & IDE Analysis' },
  'languages.tab_lang': { ko: '프로그래밍 언어', en: 'Languages' },
  'languages.tab_ide': { ko: 'IDE', en: 'IDE' },
  'languages.name': { ko: '언어', en: 'Language' },
  'languages.ide_name': { ko: 'IDE', en: 'IDE' },

  // Models
  'models.title': { ko: 'AI 모델 사용 분석', en: 'AI Model Usage' },
  'models.name': { ko: '모델', en: 'Model' },

  // ESSP
  'essp.title': { ko: 'ESSP 인사이트', en: 'ESSP Insights' },
  'essp.subtitle': { ko: 'GitHub Engineering System Success Playbook 기반 Leading Indicator', en: 'Leading Indicators based on GitHub ESSP' },
  'essp.warning': { ko: '⚠️ ESSP(p.7): "유저 레벨 메트릭은 개별 개발자를 평가하는 데 사용해서는 안 됩니다. 팀과 조직 수준에서의 분석에 집중하세요."', en: '⚠️ ESSP(p.7): "User-level metrics should not be used to single out developers. Focus on teams and organizations."' },
  'essp.zone': { ko: 'Zone', en: 'Zone' },
  'essp.metric': { ko: '메트릭', en: 'Metric' },
  'essp.value': { ko: '값', en: 'Value' },
  'essp.description': { ko: '설명', en: 'Description' },
  'essp.rationale': { ko: '근거', en: 'Rationale' },
  'essp.activation_rate': { ko: 'Activation Rate (활성화율)', en: 'Activation Rate' },
  'essp.activation_desc': { ko: '전체 라이선스 대비 활동 유저 비율', en: 'Active users / Total licenses' },
  'essp.activation_rationale': { ko: 'ESSP(p.11): "AI Leverage — 잠재적 AI 생산성 이익과 현재 실현 이익의 차이를 계산"', en: 'ESSP(p.11): "AI Leverage — calculating the difference between potential and current AI-driven productivity gains"' },
  'essp.license_input': { ko: '전체 라이선스 수 입력', en: 'Enter total license count' },
  'essp.license_placeholder': { ko: '라이선스 수', en: 'License count' },
  'essp.not_configured': { ko: '라이선스 수 미입력', en: 'License count not set' },
  'essp.engagement_rate': { ko: 'Engagement Rate (참여율)', en: 'Engagement Rate' },
  'essp.engagement_desc': { ko: '활동 유저 중 코드 생성/수락이 있는 유저 비율', en: 'Users with code generation/acceptance among active users' },
  'essp.engagement_rationale': { ko: 'ESSP(p.11): AI Leverage의 "현재 AI에 engaged된 직원" 수 측정', en: 'ESSP(p.11): Measuring "total staff currently engaged with AI"' },
  'essp.feature_breadth': { ko: 'Feature Breadth (기능 활용 폭)', en: 'Feature Breadth' },
  'essp.feature_breadth_desc': { ko: '유저당 평균 사용 기능 수', en: 'Average number of features used per user' },
  'essp.feature_breadth_rationale': { ko: 'ESSP(p.5): SPACE의 Activity 차원 — 측정 가능한 개발 활동의 다양성', en: 'ESSP(p.5): SPACE Activity dimension — diversity of measurable dev actions' },
  'essp.agent_adoption': { ko: 'Agent Mode 채택률', en: 'Agent Mode Adoption' },
  'essp.agent_desc': { ko: 'Agent 모드를 사용한 유저 비율', en: 'Percentage of users using Agent mode' },
  'essp.agent_rationale': { ko: 'ESSP(p.27): "Leading indicator로서 Copilot 성공 지표(Metrics API)" — Agent는 최신 AI 기능', en: 'ESSP(p.27): "Leading indicators of Copilot success" — Agent is the latest AI capability' },
  'essp.code_velocity': { ko: 'Code Velocity (코드 속도)', en: 'Code Velocity' },
  'essp.code_velocity_desc': { ko: '유저당 일평균 추가 LOC', en: 'Average LOC added per user per day' },
  'essp.code_velocity_rationale': { ko: 'ESSP(p.9): "PRs merged per developer" — LOC 생산량은 Velocity zone의 proxy 지표', en: 'ESSP(p.9): "PRs merged per developer" — LOC production as proxy for Velocity zone' },
  'essp.acceptance_efficiency': { ko: 'Acceptance Efficiency (수락 효율)', en: 'Acceptance Efficiency' },
  'essp.acceptance_desc': { ko: '코드 생성 대비 수락 비율', en: 'Code acceptance vs generation ratio' },
  'essp.acceptance_rationale': { ko: 'ESSP(p.8): Quality zone의 leading indicator — 높은 수락률은 제안 적합성 반영', en: 'ESSP(p.8): Quality zone leading indicator — high acceptance reflects suggestion relevance' },
  'essp.chat_usage': { ko: 'Chat 사용률', en: 'Chat Usage Rate' },
  'essp.chat_desc': { ko: 'Chat 기능을 사용한 유저 비율', en: 'Percentage of users using Chat' },
  'essp.chat_rationale': { ko: 'ESSP(p.10): Developer Happiness의 "Tooling Satisfaction" — Chat은 복잡한 문제 해결에 AI 활용하는 성숙도 지표', en: 'ESSP(p.10): Developer Happiness "Tooling Satisfaction" — Chat usage indicates AI maturity' },
  'essp.power_users': { ko: 'Power User 비율', en: 'Power User Ratio' },
  'essp.power_desc': { ko: '상위 20% 활동량 유저', en: 'Top 20% users by activity' },
  'essp.power_rationale': { ko: 'ESSP(p.14): "이해관계자와 함께 어떤 zone이 가장 중요한지 파악" — Power user 식별은 확산 전략의 핵심', en: 'ESSP(p.14): "Clarify which zones are most critical" — identifying power users is key to scaling' },
  'essp.interaction_intensity': { ko: '인터랙션 강도', en: 'Interaction Intensity' },
  'essp.interaction_desc': { ko: '유저당 일평균 인터랙션 수', en: 'Average interactions per user per day' },
  'essp.interaction_rationale': { ko: 'ESSP(p.10): "Flow State Experience" — 높은 인터랙션은 도구 신뢰도 및 flow 상태 반영', en: 'ESSP(p.10): "Flow State Experience" — high interactions reflect tool trust and flow state' },
  'essp.business_outcome': { ko: 'Business Outcome', en: 'Business Outcome' },
  'essp.velocity': { ko: 'Velocity', en: 'Velocity' },
  'essp.quality': { ko: 'Quality', en: 'Quality' },
  'essp.dev_happiness': { ko: 'Developer Happiness', en: 'Developer Happiness' },

  // Trend
  'trend.title': { ko: '추세 분석', en: 'Trend Analysis' },
  'trend.metric_select': { ko: '메트릭 선택', en: 'Select Metric' },
  'trend.active_users': { ko: '활성 유저 수', en: 'Active Users' },
  'trend.interactions': { ko: '인터랙션', en: 'Interactions' },
  'trend.code_gen': { ko: '코드 생성', en: 'Code Generations' },
  'trend.acceptance_rate': { ko: '수락률', en: 'Acceptance Rate' },
  'trend.loc_added': { ko: 'LOC 추가', en: 'LOC Added' },

  // Date filter
  'filter.date_range': { ko: '기간 선택', en: 'Date Range' },
  'filter.all': { ko: '전체', en: 'All' },
  'filter.from': { ko: '시작일', en: 'From' },
  'filter.to': { ko: '종료일', en: 'To' },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'ko',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ko');

  const t = useCallback((key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.ko || key;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
