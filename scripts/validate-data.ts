/**
 * /data JSON 검사. `npm run validate:data` 또는 `npm run build` 시 자동 실행.
 * 문제가 있으면 무엇이 잘못됐는지 알려주고 빌드를 멈춘다.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { validateAll } from "../lib/validate-data";
import type {
  CountriesFile,
  DistributionFile,
  IncomeFile,
  PppFile,
} from "../lib/data-types";

function load<T>(name: string): T {
  return JSON.parse(readFileSync(join(process.cwd(), "data", name), "utf8")) as T;
}

const problems = validateAll({
  countries: load<CountriesFile>("countries.json"),
  height: load<DistributionFile>("height.json"),
  weight: load<DistributionFile>("weight.json"),
  income: load<IncomeFile>("income.json"),
  ppp: load<PppFile>("ppp.json"),
});

if (problems.length > 0) {
  console.error(`\n❌ /data 검사 실패 — 문제 ${problems.length}건\n`);
  for (const p of problems) {
    console.error(`  • [${p.where}] ${p.message}`);
  }
  console.error("\n수정 방법은 data/SCHEMA.md 를 보세요.\n");
  process.exit(1);
}

console.log("✅ /data 검사 통과 — 출처 없는 수치가 없습니다.");
