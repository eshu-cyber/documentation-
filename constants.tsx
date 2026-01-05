
import React from 'react';
import { ProgrammingLanguage } from './types';

export const LANGUAGE_MAP: Record<string, ProgrammingLanguage> = {
  '.py': 'python',
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.java': 'java',
  '.cpp': 'cpp',
  '.h': 'cpp',
  '.hpp': 'cpp',
  '.cc': 'cpp',
  '.go': 'go'
};

export const detectLanguage = (fileName: string): ProgrammingLanguage => {
  const ext = fileName.slice(((fileName.lastIndexOf(".") - 1) >>> 0) + 2);
  return LANGUAGE_MAP[`.${ext.toLowerCase()}`] || 'unknown';
};

export const getDocumentationStyle = (lang: ProgrammingLanguage): string => {
  switch (lang) {
    case 'python': return 'PEP 257 (Sphinx style)';
    case 'javascript':
    case 'typescript': return 'JSDoc';
    case 'java': return 'JavaDoc';
    case 'cpp': return 'Doxygen';
    case 'go': return 'GoDoc';
    default: return 'Generic Markdown';
  }
};
