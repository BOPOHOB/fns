import { useMemo, type ReactNode } from "react";
import { useMatches } from "react-router";

type RouteMeta = {
  title?: string;
  description?: string;
  ogImage?: string;
  ogUrl?: string;
};

type MetaHandle = {
  meta?: RouteMeta | ((data: unknown) => RouteMeta);
};

function resolveMeta(
  handle: unknown,
  data: unknown,
): RouteMeta {
  if (!handle || typeof handle !== "object") return {};
  const meta = (handle as MetaHandle).meta;
  if (!meta) return {};
  return typeof meta === "function" ? meta(data) : meta;
}

function useRouteMeta(): RouteMeta {
  const matches = useMatches();
  return useMemo(() => {
    const merged: RouteMeta = {
      title: "FeelAndSwim",
      description: "Результаты и тренировки по плаванию",
    };
    for (const match of matches) {
      Object.assign(
        merged,
        resolveMeta(match.handle, (match as { data?: unknown }).data),
      );
    }
    return merged;
  }, [matches]);
}

/** Meta tags for SSR document head (and client <head> via portal-less render in layout). */
const DocumentMeta = ({ children }: { children?: ReactNode }) => {
  const meta = useRouteMeta();
  const title = meta.title ?? "FeelAndSwim";

  return (
    <>
      <title>{title}</title>
      {meta.description ? (
        <meta name="description" content={meta.description} />
      ) : null}
      <meta property="og:title" content={title} />
      {meta.description ? (
        <meta property="og:description" content={meta.description} />
      ) : null}
      {meta.ogImage ? (
        <meta property="og:image" content={meta.ogImage} />
      ) : null}
      {meta.ogUrl ? <meta property="og:url" content={meta.ogUrl} /> : null}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      {children}
    </>
  );
};

function metaFromMatches(
  matches: ReadonlyArray<{ handle?: unknown; data?: unknown }>,
): RouteMeta {
  const merged: RouteMeta = {
    title: "FeelAndSwim",
    description: "Результаты и тренировки по плаванию",
  };
  for (const match of matches) {
    Object.assign(merged, resolveMeta(match.handle, match.data));
  }
  return merged;
}

function renderHeadTags(meta: RouteMeta): string {
  const title = escapeHtml(meta.title ?? "FeelAndSwim");
  const parts = [
    `<title>${title}</title>`,
    meta.description
      ? `<meta name="description" content="${escapeHtml(meta.description)}" />`
      : "",
    `<meta property="og:title" content="${title}" />`,
    meta.description
      ? `<meta property="og:description" content="${escapeHtml(meta.description)}" />`
      : "",
    meta.ogImage
      ? `<meta property="og:image" content="${escapeHtml(meta.ogImage)}" />`
      : "",
    meta.ogUrl
      ? `<meta property="og:url" content="${escapeHtml(meta.ogUrl)}" />`
      : "",
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  ];
  return parts.filter(Boolean).join("\n    ");
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export {
  DocumentMeta,
  metaFromMatches,
  renderHeadTags,
  useRouteMeta,
  type RouteMeta,
};
