// ============================================================
// User-level GitHub Copilot Usage Types
// ============================================================

export interface UserDayRecord {
  report_start_day: string;
  report_end_day: string;
  day: string;
  organization_id: string;
  enterprise_id: string;
  user_id: number;
  user_login: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
  used_agent: boolean;
  used_chat: boolean;
  totals_by_ide: IdeTotal[];
  totals_by_feature: FeatureTotal[];
  totals_by_language_feature: LanguageFeatureTotal[];
  totals_by_language_model: LanguageModelTotal[];
  totals_by_model_feature: ModelFeatureTotal[];
}

export interface IdeTotal {
  ide: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
}

export interface FeatureTotal {
  feature: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
}

export interface LanguageFeatureTotal {
  language: string;
  feature: string;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
}

export interface LanguageModelTotal {
  language: string;
  model: string;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
}

export interface ModelFeatureTotal {
  model: string;
  feature: string;
  user_initiated_interaction_count: number;
  code_generation_activity_count: number;
  code_acceptance_activity_count: number;
  loc_suggested_to_add_sum: number;
  loc_suggested_to_delete_sum: number;
  loc_added_sum: number;
  loc_deleted_sum: number;
}

// ============================================================
// Aggregated types for dashboard
// ============================================================

export interface ProcessedData {
  raw: UserDayRecord[];
  dateRange: { start: string; end: string };
  allDates: string[];
  allUsers: string[];
  summary: DashboardSummary;
  userSummaries: UserSummary[];
  dailyTotals: DailyTotal[];
  featureBreakdown: FeatureBreakdown[];
  languageBreakdown: LanguageStat[];
  ideBreakdown: IdeStat[];
  modelBreakdown: ModelStat[];
}

export interface DashboardSummary {
  totalUsers: number;
  totalDays: number;
  totalInteractions: number;
  totalCodeGenerations: number;
  totalCodeAcceptances: number;
  totalLocSuggested: number;
  totalLocAdded: number;
  totalLocDeleted: number;
  acceptanceRate: number;
  agentAdoptionRate: number;
  chatAdoptionRate: number;
  avgInteractionsPerUser: number;
  avgCodeGenPerUser: number;
  avgLocAddedPerUser: number;
}

export interface UserSummary {
  userLogin: string;
  userId: number;
  daysActive: number;
  totalInteractions: number;
  totalCodeGenerations: number;
  totalCodeAcceptances: number;
  acceptanceRate: number;
  totalLocSuggested: number;
  totalLocAdded: number;
  totalLocDeleted: number;
  usedAgent: boolean;
  usedChat: boolean;
  featuresUsed: string[];
  idesUsed: string[];
  languagesUsed: string[];
  modelsUsed: string[];
  featureBreadth: number;
}

export interface DailyTotal {
  date: string;
  activeUsers: number;
  totalInteractions: number;
  totalCodeGenerations: number;
  totalCodeAcceptances: number;
  acceptanceRate: number;
  totalLocSuggested: number;
  totalLocAdded: number;
}

export interface FeatureBreakdown {
  feature: string;
  userCount: number;
  totalInteractions: number;
  totalCodeGenerations: number;
  totalCodeAcceptances: number;
  totalLocAdded: number;
}

export interface LanguageStat {
  language: string;
  totalCodeGenerations: number;
  totalCodeAcceptances: number;
  acceptanceRate: number;
  totalLocSuggested: number;
  totalLocAdded: number;
}

export interface IdeStat {
  ide: string;
  userCount: number;
  totalInteractions: number;
  totalCodeGenerations: number;
  totalCodeAcceptances: number;
  totalLocAdded: number;
}

export interface ModelStat {
  model: string;
  userCount: number;
  totalCodeGenerations: number;
  totalCodeAcceptances: number;
  totalLocAdded: number;
}

export type PageId = 'overview' | 'users' | 'features' | 'languages' | 'models' | 'essp' | 'trend';