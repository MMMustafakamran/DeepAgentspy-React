"""One place for the settings every agent module in this backend reads.

The doc pages this repo implements name four different model ids across them
(`openai:gpt-4o` on Quickstart and Tool Rendering, `gpt-5.4` on Dynamic Schema
A2UI and Predictive State Updates). Rather than hardcode a different one per
file — and force anyone testing to have access to all of them — every agent
reads `OPENAI_MODEL` and defaults to the Quickstart's `gpt-4o`. The per-page
id each doc actually prints is recorded on that page's route in the app.
"""

import os

#region model
# Bare id, e.g. "gpt-4o". `create_deep_agent(model=...)` wants the
# provider-prefixed form; `ChatOpenAI(model=...)` wants the bare one.
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4o")

# What `create_deep_agent(model=...)` takes.
MODEL = f"openai:{OPENAI_MODEL}"
#endregion
