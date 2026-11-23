import React, { useState, useEffect, useRef, useCallback } from "react";
import "./InteractiveChat.css";
import { API_BASE_URL } from "../config";

/**
 * Client-side clinical answering engine for instant, reliable responses
 * even when offline or before backend is reachable.
 */
function generateClinicalFallback(prompt, analysis, reportFilename) {
  const query = prompt.toLowerCase().trim();
  const biomarkers = analysis?.biomarkers || [];
  const findings = analysis?.findings || [];
  const impression = analysis?.impression || "";
  const concern = analysis?.concern_level || {};
  const doctorQuestions = analysis?.doctor_questions || [];
  const patterns = analysis?.patterns || [];

  // 1. Abnormal / High / Low tests
  if (
    query.includes("abnormal") ||
    query.includes("high") ||
    query.includes("low") ||
    query.includes("out of range") ||
    query.includes("concern") ||
    query.includes("value")
  ) {
    const abnormals = biomarkers.filter(
      (b) => b.status === "high" || b.status === "low"
    );
    if (abnormals.length > 0) {
      const lines = [
        "Here are the parameters from your report that are outside the standard reference range:\n",
      ];
      abnormals.forEach((b) => {
        const sym = b.status === "high" ? "🔺 High" : "🔻 Low";
        lines.push(`- **${b.name}**: **${b.value} ${b.unit || ""}** (${sym})`);
        lines.push(`  *Standard Range:* ${b.reference_range || "Not specified"}`);
        if (b.status_explanation) {
          lines.push(`  *Note:* ${b.status_explanation}`);
        }
      });
      lines.push(
        "\n💡 *Recommendation:* Discuss these flagged values with your physician during your next consultation."
      );
      return {
        reply: lines.join("\n"),
        sources: abnormals.slice(0, 5).map((b) => ({
          name: b.name,
          value: b.value,
          unit: b.unit,
          status: b.status,
        })),
      };
    } else if (biomarkers.length > 0) {
      return {
        reply:
          "✅ **Good news!** All detected biomarkers in this report are currently within their typical reference ranges.",
        sources: [],
      };
    } else if (findings.length > 0) {
      return {
        reply: `Here are the identified observations from your diagnostic scan:\n\n${findings.map((f) => `- **${f.organ || "Observation"}**: ${f.observation || f.text}`).join("\n")}`,
        sources: [],
      };
    } else {
      return {
        reply:
          "No specific out-of-range biomarkers were identified in the currently active report.",
        sources: [],
      };
    }
  }

  // 2. Impression / Summary / Diagnosis
  if (
    query.includes("impression") ||
    query.includes("summary") ||
    query.includes("mean") ||
    query.includes("explain") ||
    query.includes("diagnos")
  ) {
    const lines = [];
    if (impression) {
      lines.push(`### 📋 Clinical Impression\n**${impression}**\n`);
    }
    if (concern.label) {
      lines.push(`**Triage Assessment:** ${concern.label} — ${concern.description || ""}\n`);
    }
    if (patterns.length > 0) {
      lines.push("### 🧬 Observed Patterns:");
      patterns.forEach((p) => {
        lines.push(`- **${p.pattern || p.name}**: ${p.explanation || p.description || ""}`);
      });
    }
    if (lines.length === 0) {
      lines.push(
        "Your report has been analyzed. You can inspect individual lab values and organ metrics in the main analysis dashboard."
      );
    }
    return { reply: lines.join("\n"), sources: [] };
  }

  // 3. Doctor Questions
  if (
    query.includes("doctor") ||
    query.includes("question") ||
    query.includes("ask") ||
    query.includes("appointment") ||
    query.includes("consult")
  ) {
    if (doctorQuestions.length > 0) {
      const lines = [
        "### 🩺 Suggested Questions for Your Doctor:\nHere are targeted questions tailored to your report findings:",
      ];
      doctorQuestions.forEach((q, i) => {
        lines.push(`${i + 1}. ${q}`);
      });
      return { reply: lines.join("\n"), sources: [] };
    }
    return {
      reply:
        "1. Do my test values require any repeat testing or follow-up imaging?\n2. Are there specific dietary or lifestyle modifications you recommend?\n3. Do I need any supportive medications or supplements?",
      sources: [],
    };
  }

  // 4. Specific biomarker check
  for (const b of biomarkers) {
    const nameLower = (b.name || "").toLowerCase();
    if (nameLower && (query.includes(nameLower) || nameLower.split(" ").some(part => part.length > 3 && query.includes(part)))) {
      const statusText = (b.status || "normal").toUpperCase();
      return {
        reply: `### 🧪 **${b.name}**\n\n- **Your Result:** \`${b.value} ${b.unit || ""}\`\n- **Reference Range:** \`${b.reference_range || "Standard laboratory range"}\`\n- **Evaluation:** **${statusText}**\n\n**Clinical Context:** ${b.status_explanation || "Measured as part of your comprehensive health panel."}`,
        sources: [
          { name: b.name, value: b.value, unit: b.unit, status: b.status },
        ],
      };
    }
  }

  // 5. Diet / Nutrition / Lifestyle
  if (
    query.includes("diet") ||
    query.includes("food") ||
    query.includes("eat") ||
    query.includes("lifestyle") ||
    query.includes("exercise") ||
    query.includes("nutrition")
  ) {
    return {
      reply:
        "### 🥗 General Health & Wellness Guidelines:\n\n- **Hydration:** Aim for 2–3 liters of water daily unless restricted by your physician.\n- **Balanced Nutrition:** Focus on high-fiber whole foods, lean proteins, vegetables, and complex grains.\n- **Physical Activity:** Aim for at least 150 minutes of moderate aerobic exercise weekly.\n- **Restorative Sleep:** Maintain 7–8 hours of consistent sleep nightly.\n\n⚠️ *Always confirm specific dietary or fitness changes with your physician.*",
      sources: [],
    };
  }

  // 6. Default general guidance
  return {
    reply: reportFilename
      ? `I am ready to help you explore **${reportFilename}**! You can ask:\n\n- *'Which values are abnormal or outside range?'*\n- *'Can you explain my clinical impression?'*\n- *'What questions should I ask my doctor?'*\n- *'Tell me about my Hemoglobin / Glucose / Cholesterol'*`
      : "I am ready to assist you! Upload a report or ask me about abnormal test parameters, clinical impressions, or questions to ask your physician.",
    sources: [],
  };
}

