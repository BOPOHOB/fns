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
import type { RouteMeta } from "./meta";

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
            handle: {
              meta: { title: "Результат — FeelAndSwim" } satisfies RouteMeta,
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
