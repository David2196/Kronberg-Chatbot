"use client";
import { useState, useRef, useEffect } from "react";

const BERATER_PROMPT = `Du bist ein erfahrener Strategie- und Organisationsberater. Analysiere das folgende Gespräch kritisch hinsichtlich der Qualität der Konzeptvorstellung und Umsetzungsperspektive.

Bewerte strukturiert in drei Schritten. Sei konkret, argumentativ und vermeide allgemeine Floskeln. Beziehe dich, wo möglich, auf Aussagen aus dem Gespräch.

========================
SCHRITT 1 – KERNTHEMEN & GESCHÄFTSZIELE
========================
Analysiere die inhaltliche Klarheit und strategische Fundierung:

- Sind die konkreten Geschäftsziele klar und verständlich formuliert?
- Werden die wirklich kritischen Hebel adressiert oder nur Symptome behandelt?
- Ist der Zusammenhang zwischen Maßnahmen und wirtschaftlichem Ergebnis nachvollziehbar und messbar?
- Wird sauber zwischen Unternehmensperspektive und Kundenperspektive unterschieden?
- Worauf basiert die Analyse (Daten, Annahmen, Erfahrung, Bauchgefühl)?

Bewertung:
- klar / teilweise klar / unklar
+ kurze Begründung

========================
SCHRITT 2 – VERHALTENS- & EINSTELLUNGSÄNDERUNGEN
========================
Analysiere die menschliche und organisationale Dimension:

- Ist klar definiert, wer sich wie konkret anders verhalten muss?
- Werden mögliche Widerstände realistisch erkannt und adressiert?
- Sind alle Ebenen der Organisation berücksichtigt (Führung, mittleres Management, operative Ebene)?
- Gibt es einen klaren Zielzustand im Vergleich zum Ausgangspunkt?
- Welche Einstellungs- oder Mindset-Änderungen werden erwartet?

Bewertung:
- wirksam / teilweise wirksam / unklar
+ kurze Begründung

========================
SCHRITT 3 – MASSNAHMEN & UMSETZUNG
========================
Analysiere die Umsetzbarkeit und Operationalisierung:

- Leiten sich Maßnahmen logisch aus den Verhaltensänderungen ab?
- Wurde sichergestellt, dass Mitarbeitende die Maßnahmen verstehen und mittragen?
- Gibt es einen konkreten Umsetzungsplan (Verantwortlichkeiten, Zeitplan, KPIs)?
- Werden Vorbilder oder Change Agents benannt?
- Welche strukturellen, systemischen oder skill-basierten Veränderungen sind vorgesehen?
- Wie werden Mitarbeitende aktiv eingebunden?

Bewertung:
- umsetzbar / teilweise umsetzbar / nicht umsetzbar
+ kurze Begründung

========================
GESAMTFAZIT
========================
- Reifegrad des Konzepts (1–10)
- Größte Stärken
- Größte Risiken / Lücken
- 2–3 wichtigste Verbesserungen`;

