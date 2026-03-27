import { describe, it, expect } from "vitest";
import { redactSecrets, applyUnifiedDiff, generateHeuristicSuggestion } from "@/lib/engine";

describe("redactSecrets", () => {
  it("redacts OpenAI keys", () => {
    const input = "my key is sk-abc123def456ghi789jkl012mno";
    const result = redactSecrets(input);
    expect(result).not.toContain("sk-abc123");
    expect(result).toContain("sk-***REDACTED***");
  });

  it("redacts GitHub personal tokens", () => {
    const input = "token ghp_abcdefghijklmnopqrstuvwxyz1234567890";
    const result = redactSecrets(input);
    expect(result).toContain("ghp_***REDACTED***");
  });

  it("redacts JWT tokens", () => {
    const input = "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk";
    const result = redactSecrets(input);
    expect(result).toContain("***JWT_REDACTED***");
  });

  it("redacts password assignments", () => {
    const input = 'password = "supersecret123"';
    const result = redactSecrets(input);
    expect(result).not.toContain("supersecret123");
  });
});

describe("applyUnifiedDiff", () => {
  it("applies a simple addition", () => {
    const original = "line1\nline2\nline3";
    const diff = "--- a/file\n+++ b/file\n@@ -1,3 +1,4 @@\n line1\n+inserted\n line2\n line3";
    const { result, success } = applyUnifiedDiff(original, diff);
    expect(success).toBe(true);
    expect(result).toContain("inserted");
  });

  it("applies a replacement", () => {
    const original = "old line\nkeep";
    const diff = "--- a/file\n+++ b/file\n@@ -1,2 +1,2 @@\n-old line\n+new line\n keep";
    const { result, success } = applyUnifiedDiff(original, diff);
    expect(success).toBe(true);
    expect(result).toContain("new line");
    expect(result).not.toContain("old line");
  });

  it("returns original on invalid diff", () => {
    const original = "unchanged";
    const diff = "not a valid diff at all";
    const { result } = applyUnifiedDiff(original, diff);
    expect(result).toBe("unchanged");
  });
});

describe("generateHeuristicSuggestion", () => {
  it("detects == None in Python", () => {
    const code = "if x == None:\n    pass";
    const { explanation } = generateHeuristicSuggestion(code, "python");
    expect(explanation).toContain("is None");
  });

  it("adds None guard for function params", () => {
    const code = "def process(user):\n    name = user.get('name')";
    const { patch, explanation } = generateHeuristicSuggestion(code, "python");
    expect(patch).toContain("if user is None");
    expect(explanation).toContain("None guard");
  });

  it("returns valid unified diff format", () => {
    const code = "x = 1\ny = 2";
    const { patch } = generateHeuristicSuggestion(code, "python");
    expect(patch).toContain("--- a/file");
    expect(patch).toContain("+++ b/file");
    expect(patch).toContain("@@");
  });
});
