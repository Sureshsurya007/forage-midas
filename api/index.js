import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PromptEngine } from "../src/promptEngine.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const baseEngine = new PromptEngine({
  geminiApiKey: process.env.GEMINI_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
  openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini"
});

// Middleware to support user-provided keys from the browser UI (ideal for serverless Vercel)
function resolveEngine(req) {
  const customGemini = req.headers["x-gemini-key"] || req.body?.geminiApiKey;
  const customOpenai = req.headers["x-openai-key"] || req.body?.openaiApiKey;

  if (customGemini || customOpenai) {
    return new PromptEngine({
      geminiApiKey: customGemini || process.env.GEMINI_API_KEY,
      openaiApiKey: customOpenai || process.env.OPENAI_API_KEY,
      geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash",
      openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini"
    });
  }
  return baseEngine;
}

app.get("/api/status", (req, res) => {
  const engine = resolveEngine(req);
  res.json({
    status: "online",
    deployment: "Vercel Serverless",
    ...engine.getStatus()
  });
});

app.post("/api/save-keys", (req, res) => {
  const { geminiApiKey, openaiApiKey } = req.body;
  if (geminiApiKey) baseEngine.updateKeys({ geminiApiKey });
  if (openaiApiKey) baseEngine.updateKeys({ openaiApiKey });

  res.json({
    success: true,
    message: "Keys updated for current session",
    ...baseEngine.getStatus()
  });
});

app.post("/api/enhance", async (req, res) => {
  try {
    const { input, provider, model, category } = req.body;
    if (!input || !input.trim()) {
      return res.status(400).json({ error: "Input prompt is required." });
    }

    const engine = resolveEngine(req);
    const enhanced = await engine.enhancePrompt(input, { provider, model, category });
    res.json(enhanced);
  } catch (err) {
    console.error("Enhance error:", err);
    res.status(500).json({ error: err.message || "Failed to enhance prompt" });
  }
});

app.post("/api/execute", async (req, res) => {
  try {
    const { prompt, provider, model } = req.body;
    if (!prompt || !prompt.trim()) {
      return res.status(400).json({ error: "Prompt text is required." });
    }

    const engine = resolveEngine(req);
    const result = await engine.executePrompt(prompt, { provider, model });
    res.json(result);
  } catch (err) {
    console.error("Execute error:", err);
    res.status(500).json({ error: err.message || "Failed to execute prompt" });
  }
});

app.post("/api/pipeline", async (req, res) => {
  try {
    const { input, provider, model, category } = req.body;
    if (!input || !input.trim()) {
      return res.status(400).json({ error: "Input prompt is required." });
    }

    const engine = resolveEngine(req);
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

export default app;
