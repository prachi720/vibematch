export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  experience_level: ExperienceLevel;
  preferences: Record<string, unknown>;
  profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  category: string;
}

export interface ProfileSkill {
  id: string;
  profile_id: string;
  skill_id: string;
  proficiency: number;
  skill?: Skill;
}

export interface Team {
  id: string;
  name: string;
  owner_id: string;
  created_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  team_id: string | null;
  title: string;
  description: string;
  target_users: string;
  tech_approach: string;
  created_at: string;
  updated_at: string;
}

export type ModuleType =
  | 'skill_analysis'
  | 'team_builder'
  | 'project_validation'
  | 'architecture'
  | 'roadmap'
  | 'feature_prioritization'
  | 'pitch'
  | 'judge_session'
  | 'documentation';

export interface AIOutput {
  id: string;
  user_id: string;
  project_id: string | null;
  module_type: ModuleType;
  input_payload: Record<string, unknown>;
  output_payload: Record<string, unknown>;
  provider: string;
  model: string;
  regeneration_count: number;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'dark' | 'light';
  ai_api_key: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillAnalysisResult {
  strengths: { skill: string; note: string }[];
  gaps: { area: string; note: string }[];
  growthAreas: { area: string; suggestion: string }[];
  radarData: { skill: string; level: number }[];
  summary: string;
}

export interface TeamSuggestion {
  name: string;
  role: string;
  skills: string[];
  matchReason: string;
  complementScore: number;
}

export interface TeamBuilderResult {
  suggestions: TeamSuggestion[];
  reasoning: string;
  summary: string;
}

export interface ValidationResult {
  feasibility: { score: number; note: string };
  originality: { score: number; note: string };
  scope: { score: number; note: string };
  risks: string[];
  suggestions: string[];
  summary: string;
}

export interface ArchitectureResult {
  frontend: string;
  backend: string;
  database: string;
  deployment: string;
  diagram: { layer: string; components: string[] }[];
  summary: string;
}

export interface RoadmapResult {
  milestones: {
    title: string;
    description: string;
    effort: string;
    dependencies: string[];
    phase: number;
  }[];
  summary: string;
}

export interface FeaturePrioritizationResult {
  features: {
    name: string;
    priority: 'must' | 'should' | 'could' | 'wont';
    impact: number;
    effort: number;
    note: string;
  }[];
  summary: string;
}

export interface PitchResult {
  sections: { title: string; content: string }[];
  summary: string;
}

export interface JudgeResult {
  scores: { criterion: string; score: number; maxScore: number; note: string }[];
  overallScore: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
  persona: string;
}

export interface DocumentationResult {
  markdown: string;
  sections: { title: string; content: string }[];
}
