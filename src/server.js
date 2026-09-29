import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { PromptEngine } from "./promptEngine.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, "..");

// Load .env
dotenv.config({ path: path.join(projectRoot, ".env") });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(projectRoot, "public")));

const engine = new PromptEngine({
  geminiApiKey: process.env.GEMINI_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini"
});

// Status check
app.get("/api/status", (req, res) => {
  res.json({
    status: "online",
    ...engine.getStatus()
  });
});

// Update / save keys
app.post("/api/save-keys", (req, res) => {
  const { geminiApiKey, openaiApiKey } = req.body;
  engine.updateKeys({ geminiApiKey, openaiApiKey });

  // Update .env file if it exists
  const envPath = path.join(projectRoot, ".env");
  try {
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
    if (geminiApiKey !== undefined) {
      if (envContent.includes("GEMINI_API_KEY=")) {
        envContent = envContent.replace(/GEMINI_API_KEY=.*/g, `GEMINI_API_KEY=${geminiApiKey}`);
      } else {
        envContent += `\nGEMINI_API_KEY=${geminiApiKey}`;
      }
    }
    if (openaiApiKey !== undefined) {
      if (envContent.includes("OPENAI_API_KEY=")) {
        envContent = envContent.replace(/OPENAI_API_KEY=.*/g, `OPENAI_API_KEY=${openaiApiKey}`);
      } else {
        envContent += `\nOPENAI_API_KEY=${openaiApiKey}`;
      }
    }
    fs.writeFileSync(envPath, envContent.trim() + "\n", "utf8");
  } catch (err) {
    console.warn("Could not save to .env file:", err.message);
  }

  res.json({ success: true, ...engine.getStatus() });
});

// Enhance a minimal prompt
app.post("/api/enhance", async (req, res) => {
  try {
    const { input, provider, model, category } = req.body;
    if (!input || !input.trim()) {
      return res.status(400).json({ error: "Input prompt is required." });
    }

    const enhanced = await engine.enhancePrompt(input, { provider, model, category });
    res.json(enhanced);
  } catch (err) {
    console.error("Enhance error:", err);
    res.status(500).json({ error: err.message || "Failed to enhance prompt" });
  }
});

// Execute an engineered prompt
app.post("/api/execute", async (req, res) => {
  try {
    const { prompt, provider, model } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt text is required." });
    }

    const result = await engine.executePrompt(prompt, { provider, model });
    res.json(result);
  } catch (err) {
    console.error("Execute error:", err);
    res.status(500).json({ error: err.message || "Failed to execute prompt" });
  }
});

// Full Pipeline: Enhance and Execute in one shot
app.post("/api/pipeline", async (req, res) => {
  try {
    const { input, provider, model, category } = req.body;
    if (!input || !input.trim()) {
      return res.status(400).json({ error: "Input prompt is required." });
    }

    const enhanced = await engine.enhancePrompt(input, { provider, model, category });
    const executed = await engine.executePrompt(enhanced.engineeredPrompt, { provider, model });

    res.json({
      enhanced,
      result: executed
    });
  } catch (err) {
    console.error("Pipeline error:", err);
    res.status(500).json({ error: err.message || "Pipeline execution failed" });
  }
});

app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 PromptForge Desktop Assistant running at:`);
  console.log(`   http://localhost:${PORT}`);
  console.log(`======================================================\n`);
});
