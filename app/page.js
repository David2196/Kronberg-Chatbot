"use client";
import { useState, useRef, useEffect } from "react";

export default function KronbergChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const startSession = () => {
    const opening = "Sie haben 20 Minuten. Was genau wollen Sie mir heute zu Projekt Fokus26 präsentieren?";
    setMessages([{ role: "assistant", content: opening }]);
    setHasStarted(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || sessionEnded) return;

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const reply = data.reply;
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

      const lower = reply.toLowerCase();
      if (
        lower.includes("freigabe zur umsetzung") ||
        lower.includes("freigabe unter auflagen") ||
        lower.includes("nicht freigegeben") ||
        lower.includes("erst dann reden wir weiter")
      ) {
        setSessionEnded(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "— [Verbindungsfehler. Bitte Seite neu laden.] —" },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const resetSession = () => {
    setMessages([]);
    setInput("");
    setHasStarted(false);
    setSessionEnded(false);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      {/* Header */}
      <div style={{
        width: "100%",
        maxWidth: "780px",
        borderBottom: "1px solid #2a2a2a",
        padding: "20px 32px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
      }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8a7340", textTransform: "uppercase", marginBottom: "4px", fontFamily: "Arial, sans-serif" }}>
            KRONBERG SITZSYSTEME GMBH
          </div>
          <div style={{ fontSize: "20px", color: "#e8e0d0", fontWeight: "normal" }}>
            Dr. Klaus Kronberg
          </div>
          <div style={{ fontSize: "12px", color: "#555", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>
            Vorstandsvorsitzender · Projekt Fokus26
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: sessionEnded ? "#555" : isLoading ? "#8a7340" : "#4a7c59",
            boxShadow: sessionEnded ? "none" : isLoading ? "0 0 6px #8a7340" : "0 0 6px #4a7c59",
          }} />
          <span style={{ fontSize: "11px", color: "#444", fontFamily: "Arial, sans-serif", letterSpacing: "1px" }}>
            {sessionEnded ? "BEENDET" : isLoading ? "..." : "AKTIV"}
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        width: "100%",
        maxWidth: "780px",
        flex: 1,
        minHeight: "520px",
        maxHeight: "580px",
        overflowY: "auto",
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
      }}>
        {!hasStarted && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "20px", textAlign: "center", padding: "60px 40px" }}>
            <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, #8a7340, transparent)", marginBottom: "8px" }} />
            <p style={{ color: "#666", fontFamily: "Arial, sans-serif", fontSize: "13px", lineHeight: "1.7", maxWidth: "420px" }}>
              Sie betreten den Vorstandsraum der Kronberg Sitzsysteme GmbH. Dr. Klaus Kronberg erwartet Ihre Präsentation zu Projekt Fokus26.
            </p>
            <button
              onClick={startSession}
              style={{
                marginTop: "8px", padding: "12px 36px", background: "transparent",
                border: "1px solid #8a7340", color: "#c9a84c",
                fontFamily: "Arial, sans-serif", fontSize: "11px",
                letterSpacing: "2.5px", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              Gespräch beginnen
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{
              fontSize: "10px", color: "#3a3a3a", fontFamily: "Arial, sans-serif",
              letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px",
            }}>
              {msg.role === "assistant" ? "DR. KRONBERG" : "PROJEKTTEAM"}
            </div>
            <div style={{
              maxWidth: "88%",
              padding: msg.role === "assistant" ? "16px 20px" : "12px 18px",
              background: msg.role === "assistant" ? "#161616" : "#1a1a1a",
              border: msg.role === "assistant" ? "1px solid #2a2a2a" : "1px solid #252525",
              borderLeft: msg.role === "assistant" ? "3px solid #8a7340" : "1px solid #252525",
              color: msg.role === "assistant" ? "#d8cfc0" : "#888",
              fontSize: "15px", lineHeight: "1.7",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", color: "#3a3a3a", fontFamily: "Arial, sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px" }}>
              DR. KRONBERG
            </div>
            <div style={{ padding: "14px 20px", background: "#161616", border: "1px solid #2a2a2a", borderLeft: "3px solid #8a7340", display: "inline-flex", gap: "5px", alignItems: "center" }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#8a7340", animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {hasStarted && (
        <div style={{ width: "100%", maxWidth: "780px", borderTop: "1px solid #1e1e1e", padding: "16px 32px 24px" }}>
          {sessionEnded ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#444", fontFamily: "Arial, sans-serif", fontSize: "12px", letterSpacing: "1px", marginBottom: "14px" }}>
                DAS GESPRÄCH IST BEENDET
              </p>
              <button
                onClick={resetSession}
                style={{ padding: "10px 28px", background: "transparent", border: "1px solid #333", color: "#555", fontFamily: "Arial, sans-serif", fontSize: "11px", letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer" }}
              >
                Neues Gespräch
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ihre Präsentation..."
                  rows={3}
                  style={{
                    flex: 1, padding: "12px 16px", background: "#141414",
                    border: "1px solid #272727", color: "#b0a898",
                    fontFamily: "Georgia, serif", fontSize: "14px",
                    lineHeight: "1.6", resize: "none", outline: "none",
                  }}
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  style={{
                    padding: "12px 22px",
                    background: isLoading || !input.trim() ? "transparent" : "#8a7340",
                    border: "1px solid",
                    borderColor: isLoading || !input.trim() ? "#252525" : "#8a7340",
                    color: isLoading || !input.trim() ? "#333" : "#0f0f0f",
                    fontFamily: "Arial, sans-serif", fontSize: "11px",
                    letterSpacing: "1.5px", textTransform: "uppercase",
                    cursor: isLoading || !input.trim() ? "default" : "pointer",
                    alignSelf: "stretch",
                  }}
                >
                  Senden
                </button>
              </div>
              <div style={{ marginTop: "8px", fontSize: "10px", color: "#2e2e2e", fontFamily: "Arial, sans-serif" }}>
                Enter zum Senden · Shift+Enter für neue Zeile
              </div>
            </>
          )}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
