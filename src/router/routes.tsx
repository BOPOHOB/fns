import type { RouteObject } from "react-router";
import { AuthCallback } from "../pages/AuthCallback";
import { AddSwimmer } from "../pages/addSwimmer/addSwimmer";
import { Teams } from "../pages/teams/teams";
import { AddTeam } from "../pages/teams/addTeam";
import { Home } from "../pages/home/home";
import { LoginOutline } from "./loginOutline";
import { SegmentOutline } from "./segmentOutline";
import { SegmentAdd, SegmentIndex } from "./segmentPages";
import { ResultOutline } from "./resultOutline";
import { ResultPage } from "../pages/result/result";
import type { MetaContext, RouteMeta } from "./meta";
import { resultOgImageUrl, resultPageUrl } from "../shared/publicOrigin.ts";
import { formatResultMeta } from "../shared/resultMeta.ts";
import type { Result } from "../types/result";

type ResultLoaderData = Result & { swimmerName?: string };

async function loadResultMeta(
  request: Request,
  resultId: string | undefined,
): Promise<ResultLoaderData | null> {
  const id = Number(resultId);
  if (!Number.isInteger(id) || id < 1) return null;
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/api/results/${id}`);
  if (!res.ok) return null;
  return (await res.json()) as ResultLoaderData;
}

const routes: RouteObject[] = [
  {
    id: "root",
    Component: LoginOutline,
    handle: {
      meta: {
        title: "FeelAndSwim",
        description: "Результаты и тренировки по плаванию",
      } satisfies RouteMeta,
    },
    children: [
      {
        id: "auth-callback",
        path: "auth/callback",
        Component: AuthCallback,
        handle: {
          meta: { title: "Вход — FeelAndSwim" } satisfies RouteMeta,
        },
      },
      {
        id: "add-swimmer",
        path: "add",
        Component: AddSwimmer,
        handle: {
          meta: { title: "Добавить пловца — FeelAndSwim" } satisfies RouteMeta,
        },
      },
      {
        id: "teams",
        path: "teams",
        Component: Teams,
        handle: {
          meta: { title: "Группы — FeelAndSwim" } satisfies RouteMeta,
        },
      },
      {
        id: "teams-add",
        path: "teams/add",
        Component: AddTeam,
        handle: {
          meta: { title: "Новая группа — FeelAndSwim" } satisfies RouteMeta,
        },
      },
      {
        id: "segment",
        path: ":segment",
        Component: SegmentOutline,
        children: [
          {
            id: "segment-index",
            index: true,
            Component: SegmentIndex,
            handle: {
              meta: { title: "FeelAndSwim" } satisfies RouteMeta,
            },
          },
          {
            id: "segment-add",
            path: "add",
            Component: SegmentAdd,
            handle: {
              meta: { title: "Добавить результат — FeelAndSwim" } satisfies RouteMeta,
            },
          },
          {
            id: "result",
            path: ":resultId",
            Component: ResultOutline,
            loader: async ({ params, request }) =>
              loadResultMeta(request, params.resultId),
            handle: {
              meta: ({ data, params }: MetaContext): RouteMeta => {
                const resultId = params.resultId;
                const segment = params.segment;
                const base: RouteMeta = {
                  title: "Результат — FeelAndSwim",
                  description: "Карточка результата пловца",
                };
                if (!resultId || !segment) return base;

                const result = data as ResultLoaderData | null;
                const fromResult = result
                  ? formatResultMeta({
                      distance: result.distance,
                      result: result.result,
                      date: result.date,
                      swimmerName: result.swimmerName ?? "",
                      stages: result.stages,
                    })
                  : null;

                return {
                  title: fromResult?.title ?? base.title,
                  description: fromResult?.description ?? base.description,
                  ogImage: resultOgImageUrl(resultId),
                  ogUrl: resultPageUrl(segment, resultId),
                };
              },
            },
            children: [
              {
                id: "result-index",
                index: true,
                Component: ResultPage,
              },
            ],
          },
        ],
      },
      {
        id: "home",
        index: true,
        Component: Home,
        handle: {
          meta: {
            title: "Таблица рекордов — FeelAndSwim",
            description: "Сводная таблица результатов пловцов",
          } satisfies RouteMeta,
        },
      },
      {
        id: "home-splat",
        path: "*",
        Component: Home,
        handle: {
          meta: {
            title: "Таблица рекордов — FeelAndSwim",
            description: "Сводная таблица результатов пловцов",
          } satisfies RouteMeta,
        },
      },
    ],
  },
];

export { routes };
