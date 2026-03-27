/**
 * umppa.seoul.go.kr 키즈카페 이미지 스크래퍼
 * 실행: node scripts/scrape-umppa.mjs
 */
import { writeFileSync, mkdirSync } from 'fs';

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

/**
 * HTML에서 fcltyId → imageUrl 매핑 추출
 * 방식: fcltyId를 순서대로 deduplicate, upload 이미지 URL을 순서대로 수집 후 쌍으로 묶음
 */
function extractCafesFromHtml(html) {
  const uniqueFcltyIds = [];
  const seen = new Set();
  const fcltyIdRegex = /q_fcltyId=([A-Z0-9]+)/g;
  let m;
  while ((m = fcltyIdRegex.exec(html)) !== null) {
    const id = m[1];
    if (!seen.has(id)) {
      seen.add(id);
      uniqueFcltyIds.push(id);
    }
  }

  const imageUrls = [];
  // 서버 응답은 상대 경로 (/icare/upload/...) 또는 절대 경로 형태로 이미지 URL을 포함
  const imgRegex =
    /src="((?:https:\/\/umppa\.seoul\.go\.kr)?\/icare\/upload\/fcltyInfoManage\/[^"]+\.(?:jpg|jpeg|png))"/gi;
  while ((m = imgRegex.exec(html)) !== null) {
    const rawUrl = m[1];
    const absoluteUrl = rawUrl.startsWith('http') ? rawUrl : `https://umppa.seoul.go.kr${rawUrl}`;
    imageUrls.push(absoluteUrl);
  }

  const result = {};
  const count = Math.min(uniqueFcltyIds.length, imageUrls.length);
  for (let i = 0; i < count; i++) {
    result[uniqueFcltyIds[i]] = imageUrls[i];
  }
  return result;
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
  console.log('=== umppa 이미지 스크래퍼 시작 ===');
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

  const outputPath = new URL('../src/data/umppa-images.json', import.meta.url).pathname;
  writeFileSync(outputPath, JSON.stringify(all, null, 2) + '\n');
  console.log(`저장 완료: ${outputPath}`);
}

main().catch((err) => {
  console.error('오류 발생:', err);
  process.exit(1);
});
