import { Providers } from "./providers";
import "@copilotkit/react-core/v2/styles.css";
import "../globals.css"; // HARNESS: create-next-app's globals.css (the doc's "// ...")

// ...

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
