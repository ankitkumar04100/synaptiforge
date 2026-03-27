export function redactSecrets(text: string): string {
  return text
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, 'sk-***REDACTED***')
    .replace(/ghp_[A-Za-z0-9]{36}/g, 'ghp_***REDACTED***')
    .replace(/gho_[A-Za-z0-9]{36}/g, 'gho_***REDACTED***')
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, '***JWT_REDACTED***')
    .replace(/AKIA[A-Z0-9]{16}/g, '***AWS_KEY_REDACTED***')
    .replace(/AIza[A-Za-z0-9_-]{35}/g, '***GOOGLE_KEY_REDACTED***')
    .replace(/(password|secret|token|apikey|api_key)\s*[=:]\s*["']?[^\s"']{4,}/gi, '$1=***REDACTED***');
}

export function applyUnifiedDiff(original: string, diff: string): { result: string; success: boolean; error?: string } {
  try {
    const lines = original.split('\n');
    const diffLines = diff.split('\n');
    const hunks: Array<{ startLine: number; removals: string[]; additions: string[] }> = [];

    let i = 0;
    // Skip header lines
    while (i < diffLines.length && !diffLines[i].startsWith('@@')) i++;

    while (i < diffLines.length) {
      const hunkMatch = diffLines[i].match(/@@ -(\d+)/);
      if (!hunkMatch) { i++; continue; }
      const startLine = parseInt(hunkMatch[1], 10) - 1;
      const removals: string[] = [];
      const additions: string[] = [];
      i++;

      while (i < diffLines.length && !diffLines[i].startsWith('@@')) {
        const line = diffLines[i];
        if (line.startsWith('-')) removals.push(line.slice(1));
        else if (line.startsWith('+')) additions.push(line.slice(1));
        i++;
      }
      hunks.push({ startLine, removals, additions });
    }

    // Apply hunks in reverse order
    const result = [...lines];
    for (const hunk of hunks.reverse()) {
      const { startLine, removals, additions } = hunk;
      // Find matching position (soft sync)
      let pos = startLine;
      if (removals.length > 0) {
        let found = false;
        for (let offset = 0; offset <= 5; offset++) {
          for (const dir of [0, 1, -1]) {
            const testPos = pos + offset * dir;
            if (testPos >= 0 && testPos < result.length) {
              const match = removals.every((r, ri) => result[testPos + ri]?.trimEnd() === r.trimEnd());
              if (match) { pos = testPos; found = true; break; }
            }
          }
          if (found) break;
        }
        result.splice(pos, removals.length, ...additions);
      } else {
        result.splice(pos, 0, ...additions);
      }
    }

    return { result: result.join('\n'), success: true };
  } catch (e) {
    return { result: original, success: false, error: (e as Error).message };
  }
}

export function generateHeuristicSuggestion(code: string, language: string) {
  const lines = code.split('\n');
  const patches: string[] = [];
  const explanations: string[] = [];

  // Python heuristics
  if (language === 'python') {
    lines.forEach((line, i) => {
      if (line.includes('== None')) {
        patches.push(`@@ -${i + 1},1 +${i + 1},1 @@\n-${line}\n+${line.replace('== None', 'is None')}`);
        explanations.push('Use `is None` instead of `== None` (PEP 8)');
      }
      if (line.match(/for \w+ in range\(len\(/)) {
        explanations.push('Consider using enumerate() instead of range(len())');
      }
    });
  }

  // Check for missing None guards on function defs
  for (let i = 0; i < lines.length; i++) {
    const defMatch = lines[i].match(/def\s+(\w+)\((\w+)/);
    if (defMatch && i + 1 < lines.length && !lines[i + 1].includes('if') && !lines[i + 1].includes('None')) {
      const param = defMatch[2];
      const indent = lines[i + 1].match(/^(\s*)/)?.[1] || '    ';
      patches.push(`@@ -${i + 1},2 +${i + 1},4 @@\n ${lines[i]}\n+${indent}if ${param} is None:\n+${indent}    raise ValueError("${param} cannot be None")\n ${lines[i + 1]}`);
      explanations.push(`Add None guard for parameter '${param}'`);
      break;
    }
  }

  const patch = patches.length > 0 
    ? `--- a/file\n+++ b/file\n${patches[0]}` 
    : `--- a/file\n+++ b/file\n@@ -1,1 +1,2 @@\n ${lines[0]}\n+# TODO: Review this file`;

  return {
    suggestion: explanations[0] || 'Code review suggestion',
    patch,
    explanation: explanations.join('. ') || 'No specific issues found; consider adding documentation.',
  };
}
