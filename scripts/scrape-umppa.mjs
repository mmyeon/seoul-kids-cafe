/**
 * umppa.seoul.go.kr 키즈카페 이미지 + 예약 링크 스크래퍼
 * 실행: node scripts/scrape-umppa.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';

import { extractCafesFromHtml } from './lib/extract-cafes.mjs';

const BASE_URL = 'https://umppa.seoul.go.kr/icare/user/kidsCafe/BD_selectKidsCafeList.do';
const FCLTY_STLES = [2001, 2002];
const PAGE_SIZE = 5;
const DELAY_MS = 300;

async function fetchPage(fcltyStle, currPage) {
  const url = `${BASE_URL}?q_hiddenVal=1&q_rowPerPage=${PAGE_SIZE}&q_currPage=${currPage}&q_fcltyStle=${fcltyStle}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SeoulKidsCafeApp/1.0)',
      Accept: 'text/html',
    },
  });
  if (!res.ok) return null;
  return res.text();
}

async function scrapeAllPages(fcltyStle) {
  const result = {};
  let page = 1;

  while (true) {
    process.stdout.write(`  fcltyStle=${fcltyStle} page=${page} ...`);
    const html = await fetchPage(fcltyStle, page);
    if (!html) {
      console.log(' fetch 실패, 중단');
      break;
    }

    const cafes = extractCafesFromHtml(html);
    const count = Object.keys(cafes).length;
    console.log(` ${count}개`);
    if (count === 0) break;

    Object.assign(result, cafes);
    if (count < PAGE_SIZE) break;
    page++;

    await new Promise((r) => setTimeout(r, DELAY_MS));
  }

  return result;
}

async function main() {
  console.log('=== umppa 스크래퍼 시작 (이미지) ===');

  const outputArg = process.argv.find((a) => a.startsWith('--output='));
  const outputPath = outputArg
    ? new URL(`../${outputArg.replace('--output=', '')}`, import.meta.url).pathname
    : new URL('../src/data/umppa-data.json', import.meta.url).pathname;

  const all = {};

  for (const fcltyStle of FCLTY_STLES) {
    console.log(`\n[fcltyStle=${fcltyStle}] 스크래핑 시작`);
    const result = await scrapeAllPages(fcltyStle);
    Object.assign(all, result);
    console.log(`[fcltyStle=${fcltyStle}] 완료: ${Object.keys(result).length}개`);
  }

  console.log(`\n총 ${Object.keys(all).length}개 수집`);

  const dataDir = new URL('../src/data', import.meta.url).pathname;
  mkdirSync(dataDir, { recursive: true });

  writeFileSync(outputPath, JSON.stringify(all, null, 2) + '\n');
  console.log(`저장 완료: ${outputPath}`);
}

main().catch((err) => {
  console.error('오류 발생:', err);
  process.exit(1);
});