export default function KronbergChatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [showBeraterPanel, setShowBeraterPanel] = useState(false);
  const [beraterAnalysis, setBeraterAnalysis] = useState("");
  const [beraterLoading, setBeraterLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const beraterRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (showBeraterPanel && beraterRef.current) {
      beraterRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [showBeraterPanel, beraterAnalysis]);

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
      setMessages((prev) => [...prev, { role: "assistant", content: "— [Verbindungsfehler. Bitte Seite neu laden.] —" }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const requestEvaluation = async () => {
    if (isLoading || sessionEnded || messages.length < 3) return;
    setIsLoading(true);
    const evalRequest = {
      role: "user",
      content: "[SYSTEMNACHRICHT: Das Gespräch wird jetzt beendet. Bitte gib sofort deine abschließende Vorstandsbewertung basierend auf dem bisherigen Gesprächsverlauf ab – mit Bewertung aller Kriterien und abschließendem Urteil.]"
    };
    const newMessages = [...messages, evalRequest];
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      setSessionEnded(true);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "— [Verbindungsfehler. Bitte Seite neu laden.] —" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const requestBeraterAnalysis = async () => {
    if (beraterLoading || messages.length < 3) return;
    setShowBeraterPanel(true);
    setBeraterAnalysis("");
    setBeraterLoading(true);

    // Build conversation transcript for the advisor
    const transcript = messages
      .map((m) => `${m.role === "assistant" ? "DR. KRONBERG" : "PROJEKTTEAM"}: ${m.content}`)
      .join("\n\n");

    const prompt = `${BERATER_PROMPT}\n\nHier ist das Gespräch, das du analysieren sollst:\n\n========================\nGESPRÄCHSPROTOKOLL\n========================\n${transcript}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: prompt }],
          useAdvisorMode: true,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setBeraterAnalysis(data.reply);
    } catch (err) {
      setBeraterAnalysis("— [Fehler bei der Analyse. Bitte erneut versuchen.] —");
    } finally {
      setBeraterLoading(false);
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
    setShowBeraterPanel(false);
    setBeraterAnalysis("");
  };

  const btnBase = { fontFamily: "Arial, sans-serif", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", cursor: "pointer", border: "1px solid", whiteSpace: "nowrap", transition: "all 0.2s" };

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: "'Georgia', 'Times New Roman', serif" }}>

      {/* Header */}
      <div style={{ width: "100%", maxWidth: "780px", borderBottom: "1px solid #2a2a2a", padding: "20px 32px 16px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "11px", letterSpacing: "3px", color: "#8a7340", textTransform: "uppercase", marginBottom: "4px", fontFamily: "Arial, sans-serif" }}>
            KRONBERG SITZSYSTEME GMBH
          </div>
          <div style={{ fontSize: "20px", color: "#e8e0d0", fontWeight: "normal" }}>Dr. Klaus Kronberg</div>
          <div style={{ fontSize: "12px", color: "#555", fontFamily: "Arial, sans-serif", marginTop: "2px" }}>Vorstandsvorsitzender · Projekt Fokus26</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: sessionEnded ? "#555" : isLoading ? "#8a7340" : "#4a7c59", boxShadow: sessionEnded ? "none" : isLoading ? "0 0 6px #8a7340" : "0 0 6px #4a7c59" }} />
            <span style={{ fontSize: "11px", color: "#444", fontFamily: "Arial, sans-serif", letterSpacing: "1px" }}>
              {sessionEnded ? "BEENDET" : isLoading ? "..." : "AKTIV"}
            </span>
          </div>
          {/* Berater Button in header – always visible once started */}
          {hasStarted && messages.length >= 3 && (
            <button
              onClick={requestBeraterAnalysis}
              disabled={beraterLoading}
              style={{
                ...btnBase,
                padding: "7px 14px",
                background: "transparent",
                borderColor: beraterLoading ? "#2a2a2a" : "#2a3d5a",
                color: beraterLoading ? "#2a2a2a" : "#4a7aaa",
                fontSize: "10px",
              }}
              onMouseEnter={e => { if (!beraterLoading) { e.currentTarget.style.background = "#1a2a3a"; e.currentTarget.style.color = "#7aacdd"; }}}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = beraterLoading ? "#2a2a2a" : "#4a7aaa"; }}
            >
              {beraterLoading ? "ANALYSE LÄUFT..." : "⬡ BERATER-ANALYSE"}
            </button>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div style={{ width: "100%", maxWidth: "780px", flex: 1, minHeight: "520px", maxHeight: "580px", overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column" }}>
        {!hasStarted && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "20px", textAlign: "center", padding: "60px 40px" }}>
            <div style={{ width: "60px", height: "1px", background: "linear-gradient(90deg, transparent, #8a7340, transparent)", marginBottom: "8px" }} />
            <p style={{ color: "#666", fontFamily: "Arial, sans-serif", fontSize: "13px", lineHeight: "1.7", maxWidth: "420px" }}>
              Sie betreten den Vorstandsraum der Kronberg Sitzsysteme GmbH. Dr. Klaus Kronberg (CEO) erwartet Ihre Präsentation zum Veränderungsprozess für das Projekt Fokus26.
            </p>
            <button
              onClick={startSession}
              style={{ marginTop: "8px", padding: "12px 36px", background: "transparent", border: "1px solid #8a7340", color: "#c9a84c", fontFamily: "Arial, sans-serif", fontSize: "11px", letterSpacing: "2.5px", textTransform: "uppercase", cursor: "pointer" }}
            >
              Gespräch beginnen
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: "20px", display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={{ fontSize: "10px", color: "#3a3a3a", fontFamily: "Arial, sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px" }}>
              {msg.role === "assistant" ? "DR. KRONBERG" : "PROJEKTTEAM"}
            </div>
            <div style={{ maxWidth: "88%", padding: msg.role === "assistant" ? "16px 20px" : "12px 18px", background: msg.role === "assistant" ? "#161616" : "#1a1a1a", border: msg.role === "assistant" ? "1px solid #2a2a2a" : "1px solid #252525", borderLeft: msg.role === "assistant" ? "3px solid #8a7340" : "1px solid #252525", color: msg.role === "assistant" ? "#d8cfc0" : "#888", fontSize: "15px", lineHeight: "1.7" }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10px", color: "#3a3a3a", fontFamily: "Arial, sans-serif", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: "6px" }}>DR. KRONBERG</div>
            <div style={{ padding: "14px 20px", background: "#161616", border: "1px solid #2a2a2a", borderLeft: "3px solid #8a7340", display: "inline-flex", gap: "5px", alignItems: "center" }}>
              {[0, 1, 2].map(j => (<div key={j} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#8a7340", animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite` }} />))}
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
              <p style={{ color: "#444", fontFamily: "Arial, sans-serif", fontSize: "12px", letterSpacing: "1px", marginBottom: "14px" }}>DAS GESPRÄCH IST BEENDET</p>
              <button onClick={resetSession} style={{ ...btnBase, padding: "10px 28px", background: "transparent", borderColor: "#333", color: "#555" }}>
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
                  style={{ flex: 1, padding: "12px 16px", background: "#141414", border: "1px solid #272727", color: "#b0a898", fontFamily: "Georgia, serif", fontSize: "14px", lineHeight: "1.6", resize: "none", outline: "none" }}
                  disabled={isLoading}
                />
                <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignSelf: "stretch" }}>
                  <button
                    onClick={sendMessage}
                    disabled={isLoading || !input.trim()}
                    style={{ ...btnBase, flex: 1, padding: "0 22px", background: isLoading || !input.trim() ? "transparent" : "#8a7340", borderColor: isLoading || !input.trim() ? "#252525" : "#8a7340", color: isLoading || !input.trim() ? "#333" : "#0f0f0f", cursor: isLoading || !input.trim() ? "default" : "pointer" }}
                  >
                    Senden
                  </button>
                  <button
                    onClick={requestEvaluation}
                    disabled={isLoading || messages.length < 3}
                    style={{ ...btnBase, flex: 1, padding: "0 22px", background: "transparent", borderColor: isLoading || messages.length < 3 ? "#1e1e1e" : "#5a2a2a", color: isLoading || messages.length < 3 ? "#2a2a2a" : "#8a4040", cursor: isLoading || messages.length < 3 ? "default" : "pointer" }}
                  >
                    Beenden & Bewerten
                  </button>
                </div>
              </div>
              <div style={{ marginTop: "8px", fontSize: "10px", color: "#2e2e2e", fontFamily: "Arial, sans-serif" }}>
                Enter zum Senden · Shift+Enter für neue Zeile
              </div>
            </>
          )}
        </div>
      )}

      {/* Berater Analysis Panel */}
      {showBeraterPanel && (
        <div ref={beraterRef} style={{ width: "100%", maxWidth: "780px", borderTop: "1px solid #1a2a3a", marginTop: "0" }}>
          <div style={{ padding: "16px 32px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "2px", color: "#4a7aaa", fontFamily: "Arial, sans-serif", textTransform: "uppercase", marginBottom: "2px" }}>
                EXTERNE ANALYSE
              </div>
              <div style={{ fontSize: "14px", color: "#8ab0d0", fontFamily: "Arial, sans-serif" }}>
                Strategie- & Organisationsberater
              </div>
            </div>
            <button
              onClick={() => setShowBeraterPanel(false)}
              style={{ background: "transparent", border: "none", color: "#333", fontSize: "18px", cursor: "pointer", fontFamily: "Arial, sans-serif" }}
            >
              ✕
            </button>
          </div>

          <div style={{ padding: "8px 32px 32px" }}>
            {beraterLoading ? (
              <div style={{ display: "flex", gap: "6px", alignItems: "center", padding: "20px 0" }}>
                {[0, 1, 2].map(j => (<div key={j} style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#4a7aaa", animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite` }} />))}
                <span style={{ marginLeft: "10px", fontSize: "12px", color: "#3a5a7a", fontFamily: "Arial, sans-serif", letterSpacing: "1px" }}>ANALYSE WIRD ERSTELLT...</span>
              </div>
            ) : (
              <div style={{ background: "#0d1a26", border: "1px solid #1a3a5a", borderLeft: "3px solid #4a7aaa", padding: "20px 24px", color: "#a0c0d8", fontSize: "14px", lineHeight: "1.8", whiteSpace: "pre-wrap", fontFamily: "Arial, sans-serif" }}>
                {beraterAnalysis}
              </div>
            )}
          </div>
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
