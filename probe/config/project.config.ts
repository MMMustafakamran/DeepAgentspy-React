export const PROJECT = { frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3030', demoSuffix: '' };
export function demoUrlFor(route: string): string { return `${PROJECT.frontendUrl.replace(/\/$/, '')}/${route.replace(/^\//, '')}${PROJECT.demoSuffix}`; }
