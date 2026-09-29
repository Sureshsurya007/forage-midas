// PromptForge Desktop & Vercel Assistant Front-end Logic

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const minimalInput = document.getElementById("minimalInput");
  const enhanceBtn = document.getElementById("enhanceBtn");
  const pipelineBtn = document.getElementById("pipelineBtn");
  const providerSelect = document.getElementById("providerSelect");
  const categorySelect = document.getElementById("categorySelect");
  const statusIndicator = document.getElementById("statusIndicator");
  const loader = document.getElementById("loader");
  const loaderText = document.getElementById("loaderText");
  const outputSection = document.getElementById("outputSection");
  
  const engineeredPromptText = document.getElementById("engineeredPromptText");
  const personaTag = document.getElementById("personaTag");
  const categoryTag = document.getElementById("categoryTag");
  const enhancementsList = document.getElementById("enhancementsList");
  const engineBadge = document.getElementById("engineBadge");
  const copyPromptBtn = document.getElementById("copyPromptBtn");
  const runEngineeredBtn = document.getElementById("runEngineeredBtn");

  const finalResultBody = document.getElementById("finalResultBody");
  const providerBadge = document.getElementById("providerBadge");
  const copyResultBtn = document.getElementById("copyResultBtn");

  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");

  const settingsBtn = document.getElementById("settingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const closeSettingsBtn = document.getElementById("closeSettingsBtn");
  const cancelSettingsBtn = document.getElementById("cancelSettingsBtn");
  const saveKeysBtn = document.getElementById("saveKeysBtn");
  const geminiKeyInput = document.getElementById("geminiKeyInput");
  const openaiKeyInput = document.getElementById("openaiKeyInput");

  // Load stored keys from localStorage
  geminiKeyInput.value = localStorage.getItem("promptforge_gemini_key") || "";
  openaiKeyInput.value = localStorage.getItem("promptforge_openai_key") || "";

  let history = JSON.parse(localStorage.getItem("promptforge_history") || "[]");

  // Helper to build headers with custom API keys (crucial for Vercel)
  function getRequestHeaders() {
    const headers = { "Content-Type": "application/json" };
    const geminiKey = localStorage.getItem("promptforge_gemini_key");
    const openaiKey = localStorage.getItem("promptforge_openai_key");
    if (geminiKey) headers["x-gemini-key"] = geminiKey;
    if (openaiKey) headers["x-openai-key"] = openaiKey;
    return headers;
  }

  // Load Status on launch
  fetchStatus();
  renderHistory();

  // Chips click
  document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
      minimalInput.value = chip.dataset.query;
      minimalInput.focus();
    });
  });

  // Settings Modal controls
  settingsBtn.addEventListener("click", () => {
    settingsModal.classList.remove("hidden");
  });

  const closeModal = () => settingsModal.classList.add("hidden");
  closeSettingsBtn.addEventListener("click", closeModal);
  cancelSettingsBtn.addEventListener("click", closeModal);

  saveKeysBtn.addEventListener("click", async () => {
    saveKeysBtn.disabled = true;
    saveKeysBtn.textContent = "Saving...";
    const geminiVal = geminiKeyInput.value.trim();
    const openaiVal = openaiKeyInput.value.trim();

    // Persist in browser localStorage for Vercel
    if (geminiVal) localStorage.setItem("promptforge_gemini_key", geminiVal);
    else localStorage.removeItem("promptforge_gemini_key");

    if (openaiVal) localStorage.setItem("promptforge_openai_key", openaiVal);
    else localStorage.removeItem("promptforge_openai_key");

    try {
      const res = await fetch("/api/save-keys", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          geminiApiKey: geminiVal,
          openaiApiKey: openaiVal
        })
      });
      const data = await res.json();
      updateStatusDisplay(data);
      closeModal();
    } catch (e) {
      // Even if server call fails (e.g. read-only serverless), local keys are saved!
      updateStatusDisplay({
        geminiAvailable: Boolean(geminiVal),
        openaiAvailable: Boolean(openaiVal)
      });
      closeModal();
    } finally {
      saveKeysBtn.disabled = false;
      saveKeysBtn.textContent = "Save & Apply";
    }
  });

  async function fetchStatus() {
    try {
      const res = await fetch("/api/status", {
        headers: getRequestHeaders()
      });
      const data = await res.json();
      updateStatusDisplay(data);
    } catch (e) {
      statusIndicator.querySelector(".status-label").textContent = "Offline Mode";
    }
  }

  function updateStatusDisplay(data) {
    const label = statusIndicator.querySelector(".status-label");
    const hasLocalGemini = Boolean(localStorage.getItem("promptforge_gemini_key"));
    const hasLocalOpenai = Boolean(localStorage.getItem("promptforge_openai_key"));

    const geminiActive = data?.geminiAvailable || hasLocalGemini;
    const openaiActive = data?.openaiAvailable || hasLocalOpenai;

    if (geminiActive && openaiActive) {
      statusIndicator.className = "status-indicator online";
      label.textContent = "Gemini & OpenAI Ready";
    } else if (geminiActive) {
      statusIndicator.className = "status-indicator online";
      label.textContent = "Gemini Ready";
      providerSelect.value = "gemini";
    } else if (openaiActive) {
      statusIndicator.className = "status-indicator online";
      label.textContent = "OpenAI Ready";
      providerSelect.value = "openai";
    } else {
      statusIndicator.className = "status-indicator";
      label.textContent = "Offline Synthesizer (Add Keys in Settings)";
    }
  }

  // 1. Enhance Only Action
  enhanceBtn.addEventListener("click", async () => {
    const input = minimalInput.value.trim();
    if (!input) {
      alert("Please enter a short request or thought first.");
      minimalInput.focus();
      return;
    }

    showLoader("Analyzing latent goals and structuring Master Prompt...");
    try {
      const res = await fetch("/api/enhance", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          input,
          provider: providerSelect.value,
          category: categorySelect.value
        })
      });

      if (!res.ok) throw new Error((await res.json()).error || "Enhance failed");
      const data = await res.json();

      displayEnhancement(data);
      finalResultBody.innerHTML = `<div class="empty-state">Your Master Prompt is ready on the left. Click <strong>"▶ Run Now"</strong> or copy it to ChatGPT/Gemini.</div>`;
      providerBadge.textContent = "Awaiting Run";

      saveToHistory(input, data.engineeredPrompt, null, data.intentAnalysis);
    } catch (err) {
      alert("Enhance failed: " + err.message);
    } finally {
      hideLoader();
    }
  });

  // 2. Enhance & Run Pipeline Action
  pipelineBtn.addEventListener("click", async () => {
    const input = minimalInput.value.trim();
    if (!input) {
      alert("Please enter a short request or thought first.");
      minimalInput.focus();
      return;
    }

    showLoader("Architecting prompt and generating final deliverable via " + providerSelect.value.toUpperCase() + "...");
    try {
      const res = await fetch("/api/pipeline", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          input,
          provider: providerSelect.value,
          category: categorySelect.value
        })
      });

      if (!res.ok) throw new Error((await res.json()).error || "Pipeline failed");
      const data = await res.json();

      displayEnhancement(data.enhanced);
      displayResult(data.result);

      saveToHistory(input, data.enhanced.engineeredPrompt, data.result.output, data.enhanced.intentAnalysis);
    } catch (err) {
      alert("Execution failed: " + err.message);
    } finally {
      hideLoader();
    }
  });

  // 3. Run Manually Edited Master Prompt
  runEngineeredBtn.addEventListener("click", async () => {
    const prompt = engineeredPromptText.value.trim();
    if (!prompt) return;

    showLoader("Executing custom prompt on " + providerSelect.value.toUpperCase() + "...");
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: getRequestHeaders(),
        body: JSON.stringify({
          prompt,
          provider: providerSelect.value
        })
      });

      if (!res.ok) throw new Error((await res.json()).error || "Run failed");
      const data = await res.json();
      displayResult(data);
    } catch (err) {
      alert("Run error: " + err.message);
    } finally {
      hideLoader();
    }
  });

  function displayEnhancement(data) {
    outputSection.classList.remove("hidden");
    engineeredPromptText.value = data.engineeredPrompt || "";

    const analysis = data.intentAnalysis || {};
    personaTag.textContent = analysis.targetPersona || "General Expert";
    categoryTag.textContent = analysis.category || "General";
    engineBadge.textContent = analysis.engineUsed ? analysis.engineUsed.split(" ")[0] : "Synthesizer";

    enhancementsList.innerHTML = "";
    if (analysis.keyEnhancements && Array.isArray(analysis.keyEnhancements)) {
      analysis.keyEnhancements.forEach(item => {
        const pill = document.createElement("span");
        pill.className = "pill-tag";
        pill.textContent = "✓ " + item;
        enhancementsList.appendChild(pill);
      });
    }

    outputSection.scrollIntoView({ behavior: "smooth" });
  }

  function displayResult(result) {
    outputSection.classList.remove("hidden");
    providerBadge.textContent = `${result.provider} (${result.model || "Ready"})`;

    if (window.marked) {
      finalResultBody.innerHTML = marked.parse(result.output);
    } else {
      finalResultBody.textContent = result.output;
    }
  }

  // Copy Buttons
  copyPromptBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(engineeredPromptText.value);
    flashButton(copyPromptBtn, "✓ Copied!");
  });

  copyResultBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(finalResultBody.innerText);
    flashButton(copyResultBtn, "✓ Copied!");
  });

  function flashButton(btn, text) {
    const orig = btn.textContent;
    btn.textContent = text;
    setTimeout(() => { btn.textContent = orig; }, 1800);
  }

  function showLoader(msg) {
    loaderText.textContent = msg;
    loader.classList.remove("hidden");
  }

  function hideLoader() {
    loader.classList.add("hidden");
  }

  // History System
  function saveToHistory(rawInput, prompt, result, analysis) {
    const item = {
      id: Date.now(),
      rawInput,
      prompt,
      result,
      analysis,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    history.unshift(item);
    if (history.length > 20) history.pop();
    localStorage.setItem("promptforge_history", JSON.stringify(history));
    renderHistory();
  }

  function renderHistory() {
    if (!history.length) {
      historyList.innerHTML = `<div class="empty-history">Your generated prompts and deliverables will be saved here for quick access.</div>`;
      return;
    }

    historyList.innerHTML = "";
    history.forEach(item => {
      const el = document.createElement("div");
      el.className = "history-item";
      el.innerHTML = `
        <div class="hist-title">${escapeHtml(item.rawInput)}</div>
        <div class="hist-meta">
          <span>${item.analysis?.category || "Task"}</span>
          <span>${item.time}</span>
        </div>
      `;
      el.addEventListener("click", () => {
        minimalInput.value = item.rawInput;
        displayEnhancement({
          engineeredPrompt: item.prompt,
          intentAnalysis: item.analysis
        });
        if (item.result) {
          displayResult({
            output: item.result,
            provider: "History",
            model: "Saved"
          });
        }
      });
      historyList.appendChild(el);
    });
  }

  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Clear all recent prompt history?")) {
      history = [];
      localStorage.removeItem("promptforge_history");
      renderHistory();
    }
  });

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
});
