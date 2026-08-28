import type { SVGProps } from "react";

import boardSvg from "./board.svg?raw";
import breakBeltSvg from "./breakBelt.svg?raw";
import fingerPaddleSvg from "./fingerPaddle.svg?raw";
import handPaddleSvg from "./handPaddle.svg?raw";
import monofinSvg from "./monofin.svg?raw";
import pullBuoySvg from "./pullBuoy.svg?raw";
import snorkelSvg from "./snorkel.svg?raw";
import swimfinSvg from "./swimfin.svg?raw";
import wetsuitSvg from "./wetsuit.svg?raw";

type IconProps = SVGProps<SVGSVGElement>;

/** Толщина обводки в координатах potrace (scale 0.1 внутри g). */
const TRACE_STROKE_WIDTH = 200;

function viewBoxOf(raw: string): string {
  return raw.match(/viewBox="([^"]+)"/)?.[1] ?? "0 0 24 24";
}

function innerOf(raw: string): string {
  const inner = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/i)?.[1]?.trim() ?? "";
  return inner
    .replace(/fill="#000000"/g, 'fill="currentColor"')
    .replace(
      /<g transform="([^"]+)"\s*\nfill="currentColor"\s*stroke="none">/,
      `<g transform="$1"\nfill="currentColor" stroke="currentColor" stroke-width="${TRACE_STROKE_WIDTH}" stroke-linejoin="round" stroke-linecap="round" paint-order="stroke fill">`,
    );
}

function tracedIcon(raw: string, props: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBoxOf(raw)}
      preserveAspectRatio="xMidYMid meet"
      width="100%"
      height="100%"
      fill="currentColor"
      aria-hidden
      {...props}
      dangerouslySetInnerHTML={{ __html: innerOf(raw) }}
    />
  );
}

const SwimfinIcon = (props: IconProps) => tracedIcon(swimfinSvg, props);
const FingerPaddleIcon = (props: IconProps) => tracedIcon(fingerPaddleSvg, props);
const HandPaddleIcon = (props: IconProps) => tracedIcon(handPaddleSvg, props);
const PullBuoyIcon = (props: IconProps) => tracedIcon(pullBuoySvg, props);
const BoardIcon = (props: IconProps) => tracedIcon(boardSvg, props);
const WetsuitIcon = (props: IconProps) => tracedIcon(wetsuitSvg, props);
const BreakBeltIcon = (props: IconProps) => tracedIcon(breakBeltSvg, props);
const SnorkelIcon = (props: IconProps) => tracedIcon(snorkelSvg, props);
const MonofinIcon = (props: IconProps) => tracedIcon(monofinSvg, props);

export {
  SwimfinIcon,
  FingerPaddleIcon,
  HandPaddleIcon,
  PullBuoyIcon,
  BoardIcon,
  WetsuitIcon,
  BreakBeltIcon,
  SnorkelIcon,
  MonofinIcon,
  type IconProps,
};
