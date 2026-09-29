import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";

/**
 * Intelligent fallback generator when API keys are not yet configured.
 * Guarantees the user can test and experience the app immediately.
 */
function ruleBasedPromptEnhancer(minimalInput, category = "auto") {
  const input = minimalInput.trim();
  const lower = input.toLowerCase();

  let detectedRole = "Expert Consultant & Problem Solver";
  let detectedCategory = "General";
  let formatGuide = "Structured markdown with clear headings, bulleted rationale, and immediate action items.";
  let constraints = [
    "Eliminate vague fluff and generic advice; focus on actionable high-yield steps.",
    "Present information in clear, progressive order.",
    "Include edge cases and quality check considerations."
  ];

  if (lower.includes("code") || lower.includes("python") || lower.includes("script") || lower.includes("javascript") || lower.includes("react") || lower.includes("bug") || lower.includes("api") || lower.includes("function")) {
    detectedRole = "Principal Software Architect & Senior Full-Stack Engineer";
    detectedCategory = "Software Development";
    formatGuide = "Production-grade code blocks with concise annotations, architecture breakdown, error handling, and setup instructions.";
    constraints = [
      "Follow clean-code best practices and modern language standards.",
      "Include defensive error handling and input validation.",
      "Provide step-by-step verification commands or test cases."
    ];
  } else if (lower.includes("email") || lower.includes("boss") || lower.includes("client") || lower.includes("leave") || lower.includes("salary") || lower.includes("message")) {
    detectedRole = "Executive Communication Specialist & High-Stakes Negotiator";
    detectedCategory = "Professional Communication";
    formatGuide = "Polished email with Subject line, Greeting, Clear Opening, Bulleted Context/Value, Call to Action, and Professional Sign-off. Include 2 tone variations (Warm Professional & Direct Concierge).";
    constraints = [
      "Maintain respectful, assertive, and constructive tone.",
      "Clear call to action with low friction for the reader.",
      "Avoid passive-aggressive or apologetic wording where confidence is required."
    ];
  } else if (lower.includes("plan") || lower.includes("workout") || lower.includes("diet") || lower.includes("study") || lower.includes("routine") || lower.includes("schedule")) {
    detectedRole = "Performance Coach & Tactical Strategist";
    detectedCategory = "Action Planning & Productivity";
    formatGuide = "Day-by-day or phased tactical timetable, milestone tracking metrics, and contingency strategies for obstacles.";
    constraints = [
      "Must be realistic, sustainable, and directly aligned with short-term wins.",
      "Include measurable checkpoints and tracking indicators.",
      "Provide a 'Fast-Track' quick start version for day one."
    ];
  } else if (lower.includes("write") || lower.includes("blog") || lower.includes("article") || lower.includes("story") || lower.includes("post")) {
    detectedRole = "Master Content Strategist & Compelling Storyteller";
    detectedCategory = "Content Creation";
    formatGuide = "High-retention structure: Magnetic Hook, Core Problem/Thesis, Value-Packed Insights with Examples, and Memorable Conclusion/CTA.";
    constraints = [
      "Avoid overused clichés and AI buzzwords.",
      "Use active voice, strong sensory verbs, and compelling pacing.",
      "Ensure high readability and natural human tone."
    ];
  }

  const engineeredPrompt = `
### Role & Persona
You are an elite **${detectedRole}**. You possess deep domain mastery, rigorous analytical thinking, and the ability to turn abstract objectives into high-impact, immediately actionable results.

### Objective & Core Goal
The user requires a comprehensive solution for:
> "${input}"

Your mission is to understand both their immediate need and their broader underlying goals, delivering a top-tier deliverable that exceeds standard AI answers in depth, precision, and practical utility.

### Essential Context & Requirements
- **Target Audience / Domain:** ${detectedCategory}
- **Primary Deliverable:** High-value, ready-to-use output that solves the core problem immediately.
- **Depth:** Thorough yet structured for rapid skimming and quick execution.

### Key Constraints & Quality Standards
${constraints.map((c, i) => `${i + 1}. ${c}`).join("\n")}

### Expected Output Structure
${formatGuide}
`.trim();

  return {
    engineeredPrompt,
    intentAnalysis: {
      detectedGoal: input,
      targetPersona: detectedRole,
      category: detectedCategory,
      keyEnhancements: [
        "Injected professional persona and domain authority",
        "Formulated rigorous constraints to eliminate generic fluff",
        "Defined an explicit output structure with high-leverage deliverables"
      ],
      engineUsed: "Rule-Based Synthesizer (Configure API key for full AI synthesis)"
    }
  };
}

export class PromptEngine {
  constructor(config = {}) {
    this.geminiApiKey = config.geminiApiKey || process.env.GEMINI_API_KEY || "";
    this.openaiApiKey = config.openaiApiKey || process.env.OPENAI_API_KEY || "";
    this.geminiModel = config.geminiModel || process.env.GEMINI_MODEL || "gemini-2.5-flash";
    this.openaiModel = config.openaiModel || process.env.OPENAI_MODEL || "gpt-4o-mini";
  }

  updateKeys({ geminiApiKey, openaiApiKey }) {
    if (geminiApiKey !== undefined) this.geminiApiKey = geminiApiKey.trim();
    if (openaiApiKey !== undefined) this.openaiApiKey = openaiApiKey.trim();
  }

  getStatus() {
    return {
      geminiAvailable: Boolean(this.geminiApiKey && this.geminiApiKey.length > 5),
      openaiAvailable: Boolean(this.openaiApiKey && this.openaiApiKey.length > 5),
      defaultGeminiModel: this.geminiModel,
      defaultOpenaiModel: this.openaiModel
    };
  }

