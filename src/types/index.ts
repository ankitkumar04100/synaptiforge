export interface CognitiveSignature {
  id: string;
  version: number;
  updatedAt: string;
  traits: {
    naming: string;
    errorHandling: string;
    loopPatterns: string;
    testStyle: string;
    formatting: string;
    frameworkBias: string;
  };
  summary: string;
}

export interface Reflex {
  id: string;
  triggerPattern: string;
  transformation: string;
  confidence: number;
  enabled: boolean;
  examples: string[];
  createdAt: string;
}

export interface Suggestion {
  id: string;
  filePath: string;
  suggestionText: string;
  codePatch: string;
  explanation: string;
  accepted: boolean | null;
  createdAt: string;
}

export interface Patch {
  id: string;
  filePath: string;
  diff: string;
  explanation: string;
  status: 'pending' | 'applied' | 'pr_opened';
  prUrl?: string;
  createdAt: string;
}

export interface AppSettings {
  provider: 'openai' | 'gemini';
  telemetryOptIn: boolean;
  demoMode: boolean;
}

export interface UserInfo {
  id: string;
  name: string;
  avatar: string;
  provider: 'github' | 'guest';
}
