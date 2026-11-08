// Verbatim: "Try it" step 3 (app/layout.tsx)
import { Providers } from "./providers";
import "../globals.css"; // HARNESS: scaffold styles

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
