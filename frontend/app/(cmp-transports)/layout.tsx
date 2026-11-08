// Quickstart app/layout.tsx (verbatim) — HARNESS: one root layout per doc page (route group).
import { Providers } from "./providers";
import "@copilotkit/react-core/v2/styles.css";
import "../globals.css"; // HARNESS: scaffold styles (the doc's "// ...")

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    );
}
