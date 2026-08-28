/**
 * Shared paths, ports and URLs for the CI/CD pipeline.
 *
 * Everything under ci/ imports from here rather than rebuilding paths, so a
 * moved folder or a changed port is a one-line edit.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const ROOT_DIR = path.resolve(__dirname, '..', '..');
export const CI_DIR = path.join(ROOT_DIR, 'ci');
export const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
export const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');
export const RECORDER_DIR = path.join(ROOT_DIR, 'autorecorder');
export const VIDEOS_DIR = path.join(RECORDER_DIR, 'videos');
export const AUDIO_DIR = path.join(RECORDER_DIR, 'audio');
export const LOGS_DIR = path.join(VIDEOS_DIR, 'logs');

export const isWindows = process.platform === 'win32';

/**
 * Prefix for CI artifact names. Deliberately the repo name rather than the
 * video prefix (`DAPY-react`): the artifact is the folder someone downloads,
 * and it should say which repo produced it.
 */
export const PROJECT_SLUG = 'DeepAgentspy-react';

/**
 * 8123, not 8000. The backend here is the LangGraph dev server, which serves
 * every graph in `backend/langgraph.json`.
 *
 * Two things break together if this changes: the recorder's `backendUrl` in
 * `autorecorder/config/project.config.ts`, and `LANGGRAPH_DEPLOYMENT_URL` in
 * `frontend/.env.local` — without the second one the Next runtime route keeps
 * forwarding runs to the old port and every demo answers with an error banner
 * while this health check reports the server up.
 */
export const BACKEND_PORT = Number(process.env.AGENT_PORT || 8123);
export const FRONTEND_PORT = Number(process.env.FRONTEND_PORT || 3000);

/** `langgraph dev` answers `/ok` with `{"ok":true}`. It has no `/health`. */
export const BACKEND_HEALTH_URL = `http://127.0.0.1:${BACKEND_PORT}/ok`;
export const FRONTEND_URL = `http://127.0.0.1:${FRONTEND_PORT}`;

/**
 * Routes compiled before recording starts. Next.js builds routes on demand, so
 * the first hit of each is slow enough to blow the recorder's preflight
 * timeout. Warming them keeps that cost out of the recording itself.
 *
 * The A2UI routes are on the list because they pull in the renderer and a
 * catalog module the other routes never touch, which makes their first compile
 * the slowest in the app.
 */
export const WARMUP_ROUTES = [
  '/',
  '/quickstart/demo-chat',
  '/generative-ui/a2ui/fixed-schema/demo-chat',
  '/shared-state/predictive-state-updates/demo-chat',
];
