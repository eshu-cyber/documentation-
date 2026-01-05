
export type ProgrammingLanguage = 'python' | 'javascript' | 'typescript' | 'java' | 'cpp' | 'go' | 'unknown';

export interface FileContent {
  id: string;
  name: string;
  path: string;
  content: string;
  language: ProgrammingLanguage;
  analysis?: AnalysisResult;
  documentation?: string;
  isProcessing?: boolean;
}

export interface AnalysisResult {
  functions: string[];
  classes: string[];
  complexity: 'Low' | 'Medium' | 'High';
  warnings: string[];
  suggestions: string[];
}

export interface ProjectDoc {
  readme: string;
  changelog: string;
}

export enum AppView {
  WELCOME = 'WELCOME',
  EDITOR = 'EDITOR',
  PROJECT_DOCS = 'PROJECT_DOCS'
}
