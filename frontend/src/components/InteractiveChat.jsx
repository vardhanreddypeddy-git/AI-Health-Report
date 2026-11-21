import React, { useState, useEffect, useRef } from "react";
import "./InteractiveChat.css";
import { API_BASE_URL } from "../config";

export function InteractiveChat({
  isOpen,
  onToggle,
  reportId,
  reportFilename,
  language,
  getToken,
  t,
}) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeEngine, setActiveEngine] = useState("gemini_api");
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
        } else {
          setMessages([
            {
              role: "assistant",
              content: reportId
                ? `Hello! I am your AI Health Assistant. I have analyzed **${reportFilename || "your report"}**. Ask me anything about your test results, impression, or questions for your doctor!`
                : "Hello! I am your AI Health Assistant. Upload a medical report or ask me general questions about clinical lab values, diagnostic imaging, and health wellness.",
              sources: [],
            },
          ]);
        }
      }
    } catch (err) {
      console.warn("Could not load chat history:", err);
    }
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
          report_id: reportId || null,
          language: language || "en",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to process chat query.");
      }

      const data = await res.json();
      setActiveEngine(data.engine || "gemini_api");
      const assistantMsg = {
        role: "assistant",
        content: data.reply,
        sources: data.sources || [],
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `⚠️ Sorry, I encountered an issue: ${err.message}. Please try again.`,
          sources: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Clear this conversation history?")) return;
    try {
      const url = reportId
        ? `${API_BASE_URL}/api/chat/history?report_id=${encodeURIComponent(reportId)}`
        : `${API_BASE_URL}/api/chat/history`;

      const token = await getToken();
      await fetch(url, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMessages([
        {
          role: "assistant",
          content: "Conversation history cleared. How can I help you today?",
          sources: [],
        },
      ]);
    } catch (err) {
      console.warn("Could not clear history:", err);
    }
  };

  const quickPrompts = [
    { label: "🔺 Abnormal Values", prompt: "Which of my test results are abnormal or outside the standard range?" },
    { label: "📋 Explain Impression", prompt: "Can you explain the clinical impression of my report in simple words?" },
    { label: "🩺 Doctor Questions", prompt: "What questions should I ask my doctor during my next consultation?" },
    { label: "🥗 Diet & Wellness", prompt: "What dietary or lifestyle advice is relevant for these test results?" },
  ];

  // Helper to render basic markdown formatting: bold, headings, bullet lines
  const renderFormattedContent = (content) => {
    if (!content) return "";
    const lines = content.split("\n");
    return lines.map((line, idx) => {
      // Check for headings
      if (line.startsWith("### ")) {
        return <h4 key={idx} className="chat-heading">{line.replace("### ", "")}</h4>;
      }
      if (line.startsWith("## ")) {
        return <h3 key={idx} className="chat-heading-lg">{line.replace("## ", "")}</h3>;
      }
      // Check for bullet lists
      if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        const itemText = line.trim().replace(/^[-*]\s+/, "");
        return (
          <li key={idx} className="chat-bullet-item">
            {renderInlineMarkdown(itemText)}
          </li>
        );
      }
      // Numbered lists
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
        aria-label="Toggle AI Health Assistant Chat"
        title="Interactive Google Gemini & Clinical Health Chat"
      >
        <span className="trigger-icon">{isOpen ? "✕" : "💬"}</span>
        <span className="trigger-label">
          {isOpen ? "Close Chat" : "Ask Health AI"}
        </span>
        {reportId && !isOpen && <span className="trigger-badge">Report Linked</span>}
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
                <h3 className="assistant-name">AI Health Assistant</h3>
                <span className="ai-badge">
                  {activeEngine === "groq_api"
                    ? "⚡ Groq AI"
                    : activeEngine === "gemini_api"
                      ? "✨ Google Gemini"
                      : "🧠 Clinical AI"}
                </span>
              </div>
              <p className="assistant-subtitle">
                {reportFilename ? `Attached: ${reportFilename}` : "PostgreSQL Synced • Free Health Q&A"}
              </p>
            </div>
          </div>
          <div className="header-drawer-controls">
            <button
              className="chat-action-btn"
              onClick={handleClearHistory}
              title="Clear Conversation History"
              aria-label="Clear Chat"
            >
              🗑️
            </button>
            <button
              className="chat-action-btn"
              onClick={onToggle}
              title="Minimize Chat"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="quick-prompts-bar">
          <span className="prompts-label">Suggestions:</span>
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
                      <span className="sources-label">Related Test Values:</span>
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
                <span className="typing-text">Thinking with clinical guidelines...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Disclaimer Footer Note */}
        <div className="chat-disclaimer">
          🔒 Educational AI assistant. Responses are not medical diagnoses. Consult your doctor for treatment.
        </div>

        {/* Input Bar */}
        <form
          className="chat-input-bar"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="chat-text-input"
            placeholder={
              reportId
                ? "Ask about your biomarkers, impression, or health tips..."
                : "Ask any medical report or health question..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!inputMessage.trim() || isLoading}
            aria-label="Send message"
          >
            {isLoading ? "..." : "➤"}
          </button>
        </form>
      </aside>
    </>
  );
}

export default InteractiveChat;
