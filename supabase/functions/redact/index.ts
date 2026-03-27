import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function redactSecrets(text: string): string {
  return text
    .replace(/sk-[A-Za-z0-9_-]{20,}/g, "sk-***REDACTED***")
    .replace(/ghp_[A-Za-z0-9]{36}/g, "ghp_***REDACTED***")
    .replace(/gho_[A-Za-z0-9]{36}/g, "gho_***REDACTED***")
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "***JWT_REDACTED***")
    .replace(/AKIA[A-Z0-9]{16}/g, "***AWS_KEY_REDACTED***")
    .replace(/AIza[A-Za-z0-9_-]{35}/g, "***GOOGLE_KEY_REDACTED***")
    .replace(/(password|secret|token|apikey|api_key)\s*[=:]\s*["']?[^\s"']{4,}/gi, "$1=***REDACTED***");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (typeof text !== "string") {
      return new Response(JSON.stringify({ error: "text is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ masked: redactSecrets(text) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