export function InteractiveChat({
  isOpen,
  onToggle,
  reportId,
  reportFilename,
  analysis,
  language,
  getToken,
  t,
}) {
  const getGreeting = useCallback((filename) => ({
    role: "assistant",
    content: filename
      ? t.chatGreetingReport.replace("{filename}", filename)
      : t.chatGreetingGeneral,
    sources: [],
    created_at: new Date().toISOString(),
  }), [t]);

  const [messages, setMessages] = useState(() => [getGreeting(reportFilename)]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Keep greeting synchronized if a report is opened or changed
  useEffect(() => {
    setMessages((current) => current.length <= 1 ? [getGreeting(reportFilename)] : current);
  }, [reportFilename, getGreeting]);

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      inputRef.current?.focus();
    }
  }, [isOpen, reportId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const fetchHistory = async () => {
    // If it's a client-only localStorage report, keep local greeting
    const isLocal = reportId && String(reportId).startsWith("local_");
    if (isLocal) {
      setMessages((prev) => (prev.length > 0 ? prev : [getGreeting(reportFilename)]));
      return;
    }

    try {
      const url = reportId
        ? `${API_BASE_URL}/api/chat/history?report_id=${encodeURIComponent(reportId)}`
        : `${API_BASE_URL}/api/chat/history`;

      const token = await getToken();
      const res = await fetch(url, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          return;
        }
      }
    } catch (err) {
      console.warn("Could not load chat history from server:", err);
    }

    // Always ensure at least the welcoming message is present so screen is never blank
    setMessages((prev) => (prev.length > 0 ? prev : [getGreeting(reportFilename)]));
  };

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    setInputMessage("");
    const userMsg = {
      role: "user",
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    const isLocal = reportId && String(reportId).startsWith("local_");
    const reportPayload = analysis
      ? {
          report_type: analysis.report_type || "laboratory",
          filename: reportFilename || "Medical Report",
          analysis: analysis,
          biomarkers: analysis.biomarkers || [],
          findings: analysis.findings || [],
          impression: analysis.impression || "",
          concern_level: analysis.concern_level || null,
          doctor_questions: analysis.doctor_questions || [],
        }
      : null;

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: text,
          report_id: reportId && !isLocal ? reportId : null,
          language: language || "en",
          report_data: reportPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server status ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg = {
        role: "assistant",
        content: data.reply,
        sources: data.sources || [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn("Backend chat unavailable, using instant clinical knowledge engine:", err);
      // Instant clinical fallback reply based on active report
      const fallback = generateClinicalFallback(text, analysis, reportFilename);
      const assistantMsg = {
        role: "assistant",
        content: fallback.reply,
        sources: fallback.sources || [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear this conversation history?")) return;
    try {
      const isLocal = reportId && String(reportId).startsWith("local_");
      if (!isLocal) {
        const url = reportId
          ? `${API_BASE_URL}/api/chat/history?report_id=${encodeURIComponent(reportId)}`
          : `${API_BASE_URL}/api/chat/history`;

        const token = await getToken();
        await fetch(url, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
      }
    } catch (err) {
      console.warn("Could not clear history on server:", err);
    }
    setMessages([
      {
        role: "assistant",
        content: "Conversation history cleared. How can I help you today?",
        sources: [],
        created_at: new Date().toISOString(),
      },
    ]);
  };

  const quickPrompts = [
    { label: t.chatPromptAbnormal, prompt: "Which of my test results are abnormal or outside the standard range?" },
    { label: t.chatPromptImpression, prompt: "Can you explain the clinical impression of my report in simple words?" },
    { label: t.chatPromptDoctor, prompt: "What questions should I ask my doctor during my next consultation?" },
    { label: t.chatPromptDiet, prompt: "What dietary or lifestyle advice is relevant for these test results?" },
  ];

  // Helper to render markdown formatting: bold, headings, bullet lines
  const renderFormattedContent = (content) => {
    if (!content) return "";
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="chat-heading">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="chat-heading-lg">{line.replace("## ", "")}</h3>;
      }
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const itemText = line.trim().replace(/^[-*]\s+/, "");
        return (
          <li key={idx} className="chat-bullet-item">
            {renderInlineMarkdown(itemText)}
          </li>
        );
      }
      if (/^\d+\.\s+/.test(line.trim())) {
        return (
          <div key={idx} className="chat-numbered-item">
            {renderInlineMarkdown(line.trim())}
          </div>
        );
      }
      if (!line.trim()) {
        return <div key={idx} className="chat-line-break" />;
      }
      return <p key={idx} className="chat-paragraph">{renderInlineMarkdown(line)}</p>;
    });
  };

  const renderInlineMarkdown = (text) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith("`") && part.endsWith("`")) {
        return <code key={i} className="chat-code-pill">{part.slice(1, -1)}</code>;
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        className={`floating-chat-trigger ${isOpen ? "is-active" : ""}`}
        onClick={onToggle}
        aria-label={isOpen ? t.chatClose : t.chatOpen}
        title={t.chatAssistant}
      >
        <span className="trigger-icon">{isOpen ? "✕" : "💬"}</span>
        <span className="trigger-label">
          {isOpen ? t.chatClose : t.chatOpen}
        </span>
        {reportId && !isOpen && <span className="trigger-badge">{t.chatReportLinked}</span>}
      </button>

      {/* Slide-out Interactive Chat Drawer */}
      <aside className={`interactive-chat-drawer ${isOpen ? "open" : ""}`} aria-hidden={!isOpen}>
        <div className="chat-drawer-header">
          <div className="header-meta">
            <div className="assistant-avatar">
              <span>🩺</span>
              <span className="online-indicator"></span>
            </div>
            <div className="assistant-info">
              <div className="title-row">
                <h3 className="assistant-name">{t.chatAssistant}</h3>
              </div>
              <p className="assistant-subtitle">
                {reportFilename ? `${t.chatAttached}: ${reportFilename}` : t.chatSubtitle}
              </p>
            </div>
          </div>
          <div className="header-drawer-controls">
            <button
              className="chat-action-btn"
              onClick={handleClearHistory}
              title={t.chatClear}
              aria-label={t.chatClear}
            >
              🗑️
            </button>
            <button
              className="chat-action-btn"
              onClick={onToggle}
              title={t.chatMinimize}
              aria-label={t.chatClose}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="quick-prompts-bar">
          <span className="prompts-label">{t.chatSuggestions}</span>
          <div className="prompts-scroll">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                type="button"
                className="prompt-chip"
                onClick={() => handleSendMessage(qp.prompt)}
                disabled={isLoading}
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message Feed */}
        <div className="chat-messages-container">
          {messages.length === 0 && !isLoading && (
            <div className="chat-message-row assistant-row">
              <div className="msg-avatar">🤖</div>
              <div className="message-bubble assistant-bubble">
                <div className="message-content">
                  <p className="chat-paragraph">
                    {reportFilename
                      ? t.chatGreetingReport.replace("{filename}", reportFilename)
                      : t.chatGreetingGeneral}
                  </p>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`chat-message-row ${isUser ? "user-row" : "assistant-row"}`}
              >
                {!isUser && (
                  <div className="msg-avatar" aria-hidden="true">
                    🤖
                  </div>
                )}
                <div className={`message-bubble ${isUser ? "user-bubble" : "assistant-bubble"}`}>
                  <div className="message-content">
                    {renderFormattedContent(msg.content)}
                  </div>

                  {/* Biomarker Sources / Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="message-sources-group">
                  <span className="sources-label">{t.chatRelatedValues}</span>
                      <div className="sources-pills">
                        {msg.sources.map((src, sIdx) => (
                          <span
                            key={sIdx}
                            className={`source-pill ${
                              src.status === "high"
                                ? "pill-high"
                                : src.status === "low"
                                ? "pill-low"
                                : "pill-normal"
                            }`}
                          >
                            {src.name}: {src.value} {src.unit} ({src.status || "test"})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <span className="message-time">
                    {msg.created_at
                      ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                      : "Just now"}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="chat-message-row assistant-row">
              <div className="msg-avatar">🤖</div>
              <div className="message-bubble assistant-bubble typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-text">{t.chatThinking}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer Footer Note */}
        <div className="chat-disclaimer">
          {t.chatDisclaimer}
        </div>

        {/* Input Form */}
        <form
          className="chat-input-form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="chat-text-input"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={t.chatPlaceholder}
            disabled={isLoading}
            aria-label={t.chatAria}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={isLoading || !inputMessage.trim()}
            aria-label={t.sendButton}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </aside>
    </>
  );
}

export default InteractiveChat;
