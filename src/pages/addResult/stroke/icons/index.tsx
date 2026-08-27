import type { SVGProps } from "react";

import backstrokeSvg from "./backstroke.svg?raw";
import breaststrokeSvg from "./breaststroke.svg?raw";
import butterflySvg from "./butterfly.svg?raw";
import freestyleSvg from "./freestyle.svg?raw";
import medleySvg from "./medley.svg?raw";

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

const ButterflyIcon = (props: IconProps) => tracedIcon(butterflySvg, props);
const BackstrokeIcon = (props: IconProps) => tracedIcon(backstrokeSvg, props);
const BreaststrokeIcon = (props: IconProps) => tracedIcon(breaststrokeSvg, props);
const FreestyleIcon = (props: IconProps) => tracedIcon(freestyleSvg, props);
const MedleyIcon = (props: IconProps) => tracedIcon(medleySvg, props);

export {
  ButterflyIcon,
  BackstrokeIcon,
  BreaststrokeIcon,
  FreestyleIcon,
  MedleyIcon,
  type IconProps,
};
