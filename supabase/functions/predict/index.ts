import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { context, signatureJson, temperature = 0.5, top_p = 0.9, language, filePath } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY || !context) {
      // Fallback: send a simple completion
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          const fallbackTokens = [" if ", "user", " is ", "None", ":", "\n", "    ", "raise", " ValueError", '("', "user", " cannot", " be", " None", '")'];
          let i = 0;
          const interval = setInterval(() => {
            if (i < fallbackTokens.length) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: fallbackTokens[i] })}\n\n`));
              i++;
            } else {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ confidence: 0.75 })}\n\n`));
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
              clearInterval(interval);
              controller.close();
            }
          }, 50);
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    // Use AI gateway for streaming prediction
    const systemPrompt = `You are a code completion engine. Complete the code naturally following the developer's style. Output ONLY the completion text, no explanation, no markdown fences.${signatureJson ? `\nDeveloper style: ${JSON.stringify(signatureJson)}` : ""}`;

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
          { role: "user", content: `Complete this ${language || "code"}:\n${context}` },
        ],
        stream: true,
        temperature: Math.min(Math.max(temperature, 0), 1),
        top_p: Math.min(Math.max(top_p, 0), 1),
        max_tokens: 150,
      }),
    });

    if (!response.ok || !response.body) {
      // Fallback on error
      const encoder = new TextEncoder();
      const body = `data: ${JSON.stringify({ done: true })}\n\n`;
      return new Response(body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
      });
    }

    // Transform the OpenAI-compatible SSE stream into our format
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = "";

    const stream = new ReadableStream({
      async pull(controller) {
        try {
          const { done, value } = await reader.read();
          if (done) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ confidence: 0.82 })}\n\n`));
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
            controller.close();
            return;
          }

          buffer += decoder.decode(value, { stream: true });
          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            const line = buffer.slice(0, newlineIndex).trim();
            buffer = buffer.slice(newlineIndex + 1);

            if (!line.startsWith("data: ") || line === "data: [DONE]") {
              if (line === "data: [DONE]") {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ confidence: 0.82 })}\n\n`));
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                controller.close();
                return;
              }
              continue;
            }

            try {
              const parsed = JSON.parse(line.slice(6));
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: content })}\n\n`));
              }
            } catch {
              // skip malformed JSON
            }
          }
        } catch (e) {
          console.error("predict stream error:", e);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
    });
  } catch (e) {
    console.error("predict error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
