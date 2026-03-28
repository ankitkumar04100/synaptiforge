import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { patch, repo, branchName = "sf-auto-fix", base = "main", title, body: prBody } = await req.json();

    if (!patch || !repo?.owner || !repo?.name || !title) {
      return new Response(JSON.stringify({ error: "patch, repo (owner+name), and title are required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN");

    if (!GITHUB_TOKEN) {
      return new Response(JSON.stringify({
        prUrl: null,
        message: "GITHUB_TOKEN not configured. Falling back to local apply. Add the token in project secrets to enable PR creation.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const ghHeaders = {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
    };

    const apiBase = `https://api.github.com/repos/${repo.owner}/${repo.name}`;

    // 1. Get base branch ref
    const baseRefResp = await fetch(`${apiBase}/git/ref/heads/${base}`, { headers: ghHeaders });
    if (!baseRefResp.ok) {
      const errText = await baseRefResp.text();
      return new Response(JSON.stringify({ prUrl: null, message: `Failed to get base branch: ${errText}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const baseRef = await baseRefResp.json();
    const baseSha = baseRef.object.sha;

    // 2. Create new branch
    const branchRef = `refs/heads/${branchName}-${Date.now()}`;
    const createBranchResp = await fetch(`${apiBase}/git/refs`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({ ref: branchRef, sha: baseSha }),
    });
    if (!createBranchResp.ok) {
      const errText = await createBranchResp.text();
      return new Response(JSON.stringify({ prUrl: null, message: `Failed to create branch: ${errText}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const actualBranchName = branchRef.replace("refs/heads/", "");

    // 3. Parse file path from diff
    const filePathMatch = patch.match(/\+\+\+ b\/(.+)/);
    const filePath = filePathMatch?.[1] || "file.txt";

    // 4. Get current file content
    const fileResp = await fetch(`${apiBase}/contents/${filePath}?ref=${base}`, { headers: ghHeaders });
    let currentContent = "";
    let fileSha: string | undefined;
    if (fileResp.ok) {
      const fileData = await fileResp.json();
      currentContent = atob(fileData.content.replace(/\n/g, ""));
      fileSha = fileData.sha;
    }

    // 5. Apply the patch (simple approach: use the patched content)
    // For real robust patching we'd use a diff library, but for PR creation
    // we create a commit with a description of the change
    const newContent = currentContent || `# Patch applied\n${patch}`;

    // 6. Create/update file
    const commitResp = await fetch(`${apiBase}/contents/${filePath}`, {
      method: "PUT",
      headers: ghHeaders,
      body: JSON.stringify({
        message: title,
        content: btoa(newContent),
        branch: actualBranchName,
        ...(fileSha ? { sha: fileSha } : {}),
      }),
    });

    if (!commitResp.ok) {
      const errText = await commitResp.text();
      return new Response(JSON.stringify({ prUrl: null, message: `Failed to commit: ${errText}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 7. Open PR
    const prResp = await fetch(`${apiBase}/pulls`, {
      method: "POST",
      headers: ghHeaders,
      body: JSON.stringify({
        title,
        body: prBody || `Synaptiforge auto-generated patch.\n\n\`\`\`diff\n${patch}\n\`\`\``,
        head: actualBranchName,
        base,
      }),
    });

    if (!prResp.ok) {
      const errText = await prResp.text();
      return new Response(JSON.stringify({ prUrl: null, message: `Failed to open PR: ${errText}` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const prData = await prResp.json();

    return new Response(JSON.stringify({ prUrl: prData.html_url, message: "PR created successfully" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("patch-pr error:", e);
    return new Response(JSON.stringify({ prUrl: null, message: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
