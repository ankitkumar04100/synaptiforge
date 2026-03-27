# 🧠 Synaptiforge — Your Cognitive Coding Twin

> A self-evolving AI that learns your coding patterns, predicts your next move, and generates code in your personal style.

---

**[Synaptiforge App](https://synaptiforge.vercel.app/)**

---

## 🚀 Elevator Tagline

**Synaptiforge** is an adaptive AI that studies your coding style, learns your logical patterns, and evolves to generate code that reflects your thinking—turning development into a **deeply personalized experience**.

---

<img width="2528" height="1696" alt="Gemini_Generated_Image_plejlvplejlvplej" src="https://github.com/user-attachments/assets/e29d6fe7-46e3-491b-b2aa-5842160aa480" />

---

## 📚 Table of Contents

- [🌟 Why Synaptiforge?](#-why-synaptiforge)
- [✨ Features](#-features)
- [🧠 How It Works](#-how-it-works)
- [🏗️ Architecture](#-architecture)
- [🗂️ Data Model](#-data-model)
- [🛠️ Built With](#-built-with)
- [⚡ Quickstart](#-quickstart)
- [😊 Usage](#-usage)
- [🔌 API](#-api)
- [🧾 Prompt Template](#-prompt-template)
- [🛡️ Quality Guardrails](#-quality-guardrails)
- [🔐 Privacy & Security](#-privacy--security)
- [🧪 Testing](#-testing)
- [🎬 live Demo](#-live-demo)
- [🗺️ Roadmap](#-roadmap)
- [⚠️ Limitations](#-limitations)
- [🤝 Contributing](#-contributing)
- [📜 License](#-license)
- [❓ FAQ](#-faq)
- [🎨 Assets](#-assets)
---

## 🌟 Why Synaptiforge?

Most AI dev tools generate **generic code**.

> ❌ Same patterns  
> ❌ Same structure  
> ❌ No personalization  

### ✅ Synaptiforge Changes That

It **learns YOU.**

It captures:
- 🧩 **Naming habits**
- 🔁 **Loop patterns**
- ⚠️ **Error-handling style**
- 🛠️ **Debugging instincts**

…and evolves continuously.

### 🔥 Core Advantages

- **🎯 Personalized** → Style-aligned generation instead of boilerplate  
- **⚡ Adaptive** → Learns from your edits in real-time  
- **🤖 Agentic** → Multi-agent system (analyze, predict, generate, review)  
- **🧪 Practical** → Works on real repositories, not just demos  

---

## ✨ Features

### 🧬 Cognitive Signature Profiling
Extracts your:
- Naming conventions  
- Code structure  
- Style fingerprints  

> 🧠 Builds a **developer identity model**

---

### ⚡ Reflex Learning Engine
- Converts repeated fixes into **auto-triggered reflexes**
- Eliminates repetitive debugging

> 🔁 Your habits become **automated intelligence**

---

### 🔮 Predictive Coding
- Predicts **next lines / blocks**
- Matches your historical coding behavior

---

### 🎨 Style-Aligned Code Generation
- LLM outputs mimic:
  - Your formatting  
  - Your logic style  
  - Your architecture choices  

> 💡 Feels like *you wrote it*

---

### 📖 Explainer Mode
- Line-by-line reasoning  
- Transparent fixes  

> 🧑‍🏫 Learn while building

---

### 📂 Repo-Aware Context
- Uses:
  - Current files  
  - Tests  
  - Project structure  

> 📌 Context-aware suggestions, not blind generation

---

### 🛠️ Safe Patches
- One-click:
  - PR generation  
  - Local patch  
- Includes **diff preview**

---

### 🔐 Privacy First
- 🧠 Local caching  
- 🔒 Selective redaction  
- ✅ Opt-in telemetry  

> Your code stays **yours**

---

## 🧠 How It Works

### 1️⃣ Observe
- Tracks:
  - Code edits  
  - Test runs  
  - Fix patterns  
- All processed **locally**

---

### 2️⃣ Profile
- Builds **Cognitive Signature**
- Stored in:
  - JSON / SQLite  

> 🧬 Your coding DNA

---

### 3️⃣ Plan
- Agents decide:
  - Predict  
  - Generate  
  - Fix  

> 🤖 Intelligent decision-making layer

---

### 4️⃣ Generate
- LLM receives:
  - Your signature  
  - File context  

> ✨ Output = **Your style + AI power**

---

### 5️⃣ Validate
- Runs:
  - Tests  
  - Static checks  

- Produces:
  - Patch  
  - Explanation  

---

### 6️⃣ Evolve
- Successful actions become:
  - 🔁 **Reusable Reflexes**

> 🚀 System improves automatically over time

---

## 💡 Key Highlight

> **Synaptiforge doesn’t just assist you — it becomes you.**

---

## 🏗️ Architecture

<img width="4032" height="1048" alt="image" src="https://github.com/user-attachments/assets/005acb03-0127-407d-9331-d9bc7c0f44a1" />

## 🧩 Core Modules

### 🧬 Cognitive Signature
Your personal coding style profile:
- Naming conventions  
- Error-handling patterns  
- Structural habits  

> **Captures your unique coding DNA**

---

### ⚡ Reflex Engine
- Maps repeated corrections → **auto-applied transformations**  
- Learns from your fixes and eliminates repetition  

> **Turns habits into automation**

---

### 🎯 Prompt Orchestrator
- Injects:
  - Cognitive Signature  
  - File context  
  - Repo awareness  
- Enhances LLM responses to match your style  

> **Ensures personalized and context-aware generation**

---

### 🤖 Agents
Specialized AI agents working together:

- **Analyzer** → Understands code context  
- **Predictor** → Forecasts next steps  
- **Generator** → Produces code  
- **Reviewer** → Validates and improves output  

> **Multi-agent intelligence system**

---

### 🛠️ Patch Builder
- Generates:
  - Diffs  
  - Patches  
  - Automated PRs  
- Includes safe preview before applying  

> **From suggestion → production-ready change**

---

## 🧩 Data Model

```
-- Users optional if single-user; can be keyed by device
CREATE TABLE cognitive_signature (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  signature_json TEXT,           -- naming, formatting, patterns
  updated_at DATETIME
);

CREATE TABLE reflex (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  trigger_pattern TEXT,          -- e.g., "missing null check"
  transformation TEXT,           -- e.g., "add guard clause"
  confidence REAL DEFAULT 0.7,
  examples_json TEXT,
  created_at DATETIME
);

CREATE TABLE event_log (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  file_path TEXT,
  event_type TEXT,               -- edit/save/test-fail/test-pass
  payload_json TEXT,
  created_at DATETIME
);

CREATE TABLE suggestion (
  id INTEGER PRIMARY KEY,
  user_id TEXT,
  file_path TEXT,
  context_hash TEXT,
  suggestion_text TEXT,
  code_patch TEXT,
  explanation_md TEXT,
  accepted INTEGER,              -- 0/1
  created_at DATETIME
);
```

---

### Example cognitive signature (excerpt)

```
{
  "naming": { "case": "snake_case", "prefers_long_names": true },
  "error_handling": { "try_catch": true, "default_return": "None", "log_on_error": true },
  "loops": { "preferred": "for item in items" },
  "tests": { "framework": "pytest", "style": "given-when-then" },
  "format": { "line_length": 100, "imports_sorted": true },
  "framework_bias": { "api": "FastAPI", "db": "SQLAlchemy" }
}
```

---

## 🛠 Built With

lovable, react, vite, typescript, tailwind-css, monaco-editor, openai-api, google-gemini-api, github-oauth, github-actions, vercel

---

## ⚡ Quickstart

### Prerequisites

- Python 3.10+
- Node.js 18+
- API key for OpenAI or Gemini
- (Optional) GitHub token for PR automation

### 1. Clone

```
git clone https://github.com/ankitkumar04100/synaptiforge.git
cd synaptiforge
```

### 2. Backend

```
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set OPENAI_API_KEY or GEMINI_API_KEY, MODEL_NAME, DB_URL=sqlite:///sf.db
uvicorn app.main:app --reload --port 8000
```

### 3. Fronted

```
cd ../web
pnpm i    # or npm/yarn
cp .env.example .env
# set VITE_API_BASE=http://localhost:8000
pnpm dev  # http://localhost:5173
```

### 4. Optional: Docker

```
docker compose up --build
# Frontend at 5173, API at 8000
```

---

### ▶ Usage 

1. **Open project** in the UI and select your repo folder.
2. **Start session** → Synaptiforge collects edit/test events locally.
3. **Build profile** → Click **Build Cognitive Profile** (10–30s).
4. **Ask for help** → e.g., “Implement X endpoint” or “Fix failing test”.
5. **Review patch** → Diff + explanation; Accept → apply or PR.
6. **Evolve** → On accept, reflex is saved; future similar contexts auto‑fix.

---

## 🔌 API

### POST /api/signature/build

Build or update the cognitive signature for the current repo.

```
POST /api/signature/build
Content-Type: application/json

{ "paths": ["./src", "./tests"] }
```
#### Response

```
{ "signatureId": "sig_123", "summary": "snake_case, try/except, pytest" }
```

### POST /api/suggest

Get style‑aligned code suggestions for a file/context.

```
POST /api/suggest
Content-Type: application/json

{
  "filePath": "src/users.py",
  "cursor": 312,
  "context": "def create_user(...",
  "intent": "add input validation and error handling"
}
```

#### Response

```
{
  "suggestion": "<code block>",
  "patch": "--- a/src/users.py\n+++ b/src/users.py\n@@ ...",
  "explanation": "Added try/except with logging..."
}
```

### POST /api/reflex/learn

Store a new reflex from an accepted change.

```
POST /api/reflex/learn
Content-Type: application/json

{
  "trigger": "missing null check",
  "transformation": "add guard clause return None",
  "examples": ["users.py: create_user()", "orders.py: create_order()"]
}
```

### POST /api/patch/apply

Apply the patch to the working tree or open a PR

```
POST /api/patch/apply
Content-Type: application/json

{ "patch": "diff...", "mode": "local" }
```

---

## 🧾 Prompt Template

```
System:
You are Synaptiforge, an AI that mirrors the user's coding style.

Cognitive Signature:
{{ signature_json }}

Context:
- File path: {{ file_path }}
- Surrounding code (trimmed): {{ code_snippet }}
- Repo conventions: {{ heuristics }}

Task:
{{ user_intent }}

Constraints:
- Match naming, error-handling, and formatting from the signature.
- Prefer {{ preferred_framework }} idioms when applicable.
- Provide concise inline comments only when non-obvious.
- Return a unified diff patch + a short explanation.
```

---

## ✅ Quality Guardrails

- **Static Checks**  
  Run linters like `ruff` / `eslint` before presenting suggestions  

- **Unit Hooks**  
  Re-run impacted tests after applying patches  

- **Reflex Thresholds**  
  - Confidence-based gating  
  - Manual review required initially  

- **Safety**  
  Secrets are **redacted** from prompts and logs  

- **Replayable**  
  Deterministic seeds ensure **reproducible suggestions**  

---

## 🔒 Privacy & Security

- **Local-First**  
  Cognitive Signature and Reflexes stored locally (**SQLite by default**)  

- **Selective Context**  
  Only minimal required code is sent to the LLM  

- **Redaction**  
  API keys, tokens, and secrets are **masked before requests**  

- **Opt-in Telemetry**  
  - Disabled by default  
  - Anonymized if enabled  

- **Git Safety**  
  - All changes are generated as **patches / PRs**  
  - No auto-commit without explicit user consent  

---

## 🧪 Testing

```
# Backend
pytest -q

# Frontend
pnpm test
```

### Scenario tests

- “Missing null check” → reflex creation → auto‑apply on next file
- Style imitation: verify naming & error‑handling match signature
- Prediction sanity: n‑gram overlap & AST shape similarity

---
## 🎬 Live Demo

---

**[Synaptiforge App](https://synaptiforge.vercel.app/)**

---

### 🎯 Theme
> **“AI tools write code. Synaptiforge learns you.”**

### 🎯 Goal
Show:
- Real AI patching (**unified diffs + explanation**)  
- **Reflexes** that learn and auto-suggest  
- **Predictive ghost text**  
- **Privacy controls**  
- **Local persistence**  
- *(Optional)* Real GitHub PR  

---

## ✅ Demo Prerequisites

- **Sign-in** → GitHub OAuth or Guest mode  
- **LLM Provider** → OpenAI / Gemini configured  
- **PRs (optional)** → GitHub token with repo + PR access  
- **Fixture Repo** → Small project with one failing test  
- **Privacy Test** → Fake key (e.g., `sk-abc123`)  
- **Persistence** → IndexedDB enabled (Signatures, Reflexes, Patches)  

---

## 🧭 Flow Overview

1. Hook → Why Synaptiforge  
2. Build Cognitive Signature  
3. Fix Bug → Diff + Explanation → Apply → Pass  
4. Reflex Auto-Suggestion  
5. Predictive Ghost Text  
6. Patches → *(Optional)* Open PR  
7. Privacy Panel  
8. Persistence (Refresh → Data stays)  

---

## 🗣️ Demo Walkthrough

### 1️⃣ 🎯 Hook — Set the Vision

**Say:**
> “Most AIs write generic code. Synaptiforge learns you—your naming, error handling, and patterns—and then codes in your style.”

**Show:**
- Dashboard UI  
- Stats cards:
  - Signature status  
  - Reflex count  
  - Recent patches  

---

### 2️⃣ 🧬 Build Cognitive Signature

**Action:**
- Go to **Signature → Build Profile**  
- Paste sample code (controller, utility, test)

**Say:**
> “Synaptiforge builds a Cognitive Signature—your naming style, error handling, structure, and preferences.”

**Show:**
- Summary:
  - Naming style (e.g., snake_case)  
  - Error-handling patterns  
  - Test style  
  - Framework preferences  

---

### 3️⃣ 🐞 Fix a Real Bug

**Action:**
- Open Editor → load failing test  
- Click **Suggest Fix**

**Say:**
> “We send minimal context + your signature. The AI returns a style-aligned fix with a diff and explanation.”

**Show:**
- Diff viewer  
- Explanation panel  

**Then:**
- Click **Apply**  
- Run tests → ✅ Pass  
- Use **Undo/Redo** to show safety  

---

### 4️⃣ 🔁 Reflex Auto-Suggestion

**Action:**
- Open another file with a similar issue  

**Say:**
> “Accepted fixes become Reflexes. Similar patterns trigger auto-suggestions.”

**Show:**
- Inline suggestion:
  - “Reflex: Add guard clause”  
  - Confidence level  

- Accept → Patch applied instantly  

---

### 5️⃣ 🔮 Predictive Ghost Text

**Action:**
- Place cursor and pause  

**Say:**
> “Synaptiforge predicts your next lines in your style.”

**Show:**
- Inline ghost text  
- Adjust **Aggressiveness**  
- Press:
  - `Tab` → Accept  
  - `Esc` → Dismiss  

---

### 6️⃣ 🧵 Patches → *(Optional)* Open PR

**Action:**
- Go to **Patches**  
- Select patch → Open PR  

**Say:**
> “It can create a branch, commit changes, and open a real Pull Request.”

**Show:**
- PR link (if configured)  
- Or disabled button with fallback  

---

### 7️⃣ 🔒 Privacy Panel

**Action:**
- Open **Settings → Privacy**

**Say:**
> “Privacy-first design: secrets are redacted, telemetry is off, and data control is yours.”

**Show:**
- Redaction tester (mask fake key)  
- Telemetry toggle (OFF)  
- Clear data option  

---

### 8️⃣ 💾 Persistence

**Action:**
- Refresh page  

**Say:**
> “Everything persists locally—signatures, reflexes, and patches.”

**Show:**
- Data still present after reload  
- *(Optional)* Export / Import JSON  

---

## 🗺 Roadmap

- **IDE Extensions** → VS Code / JetBrains integrations  
- **Team Cognitive Mesh** → Shared style profiles across teams  
- **Offline Models** → Local LLMs (Llama, Qwen) via adapters  
- **Deeper Learning** → Temporal patterns, task chains, long-term memory  
- **Policy Engine** → Org-level guardrails & compliance presets  
- **Multilingual** → Python / JS / TS / Go / Java support  

---

## ⚠️ Limitations

- Personalization improves with more usage  
- Style mimicry ≠ correctness → tests still required  
- LLM outputs may drift despite signature anchoring  
- PR automation needs GitHub token & permissions  

---

## 🤝 Contributing

We welcome contributions!

1. Fork the repository  
2. Create a feature branch  
3. Add tests for new logic  
4. Run lint & tests locally  
5. Submit a PR with:
   - Clear description  
   - Demo clips  

---

## 📄 License

**MIT © 2026 Synaptiforge Contributors**

---

## 💬 FAQ

**Q: Does it replace developers?**  
A: ❌ No. It **amplifies your style and speed**—you stay in control.  

---

**Q: Will it leak my code?**  
A: 🔒 No.  
- Local-first by default  
- Minimal context sharing  
- Secrets redacted  
- Telemetry is opt-in  

---

**Q: How fast does it learn?**  
A: ⚡  
- Useful in minutes  
- Becomes **distinctly you** after a few sessions  

---

**Q: Which models are supported?**  
A: Any provider via adapter:  
- OpenAI  
- Gemini  
- Others  

---

## 📸 Assets

<img width="2528" height="1696" alt="Gemini_Generated_Image_plejlvplejlvplej" src="https://github.com/user-attachments/assets/8927297a-84d3-4727-aca3-f79dd389ace8" />

---










