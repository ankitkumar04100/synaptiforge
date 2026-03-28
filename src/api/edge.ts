import { supabase } from '@/integrations/supabase/client';

// Suggest fix or generate patch
export async function suggestFix(params: {
  filePath: string;
  context: string;
  signatureJson?: object;
  language: string;
  intent: string;
}) {
  const { data, error } = await supabase.functions.invoke('suggest', {
    body: params,
  });

  if (error) throw new Error(error.message || 'Suggest request failed');
  return data as { suggestion: string; patch: string; explanation: string; patchedText?: string };
}

// Build cognitive signature via AI
export async function buildSignature(params: {
  text?: string;
  files?: { path: string; content: string }[];
  options?: { language?: string };
}) {
  const { data, error } = await supabase.functions.invoke('signature-build', {
    body: params,
  });

  if (error) throw new Error(error.message || 'Signature build failed');
  return data as { signatureJson: import('@/types').CognitiveSignature; version: number; summary: string };
}

// Learn a new reflex
export async function learnReflex(params: {
  triggerPattern: string;
  transformation: string;
  examples?: string[];
}) {
  const { data, error } = await supabase.functions.invoke('reflex-learn', {
    body: params,
  });

  if (error) throw new Error(error.message || 'Reflex learn failed');
  return data as import('@/types').Reflex;
}

// Open a GitHub PR from a patch
export async function openPR(params: {
  patch: string;
  repo: { owner: string; name: string };
  branchName?: string;
  base?: string;
  title: string;
  body?: string;
}) {
  const { data, error } = await supabase.functions.invoke('patch-pr', {
    body: params,
  });

  if (error) throw new Error(error.message || 'PR creation failed');
  return data as { prUrl: string | null; message?: string };
}

// Predictive SSE stream
export function predictStream(params: {
  filePath: string;
  context: string;
  signatureJson?: object;
  temperature: number;
  top_p: number;
  language: string;
}, onToken: (token: string) => void, onConfidence: (c: number) => void, onDone: () => void): AbortController {
  const controller = new AbortController();
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predict`;

  fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
    },
    body: JSON.stringify(params),
    signal: controller.signal,
  }).then(async (resp) => {
    if (!resp.ok || !resp.body) { onDone(); return; }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, idx).trim();
        buffer = buffer.slice(idx + 1);

        if (!line.startsWith('data: ')) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') { onDone(); return; }

        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.token) onToken(parsed.token);
          if (parsed.confidence !== undefined) onConfidence(parsed.confidence);
          if (parsed.done) { onDone(); return; }
        } catch { /* skip */ }
      }
    }
    onDone();
  }).catch(() => onDone());

  return controller;
}

// SSE events connection
export function connectEvents(
  onEvent: (type: string) => void,
  onConnect: () => void,
  onDisconnect: () => void,
): () => void {
  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/events`;
  let aborted = false;

  const connect = async () => {
    try {
      const resp = await fetch(url, {
        headers: { Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
      });
      if (!resp.ok || !resp.body) { onDisconnect(); return; }
      onConnect();

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (!aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let idx: number;
        while ((idx = buffer.indexOf('\n')) !== -1) {
          const line = buffer.slice(0, idx).trim();
          buffer = buffer.slice(idx + 1);
          if (!line.startsWith('data: ')) continue;
          try {
            const parsed = JSON.parse(line.slice(6));
            onEvent(parsed.type);
          } catch { /* skip */ }
        }
      }
    } catch { /* reconnect */ }

    if (!aborted) {
      onDisconnect();
      setTimeout(connect, 5000);
    }
  };

  connect();
  return () => { aborted = true; };
}

// Redact secrets
export async function redactText(text: string) {
  const { data, error } = await supabase.functions.invoke('redact', {
    body: { text },
  });
  if (error) throw new Error(error.message);
  return data as { masked: string };
}
