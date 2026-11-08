#!/usr/bin/env bash
# HARNESS: starts DeepAgentspy-React on its harness ports (never 3000/8000).
#   8030 LangGraph API server for every graph in agent/langgraph.json, started with the
#        Quickstart's own command (npx @langchain/langgraph-cli dev; doc port 8123 -> --port 8030)
#   3030 Next.js frontend; one Copilot Runtime per doc page under /api/cpk/<page>, the
#        Quickstart's at /api/copilotkit. LANGGRAPH_DEPLOYMENT_URL (the doc's override) is in
#        frontend/.env.local.
cd "$(dirname "$0")"
mkdir -p logs
(cd agent && npx --yes @langchain/langgraph-cli dev --port 8030 --no-browser > ../logs/agent.log 2>&1) &
(cd frontend && npx next dev -p 3030 > ../logs/frontend.log 2>&1) &
wait