  /**
   * Enhances a minimal user prompt into an authoritative, high-impact prompt.
   */
  async enhancePrompt(minimalInput, options = {}) {
    const provider = options.provider || (this.geminiApiKey ? "gemini" : (this.openaiApiKey ? "openai" : "fallback"));

    if (provider === "gemini" && this.geminiApiKey) {
      try {
        return await this._enhanceWithGemini(minimalInput, options);
      } catch (err) {
        console.warn("Gemini enhancement failed, trying fallback:", err.message);
      }
    } else if (provider === "openai" && this.openaiApiKey) {
      try {
        return await this._enhanceWithOpenAI(minimalInput, options);
      } catch (err) {
        console.warn("OpenAI enhancement failed, trying fallback:", err.message);
      }
    }

    // Default or Fallback rule-based synthesizer
    return ruleBasedPromptEnhancer(minimalInput, options.category);
  }

  async _enhanceWithGemini(minimalInput, options = {}) {
    const genAI = new GoogleGenerativeAI(this.geminiApiKey);
    const model = genAI.getGenerativeModel({ model: options.model || this.geminiModel });

    const systemInstruction = `
You are the world's foremost Prompt Architect and Meta-Prompt Engineer.
A user has a specific outcome they want to achieve, but they gave only a minimal, brief, or rough request.
Your job:
1. Deconstruct their underlying goals, short-term needs, and desired standard of excellence.
2. Construct a complete, high-impact, professional prompt designed to get the BEST possible output from any modern LLM.
3. The engineered prompt MUST include:
   - Role / Persona: The ideal expert persona.
   - Context & Objective: Detailed articulation of the goal.
   - Constraints & Guardrails: Strict quality criteria, avoiding clichés or superficiality.
   - Deliverables & Output Schema: Exact formatting guidelines (tables, markdown, code, steps, etc.).
4. Return ONLY valid JSON in the exact schema:
{
  "engineeredPrompt": "full high-impact prompt text here",
  "intentAnalysis": {
    "detectedGoal": "short summary of the real goal",
    "targetPersona": "ideal persona",
    "category": "e.g., Coding, Business, Creative, Planning, Writing",
    "keyEnhancements": ["enhancement 1", "enhancement 2", "enhancement 3"]
  }
}
Do not wrap in markdown quotes if possible, or use standard json formatting.
`;

    const promptText = `${systemInstruction}\n\nUSER'S MINIMAL INPUT: "${minimalInput}"\n\nGenerate the JSON now:`;
    const result = await model.generateContent(promptText);
    const rawText = result.response.text();
    return this._cleanAndParseJSON(rawText, minimalInput);
  }

  async _enhanceWithOpenAI(minimalInput, options = {}) {
    const openai = new OpenAI({ apiKey: this.openaiApiKey });
    const response = await openai.chat.completions.create({
      model: options.model || this.openaiModel,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are the world's foremost Prompt Architect and Meta-Prompt Engineer.
A user has a specific outcome they want to achieve, but they gave only a minimal, brief, or rough request.
Deconstruct their intent and output JSON with:
{
  "engineeredPrompt": "full high-impact prompt text",
  "intentAnalysis": {
    "detectedGoal": "summary of true goal",
    "targetPersona": "ideal persona",
    "category": "Coding | Business | Creative | Planning | Productivity | Other",
    "keyEnhancements": ["...", "..."]
  }
}`
        },
        {
          role: "user",
          content: `Minimal user input: "${minimalInput}"`
        }
      ],
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content);
    return {
      ...parsed,
      intentAnalysis: {
        ...parsed.intentAnalysis,
        engineUsed: "OpenAI (" + (options.model || this.openaiModel) + ")"
      }
    };
  }

  /**
   * Executes the engineered prompt on the selected AI model to produce the final deliverable.
   */
  async executePrompt(promptText, options = {}) {
    const provider = options.provider || (this.geminiApiKey ? "gemini" : (this.openaiApiKey ? "openai" : "none"));

    if (provider === "gemini") {
      if (!this.geminiApiKey) throw new Error("Gemini API key is not configured.");
      const genAI = new GoogleGenerativeAI(this.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: options.model || this.geminiModel });
      const result = await model.generateContent(promptText);
      return {
        output: result.response.text(),
        provider: "Gemini",
        model: options.model || this.geminiModel
      };
    } else if (provider === "openai") {
      if (!this.openaiApiKey) throw new Error("OpenAI API key is not configured.");
      const openai = new OpenAI({ apiKey: this.openaiApiKey });
      const response = await openai.chat.completions.create({
        model: options.model || this.openaiModel,
        messages: [{ role: "user", content: promptText }]
      });
      return {
        output: response.choices[0].message.content,
        provider: "OpenAI",
        model: options.model || this.openaiModel
      };
    } else {
      return {
        output: `[Notice: Please provide your Gemini or OpenAI API Key in the Settings menu to run live generation]\n\nYour engineered prompt is ready! You can copy it above and paste it directly into ChatGPT, Gemini, Claude, or add your API key in the Settings button to execute it right inside this assistant.`,
        provider: "Offline Preview",
        model: "N/A"
      };
    }
  }

  _cleanAndParseJSON(rawText, fallbackInput) {
    try {
      let cleaned = rawText.trim();
      if (cleaned.startsWith("```json")) {
        cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
      } else if (cleaned.startsWith("```")) {
        cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
      }
      const data = JSON.parse(cleaned);
      if (!data.intentAnalysis) {
        data.intentAnalysis = {};
      }
      data.intentAnalysis.engineUsed = "Google Gemini (" + this.geminiModel + ")";
      return data;
    } catch (e) {
      console.warn("JSON parse error on prompt expansion:", e.message);
      return ruleBasedPromptEnhancer(fallbackInput);
    }
  }
}
