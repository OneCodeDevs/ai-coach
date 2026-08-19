# AI Coach

Lernplattform für OneCode-Entwickler: Agentic Coding, MCP, Quality Gates und Kundengespräche.

## Lokal starten

```bash
cp .env.example .env
npm install
npm run dev
```

Die App liegt auf [http://localhost:3000](http://localhost:3000). Ohne `ANTHROPIC_API_KEY` funktionieren Lektionen, aber nicht Tutor und Übersetzung.

## Docker Compose

```bash
cp .env.example .env
docker compose up --build
```

Optional mit lokalem Ollama:

```bash
docker compose --profile ollama up --build
```

Dann in `.env`: `AI_PROVIDER=ollama` und `OLLAMA_BASE_URL=http://ollama:11434/v1`.

## Inhalte

Lektionen liegen in `content/kapitel/` als MDX plus `kapitel.yml`. Der Container mountet dieses Verzeichnis, Korrekturen brauchen keinen Rebuild.
