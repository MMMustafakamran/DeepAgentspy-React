"use client";

import { CopilotSidebar } from "@copilotkit/react-core/v2";
import { useDefaultRenderTool } from "@copilotkit/react-core/v2";

export default function Page() {
    useDefaultRenderTool({
        render: ({ name, status, parameters, result }) => (
            <details>
                <summary>
                    {status === "complete" ? `Called ${name}` : `Calling ${name}`}
                </summary>
                <p>Status: {status}</p>
                <p>Args: {JSON.stringify(parameters)}</p>
                <p>Result: {JSON.stringify(result)}</p>
            </details>
        ),
    });

    return (
        <main>
            <h1>Your App</h1>
            <CopilotSidebar />
        </main>
    );
}
