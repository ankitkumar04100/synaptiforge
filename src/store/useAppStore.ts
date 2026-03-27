import { create } from 'zustand';
import type { CognitiveSignature, Reflex, Suggestion, Patch, UserInfo } from '@/types';

interface AppState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  signature: CognitiveSignature | null;
  reflexes: Reflex[];
  suggestions: Suggestion[];
  patches: Patch[];
  provider: 'openai' | 'gemini';
  editorContent: string;
  editorLanguage: string;
  editorFilePath: string;
  predictiveEnabled: boolean;
  aggressiveness: number;
  sseConnected: boolean;
  hydrated: boolean;

  setAuthenticated: (v: boolean) => void;
  setUser: (u: UserInfo | null) => void;
  setSignature: (s: CognitiveSignature | null) => void;
  setReflexes: (r: Reflex[]) => void;
  setSuggestions: (s: Suggestion[]) => void;
  setPatches: (p: Patch[]) => void;
  setProvider: (p: 'openai' | 'gemini') => void;
  setEditorContent: (c: string) => void;
  setEditorLanguage: (l: string) => void;
  setEditorFilePath: (p: string) => void;
  setPredictiveEnabled: (v: boolean) => void;
  setAggressiveness: (v: number) => void;
  setSseConnected: (v: boolean) => void;
  setHydrated: (v: boolean) => void;

  addReflex: (r: Reflex) => void;
  toggleReflex: (id: string) => void;
  addSuggestion: (s: Suggestion) => void;
  addPatch: (p: Patch) => void;
  updatePatchStatus: (id: string, status: Patch['status'], prUrl?: string) => void;
  acceptSuggestion: (id: string) => void;
  dismissSuggestion: (id: string) => void;
  resetAll: () => void;
}

const initialState = {
  isAuthenticated: false,
  user: null,
  signature: null,
  reflexes: [] as Reflex[],
  suggestions: [] as Suggestion[],
  patches: [] as Patch[],
  provider: 'openai' as const,
  editorContent: `def process_user(user):\n    name = user.get("name")\n    email = user.get("email")\n    return {"name": name, "email": email}\n\ndef calculate_total(items):\n    total = 0\n    for i in range(len(items)):\n        total += items[i]["price"]\n    return total\n`,
  editorLanguage: 'python',
  editorFilePath: 'src/utils/process.py',
  predictiveEnabled: false,
  aggressiveness: 50,
  sseConnected: false,
  hydrated: false,
};

export const useAppStore = create<AppState>((set) => ({
  ...initialState,
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  setUser: (u) => set({ user: u }),
  setSignature: (s) => set({ signature: s }),
  setReflexes: (r) => set({ reflexes: r }),
  setSuggestions: (s) => set({ suggestions: s }),
  setPatches: (p) => set({ patches: p }),
  setProvider: (p) => set({ provider: p }),
  setEditorContent: (c) => set({ editorContent: c }),
  setEditorLanguage: (l) => set({ editorLanguage: l }),
  setEditorFilePath: (p) => set({ editorFilePath: p }),
  setPredictiveEnabled: (v) => set({ predictiveEnabled: v }),
  setAggressiveness: (v) => set({ aggressiveness: v }),
  setSseConnected: (v) => set({ sseConnected: v }),
  setHydrated: (v) => set({ hydrated: v }),
  addReflex: (r) => set((s) => ({ reflexes: [...s.reflexes, r] })),
  toggleReflex: (id) => set((s) => ({ reflexes: s.reflexes.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r) })),
  addSuggestion: (s) => set((st) => ({ suggestions: [...st.suggestions, s] })),
  addPatch: (p) => set((s) => ({ patches: [...s.patches, p] })),
  updatePatchStatus: (id, status, prUrl) => set((s) => ({ patches: s.patches.map((p) => p.id === id ? { ...p, status, prUrl: prUrl ?? p.prUrl } : p) })),
  acceptSuggestion: (id) => set((s) => ({ suggestions: s.suggestions.map((sg) => sg.id === id ? { ...sg, accepted: true } : sg) })),
  dismissSuggestion: (id) => set((s) => ({ suggestions: s.suggestions.map((sg) => sg.id === id ? { ...sg, accepted: false } : sg) })),
  resetAll: () => set(initialState),
}));
