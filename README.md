# 🤖 AI Coach

> **Lernplattform für OneCode-Entwickler:** Agentic Coding, MCP, Quality Gates und Kundengespräche — in zehn Kapiteln vom Sprachmodell bis zum CTO-Interview.

---

## ✨ Features

| | Feature | Beschreibung |
|---|---|---|
| 📚 | **10 Kapitel als MDX-Lektionen** | Kurze, praxisnahe Lerneinheiten — Inhalte liegen als MDX in `content/kapitel/` und brauchen keinen Rebuild |
| 🎓 | **KI-Tutor statt Multiple Choice** | Mündliche Prüfungen per AI — der Tutor bewertet Verständnis, nicht auswendig gelernte Antworten |
| 🛠️ | **Praxis-Aufgaben** | Code-, Config-, Repo-Audit- und Freestyle-Aufgaben mit Akzeptanzkriterien und KI-Bewertung |
| 📓 | **Lerntagebuch** | Reflexion nach jedem Kapitel — ohne Noten, für echtes Verständnis |
| 🌐 | **Übersetzung** | Inhalte per Klick in andere Sprachen übersetzen (via Anthropic API) |
| 🏆 | **Optionale Zertifikate & Nachweise** | Externe Zertifizierungen und Artefakte pro Kapitel — blockieren den Lernpfad nicht |
| 🎛️ | **Fokus-Modus** | Ablenkungsfreies Lernen per Toggle |
| 📊 | **Fortschrittsanzeige** | Equalizer-Visualisierung für Lektionen und bestandene Tests |
| 🐳 | **Docker-ready** | `docker compose up` mit optionalem lokalen Ollama-Backend |
| 🔌 | **Multi-Provider AI** | Anthropic (Cloud) oder Ollama (lokal) — umschaltbar per `.env` |

---

## 📖 Lernpfad — Kapitel & Lernziele

### 🔷 Kapitel 1 — Wie Sprachmodelle wirklich arbeiten
> Tokens, Context Window, Sampling, Halluzinationen und Kosten — ohne Magie.

- Tokenisierung und Embeddings erklären
- Context Window als endliches Budget behandeln
- Temperature und Sampling begründet wählen
- Halluzinationen als Systemverhalten einordnen
- Modelle und Preise im Kundengespräch einordnen

### 🔷 Kapitel 2 — Prompt Engineering für Entwickler
> Rolle, Instruktion, Kontext und Format so setzen, dass ein Modell lieferbar arbeitet.

- Vier Teile eines Prompts bewusst setzen (Rolle, Instruktion, Kontext, Format)
- Few-Shot und Chain-of-Thought begründet einsetzen
- Strukturierte Ausgaben mit XML-Tags und Schemas erzwingen
- System-Prompts von Task-Prompts trennen
- Prompt-Anti-Patterns erkennen und benennen

### 🔷 Kapitel 3 — Agentic Coding in der Praxis
> Autocomplete, Chat und Agent als verschiedene Risikoklassen.

- Autocomplete, Chat, Agent als Risikoklassen unterscheiden
- Cursor mit Rules, Plan-Modus und gezieltem Kontext nutzen
- Claude Code, GitHub Copilot Agent Mode einordnen
- Codex, Aider, Cline vergleichen — ohne Tool-Religion
- Plan-/Review-Schleifen und Human Quality Gates als Default

### 🔷 Kapitel 4 — Kontext-Engineering: Rules, Context Files, Skills
> Das technische Herz: Agenten lesen das Repo, nicht euren Slack.

- AGENTS.md als herstellerübergreifenden Standard schreiben
- `.cursor/rules` und `CLAUDE.md` abgrenzen
- Copilot Custom Instructions korrekt platzieren
- Skills als versionierte On-Demand-Workflows verstehen
- Repositories agentenfähig übergeben

### 🔷 Kapitel 5 — MCP und Werkzeuganbindung
> Host, Client, Server, Primitives — der Hebel für Agenten im Repo.

- Host, Client, Server und die drei Primitives (Tools, Resources, Prompts) trennen
- Bestehende MCP-Server begründet anbinden
- Eigene MCP-Server verantwortungsvoll bauen
- Tool Poisoning und Confused Deputy im Kundengespräch erklären
- MCP als Integrationsschicht verkaufen

### 🔷 Kapitel 6 — Agentic Workflows entwerfen
> Das einfachste Pattern, das funktioniert — plus Human Quality Gates.

