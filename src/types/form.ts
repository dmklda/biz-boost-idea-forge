
export interface FormData {
  idea: string;
  audience: string;
  problem: string;
  hasCompetitors: string;
  monetization: string;
  budget: number;
  location: string;
  language?: string; // Add language field for i18n support
}

export type FormStep = 1 | 2 | 3 | 4;
