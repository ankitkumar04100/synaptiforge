import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function redactSecrets(text: string): string {
  return text
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "sk-***REDACTED***")
    .replace(/ghp_[A-Za-z0-9]{36}/g, "ghp_***REDACTED***")
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "***JWT_REDACTED***")
    .replace(/AKIA[A-Z0-9]{16}/g, "***AWS_KEY_REDACTED***")
    .replace(/(password|secret|token|apikey|api_key)\s*[=:]\s*["']?[^\s"']{4,}/gi, "$1=***REDACTED***");
}

function generateHeuristicSuggestion(code: string, language: string) {
  const lines = code.split("\n");
  const patches: string[] = [];
  const explanations: string[] = [];

  if (language === "python") {
    lines.forEach((line, i) => {
      if (line.includes("== None")) {
        patches.push(`@@ -${i + 1},1 +${i + 1},1 @@\n-${line}\n+${line.replace("== None", "is None")}`);
        explanations.push("Use `is None` instead of `== None` (PEP 8)");
      }
      if (line.match(/for \w+ in range\(len\(/)) {
        explanations.push("Consider using enumerate() instead of range(len())");
      }
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const defMatch = lines[i].match(/def\s+(\w+)\((\w+)/);
    if (defMatch && i + 1 < lines.length && !lines[i + 1].includes("if") && !lines[i + 1].includes("None")) {
      const param = defMatch[2];
      const indent = lines[i + 1].match(/^(\s*)/)?.[1] || "    ";
      patches.push(`@@ -${i + 1},2 +${i + 1},4 @@\n ${lines[i]}\n+${indent}if ${param} is None:\n+${indent}    raise ValueError("${param} cannot be None")\n ${lines[i + 1]}`);
      explanations.push(`Add None guard for parameter '${param}'`);
      break;
    }
  }

  const patch = patches.length > 0
    ? `--- a/file\n+++ b/file\n${patches[0]}`
    : `--- a/file\n+++ b/file\n@@ -1,1 +1,2 @@\n ${lines[0]}\n+# TODO: Review this file`;

  return {
    suggestion: explanations[0] || "Code review suggestion",
    patch,
    explanation: explanations.join(". ") || "No specific issues found; consider adding documentation.",
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { filePath, context, signatureJson, language, intent } = await req.json();
    if (!context || !language) {
      return new Response(JSON.stringify({ error: "context and language are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const redactedContext = redactSecrets(context);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (LOVABLE_API_KEY) {
      try {
        const systemPrompt = `You are Synaptiforge, an AI that mirrors the user's coding style. Return ONLY valid JSON with exactly these fields: {"suggestion": "short title", "patch": "unified diff string", "explanation": "why this change"}

${signatureJson ? `Cognitive Signature: ${JSON.stringify(signatureJson)}` : ""}
Language: ${language}
File: ${filePath || "unknown"}

IMPORTANT: The "patch" field must be a valid unified diff starting with --- a/ and +++ b/ headers, with @@ hunk headers.`;

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${LOVABLE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: `${intent || "Suggest minimal improvements"}\n\nCurrent code:\n\`\`\`${language}\n${redactedContext}\n\`\`\`` },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (response.status === 429) {
          return new Response(JSON.stringify({ error: "Rate limited, please try again later" }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: "Credits exhausted, please add funds" }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            try {
              const parsed = JSON.parse(content);
              return new Response(JSON.stringify({
                suggestion: parsed.suggestion || "AI Suggestion",
                patch: parsed.patch || "",
                explanation: parsed.explanation || "",
              }), {
                headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
              });
            } catch {
              // AI returned non-JSON, fall through to heuristic
            }
          }
        }
      } catch (e) {
        console.error("AI provider error, falling back to heuristic:", e);
      }
    }

    // Heuristic fallback
    const result = generateHeuristicSuggestion(redactedContext, language);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" },
    });
  } catch (e) {
    console.error("suggest error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
