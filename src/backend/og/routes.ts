import { Hono } from "hono";
import type { Db } from "../db.ts";
import { mapResult, type ResultRow } from "../mappers.ts";
import { buildResultOgSvg } from "./resultCard.ts";
import { getOrCreatePng, isOgCacheEnabled } from "./render.ts";
import { STAGE_CHUNK_LENGTH } from "../../shared/stagesLayout.ts";

const RESULT_SELECT = `
  SELECT id, swimmer_id, result, distance, date, type, stages, notes, series_id, water, stroke,
    swimfin, finger_paddle, hand_paddle, pull_buoy, board, break_belt, snorkel, wetsuit, monofin
  FROM result
`;

export function ogRoutes(db: Db) {
  const app = new Hono();

  app.get("/result/:id{(\\d+)\\.png}", async (c) => {
    const raw = c.req.param("id");
    const id = Number(String(raw).replace(/\.png$/i, ""));
    if (!Number.isInteger(id) || id < 1) {
      return c.json({ error: "Invalid id" }, 400);
    }

    const row = db
      .prepare(`${RESULT_SELECT} WHERE id = ?`)
      .get(id) as ResultRow | undefined;
    if (!row) return c.json({ error: "Not found" }, 404);

    const swimmer = db
      .prepare(`SELECT name FROM swimmer WHERE id = ?`)
      .get(row.swimmer_id) as { name: string } | undefined;
    if (!swimmer) return c.json({ error: "Swimmer not found" }, 404);

    const result = mapResult(row);

    let seriesMeta:
      | {
        repetitions: number;
        regime: number | null;
        speed: number | null;
        reps: Array<{
          result: number;
          distance: number;
          stages: typeof result.stages;
        }>;
      }
      | undefined;

    if (result.seriesId != null) {
      const seriesRow = db
        .prepare(
          `SELECT id, date, regime, speed, repetitions FROM result_series WHERE id = ?`,
        )
        .get(result.seriesId) as
        | {
          id: number;
          date: string;
          regime: number | null;
          speed: number | null;
          repetitions: number;
        }
        | undefined;

      const seriesRows = db
        .prepare(
          `${RESULT_SELECT} WHERE series_id = ? ORDER BY date ASC, id ASC`,
        )
        .all(result.seriesId) as ResultRow[];

      const reps = seriesRows.map((r) => {
        const mapped = mapResult(r);
        return {
          result: mapped.result,
          distance: mapped.distance,
          stages: mapped.stages,
        };
      });

      if (reps.length > 1) {
        seriesMeta = {
          repetitions: seriesRow?.repetitions ?? reps.length,
          regime: seriesRow?.regime ?? null,
          speed: seriesRow?.speed ?? null,
          reps,
        };
      }
    }

    const displayResult = seriesMeta
      ? seriesMeta.reps.reduce((sum, r) => sum + r.result, 0) /
        seriesMeta.reps.length
      : result.result;

    const fingerprint = [
      "v13",
      result.id,
      result.result,
      result.distance,
      result.date,
      result.stroke ?? "",
      JSON.stringify(result.stages),
      swimmer.name,
      JSON.stringify(STAGE_CHUNK_LENGTH),
      seriesMeta
        ? JSON.stringify({
          id: result.seriesId,
          reps: seriesMeta.reps.map((r) => [r.result, r.distance, r.stages]),
        })
        : "",
    ].join("|");
    const cacheKey = `result-${id}-${simpleHash(fingerprint)}.png`;

    try {
      const png = await getOrCreatePng(cacheKey, () =>
        buildResultOgSvg({
          swimmerName: swimmer.name,
          distance: result.distance,
          result: displayResult,
          date: result.date,
          stages: result.stages,
          stroke: result.stroke,
          series: seriesMeta,
        }),
      );

      return new Response(png, {
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": isOgCacheEnabled()
            ? "public, max-age=86400"
            : "no-store",
        },
      });
    } catch (e) {
      console.error("OG render failed:", e);
      return c.json(
        { error: e instanceof Error ? e.message : "OG render failed" },
        500,
      );
    }
  });

  return app;
}

function simpleHash(value: string): string {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}
