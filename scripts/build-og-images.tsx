/**
 * 공유 미리보기(OG) 이미지를 빌드할 때 미리 PNG 로 만들어 둔다.
 *
 * 서버가 없는 정적 배포라서, 요청이 올 때 이미지를 만들 수 없다.
 * 그래서 `npm run build` 전에 이 스크립트가 public/og/ 에 PNG 를 깔아 둔다.
 */
import { ImageResponse } from "next/og";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { getTranslator, locales, type Locale } from "../lib/i18n";

const SIZE = { width: 1200, height: 630 };
const OUT_DIR = join(process.cwd(), "public", "og");

const metrics = ["height", "weight", "income"] as const;
const genders = ["male", "female"] as const;

function Card({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 20,
        padding: 80,
        background: "#0f172a",
        color: "#f8fafc",
      }}
    >
      <div style={{ fontSize: 32, color: "#94a3b8" }}>{eyebrow}</div>
      <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.15 }}>
        {title}
      </div>
      <div style={{ fontSize: 34, color: "#cbd5e1", lineHeight: 1.3 }}>
        {subtitle}
      </div>
      <div
        style={{
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          gap: 14,
          fontSize: 26,
          color: "#38bdf8",
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#38bdf8",
          }}
        />
        <div>average</div>
      </div>
    </div>
  );
}

async function render(element: React.ReactElement, fileName: string) {
  const image = new ImageResponse(element, SIZE);
  const buffer = Buffer.from(await image.arrayBuffer());
  writeFileSync(join(OUT_DIR, fileName), buffer);
  return buffer.length;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  let count = 0;

  for (const locale of locales as readonly Locale[]) {
    const t = getTranslator(locale);

    await render(
      <Card
        eyebrow={t("site.name")}
        title={t("site.tagline")}
        subtitle={t("og.homeSubtitle")}
      />,
      `${locale}-home.png`,
    );
    count += 1;

    for (const metric of metrics) {
      await render(
        <Card
          eyebrow={t("site.name")}
          title={t(`metric.${metric}`)}
          subtitle={t(`metricDesc.${metric}`)}
        />,
        `${locale}-${metric}.png`,
      );
      count += 1;

      if (metric === "income") continue;
      for (const gender of genders) {
        await render(
          <Card
            eyebrow={`${t("site.name")} · ${t(`form.${gender}`)}`}
            title={t(`metric.${metric}`)}
            subtitle={t(`metricDesc.${metric}`)}
          />,
          `${locale}-${metric}-${gender}.png`,
        );
        count += 1;
      }
    }
  }

  console.log(`🖼  OG 이미지 ${count}장을 public/og/ 에 만들었습니다.`);
}

main();
