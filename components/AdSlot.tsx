/**
 * 광고 자리.
 *
 * 규칙:
 * - 실제 광고 코드는 아직 넣지 않는다 (승인 후 이 파일 한 곳만 고치면 된다).
 * - 높이를 미리 확보해서 광고가 늦게 떠도 화면이 밀리지 않게 한다 (CLS 방지).
 * - 입력창·계산 버튼·공유 버튼 바로 옆이나 위에는 두지 않는다 (실수 클릭 방지).
 */
type AdSlotProps = {
  /** 광고 위치 이름. 나중에 어느 자리가 잘 되는지 구분하는 용도. */
  id: string;
  /** 확보할 높이(px). 모바일 기준. */
  height?: number;
  /** "광고" 라는 표시 문구. 광고 정책상 표시하는 것이 안전하다. */
  label?: string;
  className?: string;
};

export default function AdSlot({
  id,
  height = 280,
  label,
  className,
}: AdSlotProps) {
  return (
    <aside
      data-ad-slot={id}
      className={["mx-auto w-full max-w-[336px]", className ?? ""].join(" ")}
    >
      {label && (
        <p className="mb-1 text-center text-[10px] tracking-wide text-slate-400 uppercase">
          {label}
        </p>
      )}
      <div
        aria-hidden="true"
        className="overflow-hidden rounded-lg border border-dashed border-slate-200 dark:border-slate-800"
        style={{ height }}
      />
    </aside>
  );
}
