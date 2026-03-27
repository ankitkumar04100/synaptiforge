import type { CognitiveSignature, Reflex, Suggestion, Patch, AppSettings } from '@/types';

export const seedSignature: CognitiveSignature = {
  id: 'sig-1',
  version: 3,
  updatedAt: new Date().toISOString(),
  traits: {
    naming: 'snake_case for variables, PascalCase for classes; descriptive names preferred',
    errorHandling: 'Defensive: try/except with specific exceptions, early returns for guard clauses',
    loopPatterns: 'List comprehensions over explicit loops; enumerate() preferred over index tracking',
    testStyle: 'pytest with fixtures; arrange-act-assert pattern; descriptive test names',
    formatting: 'Black-compliant, 88 char lines, trailing commas in multi-line structures',
    frameworkBias: 'FastAPI for APIs, React+TypeScript for frontend; prefers functional components',
  },
  summary: 'A clean, defensive Python developer who favors readability and explicit error handling. Prefers modern idioms (comprehensions, f-strings, type hints) and follows PEP 8 conventions.',
};

export const seedReflexes: Reflex[] = [
  {
    id: 'ref-1',
    triggerPattern: 'if x == None',
    transformation: 'Replace with `if x is None` (PEP 8 identity check)',
    confidence: 0.92,
    enabled: true,
    examples: ['if user == None → if user is None', 'if result == None → if result is None'],
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'ref-2',
    triggerPattern: 'for i in range(len(items))',
    transformation: 'Replace with `for i, item in enumerate(items)`',
    confidence: 0.85,
    enabled: true,
    examples: ['for i in range(len(users)): users[i] → for i, user in enumerate(users): user'],
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'ref-3',
    triggerPattern: 'except Exception:',
    transformation: 'Use specific exception types instead of bare Exception',
    confidence: 0.65,
    enabled: false,
    examples: ['except Exception → except ValueError', 'except Exception as e → except (KeyError, TypeError) as e'],
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

export const seedSuggestions: Suggestion[] = [
  {
    id: 'sug-1',
    filePath: 'src/utils/process.py',
    suggestionText: 'Add None guard for user parameter',
    codePatch: `--- a/src/utils/process.py\n+++ b/src/utils/process.py\n@@ -1,5 +1,7 @@\n def process_user(user):\n+    if user is None:\n+        raise ValueError("user cannot be None")\n     name = user.get("name")\n     email = user.get("email")\n     return {"name": name, "email": email}`,
    explanation: 'Adding a None guard at the top of process_user prevents AttributeError when None is passed. This aligns with your defensive coding style.',
    accepted: null,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const seedPatches: Patch[] = [
  {
    id: 'patch-1',
    filePath: 'src/utils/calculate.py',
    diff: `--- a/src/utils/calculate.py\n+++ b/src/utils/calculate.py\n@@ -1,4 +1,6 @@\n def calculate_total(items):\n+    if not items:\n+        return 0\n     total = 0\n     for item in items:\n         total += item["price"]`,
    explanation: 'Added empty list guard to prevent iteration over None/empty collections. Returns 0 as a safe default.',
    status: 'pending',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

export const seedSettings: AppSettings = {
  provider: 'openai',
  telemetryOptIn: false,
  demoMode: true,
};
