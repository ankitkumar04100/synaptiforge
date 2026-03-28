import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { triggerPattern, transformation, examples } = await req.json();

    if (!triggerPattern || !transformation) {
      return new Response(JSON.stringify({ error: "triggerPattern and transformation are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const id = `ref-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const confidence = 0.55;

    return new Response(JSON.stringify({
      id,
      triggerPattern,
      transformation,
      confidence,
      enabled: true,
      examples: examples || [],
      createdAt: new Date().toISOString(),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("reflex-learn error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
