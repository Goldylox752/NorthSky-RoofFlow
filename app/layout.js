export const metadata = {
  title: "NorthSky",
  description: "AI-driven lead automation platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={styles.body}>
        <div id="app">{children}</div>
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    backgroundColor: "#000",
    color: "#fff",
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    lineHeight: 1.5
  }
};