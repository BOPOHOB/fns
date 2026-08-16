import { join, dirname, fromFileUrl } from "jsr:@std/path";
import { ensureDir } from "jsr:@std/fs";
import { initWasm, Resvg } from "@resvg/resvg-wasm";

let wasmReady: Promise<void> | null = null;
let fontBuffers: Uint8Array[] | null = null;

async function loadFonts(): Promise<Uint8Array[]> {
  if (fontBuffers) return fontBuffers;
  const here = dirname(fromFileUrl(import.meta.url));
  const fontDir = join(here, "fonts");
  const files = ["NotoSans-Regular.ttf", "NotoSans-Bold.ttf"];
  fontBuffers = await Promise.all(
    files.map((name) => Deno.readFile(join(fontDir, name))),
  );
  return fontBuffers;
}

async function ensureResvg() {
  if (wasmReady) return wasmReady;
  wasmReady = (async () => {
    const localWasm = join(
      Deno.cwd(),
      "node_modules/@resvg/resvg-wasm/index_bg.wasm",
    );
    let bytes: ArrayBuffer;
    try {
      bytes = (await Deno.readFile(localWasm)).buffer as ArrayBuffer;
    } catch {
      const wasmResponse = await fetch(
        "https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm",
      );
      if (!wasmResponse.ok) {
        throw new Error(`Failed to fetch resvg wasm: ${wasmResponse.status}`);
      }
      bytes = await wasmResponse.arrayBuffer();
    }
    await initWasm(bytes);
    await loadFonts();
  })();
  return wasmReady;
}

function isOgCacheEnabled(): boolean {
  const flag = Deno.env.get("OG_CACHE")?.trim().toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off") return false;
  if (flag === "1" || flag === "true" || flag === "on") return true;
  const env = (
    Deno.env.get("DENO_ENV") ?? Deno.env.get("NODE_ENV") ?? ""
  ).toLowerCase();
  return env === "production";
}

function cacheDir(): string {
  const root = Deno.env.get("PROJECT_ROOT") ?? Deno.cwd();
  return join(root, "cache", "og");
}

async function svgToPng(svg: string): Promise<Uint8Array> {
  await ensureResvg();
  const fonts = await loadFonts();
  const resvg = new Resvg(svg, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontBuffers: fonts,
      defaultFontFamily: "Noto Sans",
      loadSystemFonts: false,
    },
  });
  return resvg.render().asPng();
}

async function readCache(key: string): Promise<Uint8Array | null> {
  try {
    return await Deno.readFile(join(cacheDir(), key));
  } catch {
    return null;
  }
}

async function writeCache(key: string, bytes: Uint8Array): Promise<void> {
  const dir = cacheDir();
  await ensureDir(dir);
  await Deno.writeFile(join(dir, key), bytes);
}

/** Cache key includes fingerprint so updates bust the file. Disabled outside production. */
async function getOrCreatePng(
  cacheKey: string,
  buildSvg: () => string,
): Promise<Uint8Array> {
  const caching = isOgCacheEnabled();
  if (caching) {
    const hit = await readCache(cacheKey);
    if (hit) return hit;
  }
  const png = await svgToPng(buildSvg());
  if (caching) await writeCache(cacheKey, png);
  return png;
}

export { getOrCreatePng, svgToPng, cacheDir, isOgCacheEnabled };
