// HARNESS: plain root layout. This page's own snippet creates its CopilotKitProvider itself.
import "../globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
