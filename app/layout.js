export const metadata = {
  title: "Kronberg Sitzsysteme – Projekt Fokus26",
  description: "Vorstandsgespräch Simulation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body style={{ margin: 0, padding: 0, background: "#0f0f0f" }}>
        {children}
      </body>
    </html>
  );
}
