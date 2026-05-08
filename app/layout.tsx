import "./globals.css";

export const metadata = {
  title: "Flow OS",
  description: "AI backend infrastructure for modern apps",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={styles.body}>{children}</body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    background: "#0b0f17",
    color: "#fff",
    fontFamily: "Arial, sans-serif",
  },
};