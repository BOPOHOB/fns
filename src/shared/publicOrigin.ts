/** Public site origin for absolute OG URLs (no trailing slash). */
function publicOrigin(): string {
  const deno = (globalThis as { Deno?: { env: { get(key: string): string | undefined } } })
    .Deno;
  const fromEnv = deno?.env.get("FRONTEND_ORIGIN");
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return "http://localhost:8787";
}

function resultOgImageUrl(resultId: number | string): string {
  return `${publicOrigin()}/api/og/result/${resultId}.png`;
}

function resultPagePath(resultId: number | string): string {
  return `/results/${resultId}`;
}

function resultPageUrl(resultId: number | string): string {
  return `${publicOrigin()}${resultPagePath(resultId)}`;
}

export { publicOrigin, resultOgImageUrl, resultPagePath, resultPageUrl };
