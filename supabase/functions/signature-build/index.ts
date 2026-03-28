import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function analyzeLocally(code: string): { traits: Record<string, string>; summary: string } {
  const lines = code.split("\n");
  const totalLines = lines.length;

  // Naming analysis
  const snakeCount = (code.match(/[a-z]+_[a-z]+/g) || []).length;
  const camelCount = (code.match(/[a-z]+[A-Z][a-z]+/g) || []).length;
  const pascalCount = (code.match(/\b[A-Z][a-z]+[A-Z]/g) || []).length;
  const naming = snakeCount > camelCount
    ? `snake_case preferred (${snakeCount} occurrences); ${pascalCount > 0 ? "PascalCase for classes" : "consistent casing"}`
    : camelCount > 0
    ? `camelCase preferred (${camelCount} occurrences); ${pascalCount > 0 ? "PascalCase for classes" : "consistent casing"}`
    : "Mixed or minimal naming conventions detected";

  // Error handling
  const tryCount = (code.match(/\btry[\s:{]/g) || []).length;
  const guardCount = (code.match(/if\s+\w+\s+(is\s+None|==\s*null|===?\s*undefined)/g) || []).length;
  const errorHandling = tryCount > 2
    ? `Defensive: ${tryCount} try/catch blocks with ${guardCount > 0 ? `${guardCount} guard clauses` : "minimal guards"}`
    : guardCount > 0
    ? `Guard-clause style: ${guardCount} null/None checks, ${tryCount} try blocks`
    : "Minimal error handling; relies on caller validation";

  // Loop patterns
  const forCount = (code.match(/\bfor\s/g) || []).length;
  const whileCount = (code.match(/\bwhile\s/g) || []).length;
  const mapCount = (code.match(/\.map\(|\.filter\(|\.reduce\(/g) || []).length;
  const enumCount = (code.match(/enumerate\(/g) || []).length;
  const comprehensionCount = (code.match(/\[.*\bfor\b.*\bin\b/g) || []).length;
  const loopParts: string[] = [];
  if (comprehensionCount > 0) loopParts.push(`${comprehensionCount} list comprehensions`);
  if (mapCount > 0) loopParts.push(`${mapCount} functional (map/filter/reduce)`);
  if (enumCount > 0) loopParts.push(`enumerate() preferred`);
  if (forCount > 0) loopParts.push(`${forCount} for loops`);
  if (whileCount > 0) loopParts.push(`${whileCount} while loops`);
  const loopPatterns = loopParts.length > 0 ? loopParts.join("; ") : "No loops detected";

  // Test style
  const pytestCount = (code.match(/def test_|@pytest/g) || []).length;
  const jestCount = (code.match(/\b(describe|it|test)\s*\(/g) || []).length;
  const assertCount = (code.match(/assert|expect\(/g) || []).length;
  const testStyle = pytestCount > 0
    ? `pytest style (${pytestCount} test functions, ${assertCount} assertions)`
    : jestCount > 0
    ? `Jest/Mocha style (${jestCount} test blocks, ${assertCount} assertions)`
    : "No test patterns detected";

  // Formatting
  const singleQuotes = (code.match(/'/g) || []).length;
  const doubleQuotes = (code.match(/"/g) || []).length;
  const semicolons = (code.match(/;\s*$/gm) || []).length;
  const avgLineLength = Math.round(code.length / Math.max(totalLines, 1));
  const indentTwo = lines.filter(l => l.match(/^  \S/)).length;
  const indentFour = lines.filter(l => l.match(/^    \S/)).length;
  const indent = indentTwo > indentFour ? "2-space indent" : "4-space indent";
  const quoteStyle = singleQuotes > doubleQuotes * 1.5 ? "single quotes" : doubleQuotes > singleQuotes * 1.5 ? "double quotes" : "mixed quotes";
  const formatting = `${indent}, ${quoteStyle}, ${semicolons > 3 ? "semicolons" : "no semicolons"}, avg ${avgLineLength} chars/line`;

  // Framework bias
  const frameworks: string[] = [];
  if (code.includes("FastAPI") || code.includes("@app.")) frameworks.push("FastAPI");
  if (code.includes("React") || code.includes("useState") || code.includes("useEffect")) frameworks.push("React");
  if (code.includes("import express") || code.includes("require('express')")) frameworks.push("Express");
  if (code.includes("import django") || code.includes("from django")) frameworks.push("Django");
  if (code.includes("TypeScript") || code.match(/:\s*(string|number|boolean)\b/)) frameworks.push("TypeScript");
  if (code.includes("def ") && code.includes("import ")) frameworks.push("Python");
  const frameworkBias = frameworks.length > 0 ? frameworks.join(" + ") + " ecosystem" : "General purpose; no strong framework bias";

  const traits = { naming, errorHandling, loopPatterns, testStyle, formatting, frameworkBias };

  const summary = `Developer favors ${naming.split(";")[0].toLowerCase()} with ${tryCount > 0 ? "defensive error handling" : "guard-clause patterns"}. ${loopParts[0] || "Standard loops"}. ${frameworks.length > 0 ? `Works primarily with ${frameworks.join(", ")}.` : "General-purpose coding style."}`;

  return { traits, summary };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    let codeText = "";

    if (body.text) {
      codeText = body.text;
    } else if (body.files && Array.isArray(body.files)) {
      codeText = body.files.map((f: { path: string; content: string }) => `// ${f.path}\n${f.content}`).join("\n\n");
    }

    if (!codeText.trim()) {
      return new Response(JSON.stringify({ error: "Provide text or files array" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const language = body.options?.language || body.language || "auto";

    if (LOVABLE_API_KEY) {
      try {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              {
                role: "system",
                content: `You are a code style analyzer. Analyze the code and return ONLY valid JSON with this exact structure:
{
  "traits": {
    "naming": "description of naming conventions",
    "errorHandling": "description of error handling patterns",
    "loopPatterns": "description of loop/iteration patterns",
    "testStyle": "description of testing patterns",
    "formatting": "description of formatting preferences",
    "frameworkBias": "description of framework/library preferences"
  },
  "summary": "2-3 sentence summary of the developer's overall style"
}
Be specific with counts and examples from the actual code.`,
              },
              {
                role: "user",
                content: `Analyze this ${language} code for coding style patterns:\n\n${codeText.slice(0, 8000)}`,
              },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            try {
              const parsed = JSON.parse(content);
              if (parsed.traits) {
                const sigId = `sig-${Date.now()}`;
                const signatureJson = {
                  id: sigId,
                  version: 1,
                  updatedAt: new Date().toISOString(),
                  traits: parsed.traits,
                  summary: parsed.summary || "",
                };
                return new Response(JSON.stringify({ signatureJson, version: 1, summary: parsed.summary }), {
                  headers: { ...corsHeaders, "Content-Type": "application/json" },
                });
              }
            } catch { /* fall through to local */ }
          }
        }
      } catch (e) {
        console.error("AI signature error, using local:", e);
      }
    }

    // Local fallback
    const { traits, summary } = analyzeLocally(codeText);
    const sigId = `sig-${Date.now()}`;
    const signatureJson = {
      id: sigId,
      version: 1,
      updatedAt: new Date().toISOString(),
      traits,
      summary,
    };

    return new Response(JSON.stringify({ signatureJson, version: 1, summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("signature-build error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
