# Kronberg Chatbot – Schritt-für-Schritt Anleitung

## Was du brauchst (alles kostenlos außer OpenAI)
- GitHub-Account: https://github.com
- Vercel-Account: https://vercel.com
- OpenAI API-Key: https://platform.openai.com

---

## Schritt 1: OpenAI API-Key erstellen

1. Gehe zu https://platform.openai.com
2. Registriere dich (oder logge dich ein)
3. Klicke oben rechts auf dein Profilbild → "API keys"
4. Klicke auf "+ Create new secret key"
5. Gib ihm einen Namen z.B. "Kronberg Chatbot"
6. Kopiere den Key und speichere ihn sicher – er wird nur einmal angezeigt!
   (Sieht so aus: sk-proj-xxxxxxxxxxxxxxxx)
7. Gehe zu "Billing" und lade ca. 5€ auf – das reicht für hunderte Gespräche

---

## Schritt 2: Code auf GitHub hochladen

1. Gehe zu https://github.com und logge dich ein
2. Klicke auf das grüne "+ New"-Symbol oben links
3. Repository Name: "kronberg-chatbot"
4. Stelle sicher: "Public" ist ausgewählt
5. Klicke "Create repository"
6. Auf der nächsten Seite: Klicke "uploading an existing file"
7. Ziehe ALLE Dateien aus diesem Ordner in das Upload-Fenster:
   - package.json
   - next.config.js
   - app/layout.js
   - app/page.js
   - app/api/chat/route.js
   
   WICHTIG: Die Ordnerstruktur muss erhalten bleiben!
   Erstelle dazu erst den Ordner "app" und darin "api/chat"
   
8. Klicke "Commit changes"

---

## Schritt 3: Auf Vercel deployen

1. Gehe zu https://vercel.com
2. Klicke "Sign up" → "Continue with GitHub"
3. Autorisiere Vercel für dein GitHub-Konto
4. Klicke "Add New Project"
5. Wähle dein Repository "kronberg-chatbot" aus → "Import"
6. Framework wird automatisch als "Next.js" erkannt ✓
7. WICHTIG – Bevor du auf Deploy klickst:
   - Klappe "Environment Variables" auf
   - Klicke "Add"
   - Name: OPENAI_API_KEY
   - Value: (deinen Key hier einfügen, z.B. sk-proj-xxx...)
   - Klicke "Add"
8. Klicke "Deploy"
9. Warte ca. 60 Sekunden...
10. Fertig! Du bekommst eine URL wie: https://kronberg-chatbot.vercel.app

Diese URL können alle Studierenden ohne Account öffnen.

---

## Kosten

- GitHub: kostenlos
- Vercel: kostenlos
- OpenAI: ca. 0,01–0,03€ pro vollständigem Gespräch (GPT-4o)
  → Bei 30 Studierenden mit je 2 Gesprächen: ca. 1–2€ gesamt

---

## Bei Problemen

Wenn nach dem Deploy eine Fehlermeldung erscheint:
- Überprüfe ob der OPENAI_API_KEY korrekt eingetragen ist
- Gehe in Vercel → dein Projekt → "Settings" → "Environment Variables"
- Dort kannst du den Key korrigieren, dann "Redeploy" klicken
