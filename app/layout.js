import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "NorthSky RoofFlow OS",
  description: "Roofing workflow & operations platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body style={styles.body}>
          <div style={styles.shell}>
            
            {/* HEADER */}
            <header style={styles.header}>
              <div style={styles.brand}>NorthSky RoofFlow</div>
            </header>

            {/* MAIN */}
            <main style={styles.main}>{children}</main>

            {/* FOOTER */}
            <footer style={styles.footer}>
              © {new Date().getFullYear()} NorthSky RoofFlow OS
            </footer>

          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}

/* ───────────────────────────────
   STYLES
─────────────────────────────── */
const styles: Record<string, React.CSSProperties> = {
  body: {
    margin: 0,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
    background: "#fff",
    color: "#111",
  },

  shell: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },

  header: {
    padding: "14px 20px",
    borderBottom: "1px solid #eaeaea",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    fontWeight: 600,
    background: "#fff",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },

  brand: {
    fontSize: 14,
    letterSpacing: 0.3,
  },

  main: {
    flex: 1,
    padding: "24px",
  },

  footer: {
    padding: "14px 20px",
    borderTop: "1px solid #eaeaea",
    textAlign: "center",
    fontSize: 12,
    color: "#666",
  },
};