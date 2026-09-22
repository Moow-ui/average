import type { ChartData } from "@/lib/chart";
import { positionRatio, toSvgPath } from "@/lib/chart";

const WIDTH = 320;
const HEIGHT = 120;

/**
 * 분포 곡선 위에 "나의 위치"를 찍어서 보여준다.
 * 차트 라이브러리 없이 SVG 로 직접 그려서 페이지를 가볍게 유지한다.
 */
export default function DistributionChart({
  data,
  value,
  label,
  valueLabel,
  ariaLabel,
}: {
  data: ChartData;
  value: number;
  label: string;
  valueLabel: string;
  ariaLabel: string;
}) {
  const path = toSvgPath(data, WIDTH, HEIGHT);
  const markerPercent = positionRatio(data, value);

  return (
    <figure className="space-y-2">
      <div className="relative">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-28 w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label={ariaLabel}
        >
          <path
            d={path}
            className="fill-sky-100 stroke-sky-500 dark:fill-sky-950 dark:stroke-sky-400"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* 내 위치를 나타내는 세로선 */}
        <div
          className="pointer-events-none absolute inset-y-0 w-px bg-slate-900 dark:bg-slate-100"
          style={{ left: `${markerPercent}%` }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -top-1 -translate-x-1/2 rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white dark:bg-slate-100 dark:text-slate-900"
          style={{ left: `${markerPercent}%` }}
        >
          {valueLabel}
        </div>
      </div>
      <figcaption className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </figcaption>
    </figure>
  );
}
