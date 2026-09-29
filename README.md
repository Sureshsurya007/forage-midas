# ⚡ PromptForge — Intent-to-Impact AI Assistant (Vercel Ready)

An intelligent AI assistant built in JavaScript that solves the struggle of vague or minimal prompting. It deconstructs your short requests, decodes latent requirements and short-term goals, automatically constructs high-impact **Master Prompts**, and executes them seamlessly using the **Gemini API** or **OpenAI API**.

---

## 🚀 Deploying to Vercel

This project is pre-configured for instant zero-config deployment on Vercel (`vercel.json` + `api/index.js`).

### Option A: Deploy via Vercel CLI (Fastest)

1. Open PowerShell / Terminal in this project directory:
   ```bash
   cd C:\Users\chandrashekar\.gemini\antigravity\scratch\prompt-pilot-agent
   ```
2. Run:
   ```bash
   npx vercel
   ```
3. Follow the quick prompts in your terminal:
   - Log in or authenticate with your Vercel account.
   - Set up and deploy? **Yes (`y`)**
   - Which scope? Select your personal account.
   - Link to existing project? **No (`n`)**
   - What’s your project’s name? `promptforge-agent` (or press Enter)
   - In which directory is your code located? `./` (press Enter)
   - Want to modify these settings? **No (`n`)**

Your live URL will be generated in ~30 seconds!

---

### Option B: Deploy via GitHub + Vercel Dashboard

1. Push this repository to GitHub:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository.
4. *(Optional)* Add your **Environment Variables** in the Vercel project settings:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `OPENAI_API_KEY`: Your OpenAI API Key
5. Click **Deploy**!

> **Note for Public Deployments:** Even if you don't set environment variables on Vercel, users can click the **⚙️ Settings** icon in the top right of the live web app to securely enter their own API keys directly in their browser session!

---

## 💻 Local Development

```bash
npm install
npm start
```
Runs locally at: `http://localhost:3000`

---

## 📂 Project Architecture

```
prompt-pilot-agent/
├── api/
│   └── index.js            # Vercel Serverless Function entrypoint
├── src/
│   ├── promptEngine.js     # Meta-prompt synthesizer & Gemini/OpenAI engine
│   └── server.js           # Local Express development server
├── public/
│   ├── index.html          # Clean desktop/web UI
│   ├── style.css           # Modern dark-theme styling
│   └── app.js              # Frontend controller & Vercel API bridge
├── vercel.json             # Vercel routing configuration
├── .gitignore              # Protects keys and dependencies
└── package.json            # Node.js project & dependencies
```
