/** 구조화 데이터(JSON-LD)를 페이지에 넣는다. 검색엔진만 읽는다. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // 우리가 만든 값만 넣으므로 안전하다.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
