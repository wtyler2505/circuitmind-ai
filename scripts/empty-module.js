// Empty module stub — replaces axe-core in production builds
// axe-core is dev-only (gated by import.meta.env.DEV in index.tsx)
export default { run: () => Promise.resolve({ violations: [] }) };