- Anthropic-Patterns (Chaining, Routing, Parallel, Orchestrator-Worker, Evaluator-Optimizer) zuordnen
- Single-Agent vs. Multi-Agent begründen
- Human Quality Gates an teuren Stellen platzieren
- Agents in GitHub Issues und CI einbinden
- Erfolg in Durchsatz, Qualität und Kosten messen

### 🔷 Kapitel 7 — Von Vibe Code zu Production Software
> Fraunhofer-Risiken, Audit, Umbau, agentenfähige Übergabe.

- Vibe Coding von KI-gestütztem Engineering unterscheiden
- Architektur- und Datenmodell-Audit in einer Woche priorisieren
- Auth, Permissions, Secrets als Production-Blocker benennen
- Dependencies und Supply Chain prüfen
- CI, Fehlerbehandlung, Logging und agentenfähige Übergabe skizzieren

### 🔷 Kapitel 8 — Qualitäts- und Sicherheitsgate für KI-Code
> Evals, Guardrails, PR-Gates, Observability, OWASP GenAI Top 10.

- Evals beschreiben und minimale Eval-Sets für Agent-Code definieren
- LLM-as-a-Judge mit Rubrics einsetzen
- Guardrails mit Tripwires von Prompt-Appellen unterscheiden
- OWASP GenAI LLM Top 10 2026 im Kundengespräch zuordnen
- Tracing, Token- und Kostenkontrolle mit Langfuse/OpenTelemetry skizzieren

### 🔷 Kapitel 9 — Lokale LLMs für Entwickler
> Datenschutz, Offline, Demos — und der ehrliche Qualitätsabstand zur Cloud.

- Vier Gründe für lokale Modelle nennen (ohne den Qualitätsabschlag zu beschönigen)
- Ollama, LM Studio, llama.cpp voneinander trennen
- Quantisierung und GGUF mit VRAM-Faustformel erklären
- Lokales Coding-Setup (Aider + Ollama) inkl. Context-Falle beschreiben

### 🔷 Kapitel 10 — Das Kundengespräch
> Drei Angebote, Discovery, Einwände, AI Act — und der skeptische CTO.

- Die drei OneCode-Angebote mit Pitch, Pain und Lösung unterscheiden
- Discovery-Fragen stellen, die zum richtigen Angebot führen
- Copilot-, Preis- und „machen wir selbst"-Einwände souverän beantworten
- AI-Act-Pflichten nennen, die Softwareanbieter wirklich treffen
- Simuliertes CTO-Interview bestehen

---

## 🏅 Optionale Zertifikate & Nachweise

Externe Zertifizierungen, die den Lernpfad ergänzen — keine Pflicht, aber wertvoll für Kundengespräche.

| Kapitel | Zertifikat / Nachweis | Anbieter | Hinweis |
|---|---|---|---|
| 3 | 🎖️ Accelerate AI-assisted development using GitHub Copilot (APL-2007) | Microsoft Applied Skills | Kostenloses Lab, Englisch |
| 4 | 🎖️ Claude Code in Action | Anthropic Academy | Kostenloses Badge über Quizzes |
| 4 | 🎖️ Introduction to Agent Skills | Anthropic Academy | Passt zur Skills-Lektion |
| 8 | 🎖️ Secure AI solutions in the cloud (APL5009) | Microsoft Applied Skills | Kostenloses Lab zu Guardrails & Härtung |
| 9 | 📝 Internes Artefakt: Lokales Setup dokumentieren | — | Modell, Quantisierung, Hardware, Benchmark vs. Cloud |

---

## 🚀 Lokal starten

```bash
cp .env.example .env
npm install
npm run dev
```

Die App liegt auf [http://localhost:3000](http://localhost:3000). Ohne `ANTHROPIC_API_KEY` funktionieren Lektionen, aber nicht Tutor und Übersetzung.

## 🐳 Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Optional mit lokalem Ollama:

```bash
docker compose --profile ollama up --build
```

Dann in `.env`: `AI_PROVIDER=ollama` und `OLLAMA_BASE_URL=http://ollama:11434/v1`.

## 📂 Inhalte

Lektionen liegen in `content/kapitel/` als MDX plus `kapitel.yml`. Der Container mountet dieses Verzeichnis, Korrekturen brauchen keinen Rebuild.
