# ⚡ PromptForge — Intent-to-Impact AI Desktop Assistant

An intelligent AI assistant built in JavaScript that solves the struggle of vague or minimal prompting. It deconstructs your short requests, decodes latent requirements and short-term goals, automatically constructs high-impact **Master Prompts**, and executes them seamlessly using the **Gemini API** or **OpenAI API**.

---

## 🌟 Features

- **Intent & Goal Deconstruction:** Automatically assigns the ideal expert persona, context, quality constraints, and structured output formatting.
- **Side-by-Side Dual Pane:** Review, edit, and copy the engineered prompt on the left, and view the live AI deliverable on the right.
- **Multi-Model Provider:** Supports **Google Gemini** (e.g., `gemini-2.5-flash`) and **OpenAI** (`gpt-4o-mini`, `gpt-4o`).
- **Offline / Zero-Config Mode:** Built-in rule-based prompt architect allows full testing even before setting up API keys.
- **In-App API Key Manager:** Set or update keys directly via the UI Settings modal without touching code.
- **Local History:** Saves recent tasks and prompts locally for quick reference.

---

## 🚀 Quick Start

### 1. Start the Server
```bash
npm start
```
Or for auto-reloading during development:
```bash
npm run dev
```

### 2. Open the Assistant
Open your browser to:
```
http://localhost:3000
```

### 3. Add API Keys (Optional but Recommended)
Click the **⚙️ Settings** button in the top right to paste your:
- **Google Gemini API Key**: [Get one free from Google AI Studio](https://aistudio.google.com/app/apikey)
- **OpenAI API Key**: [Get from OpenAI](https://platform.openai.com/api-keys)

---

## 📂 Project Structure

```
prompt-pilot-agent/
├── src/
│   ├── promptEngine.js     # Meta-prompt synthesizer & Gemini/OpenAI runners
│   └── server.js           # Express API server & routes
├── public/
│   ├── index.html          # Clean desktop web interface
│   ├── style.css           # Modern dark-theme styling
│   └── app.js              # Frontend controller & API bridge
├── .env                    # Local environment config
├── package.json            # Node.js dependencies
└── README.md               # Documentation
```
