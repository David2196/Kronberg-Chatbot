import { useState, useRef, useEffect } from "react";

const SYSTEM_PROMPT = `Du bist Dr. Klaus Kronberg, Vorstandsvorsitzender der Kronberg Sitzsysteme GmbH. Ingenieur. Enkel des Gründers. Du trägst dieses Unternehmen seit deiner Kindheit – das hier ist nicht irgendein Job für dich.

**Wer du bist:**
Maschinenbauingenieur (TU München). Du denkst in Systemen, nicht in PowerPoints. Du hast das Unternehmen durch die Rohstoffkrise 2022 geführt und weißt, dass Kronberg gerade auf einem schmalen Grat läuft: 370 Mio. € Umsatz, aber das EBIT ist von 20 auf 13 Mio. € eingebrochen. Audi und BMW werden nicht ewig warten. Du bist direkt, manchmal ungeduldig – aber du bist kein Choleriker. Du glaubst an deine Leute. Wenn jemand vor dir sitzt mit einer echten Idee, hörst du zu.

**Was heute auf dem Tisch liegt:**
Vor dir sitzt ein Team aus dem Projektteam Fokus26. Ihre Aufgabe: dir erklären, wie der Veränderungsprozess bei Kronberg konkret gestaltet werden soll. Nicht die Zahlen. Nicht die Kostenhebel. Sondern: Wie führt man 1.500 Menschen durch einen fundamentalen Wandel?

Du willst wissen, ob die Leute vor dir das wirklich durchdacht haben – oder ob das wieder eine schöne Präsentation ohne Substanz ist.

**Was dich interessiert – und was nicht:**
Wenn jemand anfängt, über EBIT-Ziele, Materialkosten oder konkrete Einsparungen zu reden, unterbrichst du ruhig aber bestimmt: *"Das ist heute nicht das Thema. Ich will wissen, wie Sie den Wandel gestalten – nicht was hinten rauskommt. Bleiben Sie beim Thema."*

Du fragst nach dem *Wie*, nicht dem *Was*:
- Wer trägt die Verantwortung – wirklich, nicht auf dem Papier?
- Wie kaskadiert das durch die Führungsebenen bis zum Schichtleiter in Ingolstadt?
- Wie kommunizieren wir – und zwar so, dass es beim Maschinenbediener in Tschechien genauso ankommt wie hier im Boardroom?
- Wer sind die Multiplikatoren in der Fläche? Das Lean Team sitzt genau dort, wo die Veränderung passieren muss – haben Sie die eingebunden?
- Wann und wie wurde der Betriebsrat eingebunden?
- Wie stellen wir sicher, dass Bereichsziele und Transformationsziele nicht gegeneinander laufen?
- Was braucht ihr von mir – konkret?
- Wie tracken wir Fortschritt? Nicht quartalsweise. Ich will wissen, ob wir auf Kurs sind, bevor es zu spät ist.
- Was kostet das alles – und haben wir die Ressourcen oder brauchen wir externe Unterstützung?

**Deine Gesprächshaltung:**
Du bewertest Antworten fair, aber ohne Nachsicht. Eine frühe Idee darf unvollständig sein – aber du erwartest Transparenz über offene Annahmen. Ein Umsetzungskonzept muss Verantwortlichkeiten, Meilensteine und Nachverfolgung haben, sonst ist es kein Konzept. Wenn ein Ansatz Potenzial hat, sagst du das direkt – und forderst sofort die nächste Konkretisierung.

Du brichst das Gespräch ab, wenn drei Antworten in Folge substanzlos oder ausweichend waren, oder wenn Grundfragen (Verantwortung, Kommunikation, Betriebsrat) komplett offen bleiben. Beim Abbruch: kurz benennen, was fehlte – Termin für nachgearbeitetes Konzept setzen.

**Gesprächsform:**
- Pro Nachricht genau eine Frage. Nie mehrere auf einmal.
- Immer direkt auf das eingehen, was gerade gesagt wurde.
- Kein Smalltalk. Keine Aufzählungen. Kein Berater-Sprech.
- Kurze, präzise Sätze. Du denkst schnell und redest entsprechend.
- Wenn eine Antwort gut ist: kurze Anerkennung, dann weiter. Keine Lobeshymnen.
- Wenn eine Antwort ausweicht: einmal direkt nachhaken. Dann weiter.

**Gesprächseinstieg:**
Eröffne jedes Gespräch exakt mit: *"Sie haben 20 Minuten. Was genau wollen Sie mir heute zu Projekt Fokus26 präsentieren?"*

**Gesprächsabschluss:**
Wenn die wesentlichen Themen abgedeckt sind, beende das Gespräch und liefere eine knappe Vorstandsbewertung nach diesen Kriterien:
- Verständlichkeit des Vorgehens
- Klarheit der Verantwortlichkeiten
- Kommunikationskonzept
- Einbindung von Führungskräften und Betriebsrat
- Nachverfolgung und Governance

Abschließendes Urteil (eines davon): **"Freigabe zur Umsetzung"** / **"Freigabe unter Auflagen"** / **"Nicht freigegeben"**`;

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

  const startSession = async () => {
    setHasStarted(true);
    setIsLoading(true);

    const openingMessage = "Sie haben 20 Minuten. Was genau wollen Sie mir heute zu Projekt Fokus26 präsentieren?";
    setMessages([{ role: "assistant", content: openingMessage }]);
    setIsLoading(false);

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
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await response.json();
      const assistantText = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);

      // Detect if session ended (final verdict keywords)
      const lowerText = assistantText.toLowerCase();
      if (
        lowerText.includes("freigabe zur umsetzung") ||
        lowerText.includes("freigabe unter auflagen") ||
        lowerText.includes("nicht freigegeben") ||
        lowerText.includes("erst dann reden wir weiter")
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

  const requestEvaluation = async () => {
    if (isLoading || sessionEnded) return;
    setIsLoading(true);
    setInput("");

    const evalRequest = {
      role: "user",
      content: "[SYSTEMNACHRICHT: Das Gespräch wird jetzt beendet. Bitte gib sofort deine abschließende Vorstandsbewertung basierend auf dem bisherigen Gesprächsverlauf ab – mit Bewertung aller Kriterien und abschließendem Urteil.]"
    };
    const newMessages = [...messages, evalRequest];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const assistantText = data.content
        .filter((b) => b.type === "text")
        .map((b) => b.text)
        .join("");

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText }]);
      setSessionEnded(true);
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "— [Verbindungsfehler. Bitte Seite neu laden.] —" }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── DESIGN: Dark executive boardroom aesthetic ──
  return (
    <div style={{
      minHeight: "100vh",
      background: "#0f0f0f",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      padding: "0",
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
          <div style={{
            fontSize: "11px",
            letterSpacing: "3px",
            color: "#8a7340",
            textTransform: "uppercase",
            marginBottom: "4px",
            fontFamily: "'Arial', sans-serif",
          }}>
            KRONBERG SITZSYSTEME GMBH
          </div>
          <div style={{
            fontSize: "20px",
            color: "#e8e0d0",
            fontWeight: "normal",
            letterSpacing: "0.3px",
          }}>
            Dr. Klaus Kronberg
          </div>
          <div style={{
            fontSize: "12px",
            color: "#555",
            fontFamily: "'Arial', sans-serif",
            marginTop: "2px",
          }}>
            Vorstandsvorsitzender · Projekt Fokus26
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{
            width: "8px", height: "8px", borderRadius: "50%",
            background: sessionEnded ? "#555" : isLoading ? "#8a7340" : "#4a7c59",
            boxShadow: sessionEnded ? "none" : isLoading ? "0 0 6px #8a7340" : "0 0 6px #4a7c59",
          }} />
          <span style={{ fontSize: "11px", color: "#444", fontFamily: "'Arial', sans-serif", letterSpacing: "1px" }}>
            {sessionEnded ? "BEENDET" : isLoading ? "..." : "AKTIV"}
          </span>
        </div>
      </div>

      {/* Chat Area */}
      <div style={{
        width: "100%",
        maxWidth: "780px",
        flex: 1,
        minHeight: "480px",
        maxHeight: "540px",
        overflowY: "auto",
        padding: "28px 32px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        scrollbarWidth: "thin",
        scrollbarColor: "#2a2a2a #0f0f0f",
      }}>
        {!hasStarted && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            gap: "20px",
            textAlign: "center",
            padding: "40px",
          }}>
            <div style={{
              width: "60px", height: "1px",
              background: "linear-gradient(90deg, transparent, #8a7340, transparent)",
              marginBottom: "8px",
            }} />
            <p style={{
              color: "#666",
              fontFamily: "'Arial', sans-serif",
              fontSize: "13px",
              lineHeight: "1.7",
              maxWidth: "420px",
              letterSpacing: "0.2px",
            }}>
              Sie betreten den Vorstandsraum der Kronberg Sitzsysteme GmbH. Dr. Klaus Kronberg (CEO) erwartet Ihre Präsentation zum Veränderungsprozess für das Projekt Fokus26.
            </p>
            <button
              onClick={startSession}
              style={{
                marginTop: "8px",
                padding: "12px 36px",
                background: "transparent",
                border: "1px solid #8a7340",
                color: "#c9a84c",
                fontFamily: "'Arial', sans-serif",
                fontSize: "11px",
                letterSpacing: "2.5px",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={e => {
                e.target.style.background = "#8a7340";
                e.target.style.color = "#0f0f0f";
              }}
              onMouseLeave={e => {
                e.target.style.background = "transparent";
                e.target.style.color = "#c9a84c";
              }}
            >
              Gespräch beginnen
            </button>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              fontSize: "10px",
              color: "#3a3a3a",
              fontFamily: "'Arial', sans-serif",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              marginBottom: "6px",
              paddingLeft: msg.role === "assistant" ? "2px" : "0",
              paddingRight: msg.role === "user" ? "2px" : "0",
            }}>
              {msg.role === "assistant" ? "DR. KRONBERG" : "PROJEKTTEAM"}
            </div>
            <div style={{
              maxWidth: "88%",
              padding: msg.role === "assistant" ? "16px 20px" : "12px 18px",
              background: msg.role === "assistant" ? "#161616" : "#1a1a1a",
              border: msg.role === "assistant"
                ? "1px solid #2a2a2a"
                : "1px solid #252525",
              borderLeft: msg.role === "assistant" ? "3px solid #8a7340" : "1px solid #252525",
              color: msg.role === "assistant" ? "#d8cfc0" : "#888",
              fontSize: "15px",
              lineHeight: "1.7",
              letterSpacing: "0.1px",
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{
              fontSize: "10px", color: "#3a3a3a",
              fontFamily: "'Arial', sans-serif", letterSpacing: "1.5px",
              textTransform: "uppercase", marginBottom: "6px",
            }}>DR. KRONBERG</div>
            <div style={{
              padding: "14px 20px",
              background: "#161616",
              border: "1px solid #2a2a2a",
              borderLeft: "3px solid #8a7340",
              display: "inline-flex",
              gap: "5px",
              alignItems: "center",
            }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: "#8a7340",
                  animation: `pulse 1.2s ease-in-out ${j * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      {hasStarted && (
        <div style={{
          width: "100%",
          maxWidth: "780px",
          borderTop: "1px solid #1e1e1e",
          padding: "16px 32px 24px",
        }}>
          {sessionEnded ? (
            <div style={{ textAlign: "center" }}>
              <p style={{
                color: "#444",
                fontFamily: "'Arial', sans-serif",
                fontSize: "12px",
                letterSpacing: "1px",
                marginBottom: "14px",
              }}>
                DAS GESPRÄCH IST BEENDET
              </p>
              <button
                onClick={resetSession}
                style={{
                  padding: "10px 28px",
                  background: "transparent",
                  border: "1px solid #333",
                  color: "#555",
                  fontFamily: "'Arial', sans-serif",
                  fontSize: "11px",
                  letterSpacing: "2px",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.target.style.borderColor = "#555"; e.target.style.color = "#888"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#333"; e.target.style.color = "#555"; }}
              >
                Neues Gespräch
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ihre Präsentation..."
                rows={3}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  background: "#141414",
                  border: "1px solid #272727",
                  borderRadius: "0",
                  color: "#b0a898",
                  fontFamily: "'Georgia', serif",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  resize: "none",
                  outline: "none",
                  transition: "border-color 0.2s",
                }}
                onFocus={e => e.target.style.borderColor = "#8a7340"}
                onBlur={e => e.target.style.borderColor = "#272727"}
                disabled={isLoading}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignSelf: "stretch" }}>
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  style={{
                    flex: 1,
                    padding: "0 22px",
                    background: isLoading || !input.trim() ? "transparent" : "#8a7340",
                    border: "1px solid",
                    borderColor: isLoading || !input.trim() ? "#252525" : "#8a7340",
                    color: isLoading || !input.trim() ? "#333" : "#0f0f0f",
                    fontFamily: "'Arial', sans-serif",
                    fontSize: "11px",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    cursor: isLoading || !input.trim() ? "default" : "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                >
                  Senden
                </button>
                <button
                  onClick={requestEvaluation}
                  disabled={isLoading || messages.length < 3}
                  title="Gespräch beenden und Bewertung anfordern"
                  style={{
                    flex: 1,
                    padding: "0 22px",
                    background: "transparent",
                    border: "1px solid",
                    borderColor: isLoading || messages.length < 3 ? "#1e1e1e" : "#5a2a2a",
                    color: isLoading || messages.length < 3 ? "#2a2a2a" : "#8a4040",
                    fontFamily: "'Arial', sans-serif",
                    fontSize: "11px",
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    cursor: isLoading || messages.length < 3 ? "default" : "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={e => {
                    if (!isLoading && messages.length >= 3) {
                      e.target.style.background = "#5a2a2a";
                      e.target.style.color = "#e8d0d0";
                    }
                  }}
                  onMouseLeave={e => {
                    e.target.style.background = "transparent";
                    e.target.style.color = isLoading || messages.length < 3 ? "#2a2a2a" : "#8a4040";
                  }}
                >
                  Beenden & Bewerten
                </button>
              </div>
            </div>
          )}
          <div style={{
            marginTop: "8px",
            fontSize: "10px",
            color: "#2e2e2e",
            fontFamily: "'Arial', sans-serif",
            letterSpacing: "0.5px",
          }}>
            Enter zum Senden · Shift+Enter für neue Zeile
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
