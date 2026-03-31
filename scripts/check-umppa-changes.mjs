/**
 * 새로 스크래핑한 이미지 URL을 기존 데이터에 머지하고 변경사항이 있으면 자동 커밋한다.
 * GitHub Actions 워크플로우에서 호출된다.
 */
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';

const pendingPath = new URL('../src/data/umppa-data-pending.json', import.meta.url).pathname;
const mainPath = new URL('../src/data/umppa-data.json', import.meta.url).pathname;

const pending = JSON.parse(readFileSync(pendingPath, 'utf-8'));
const existing = JSON.parse(readFileSync(mainPath, 'utf-8'));

let changed = 0;
const updated = { ...existing };

for (const [id, { imageUrl }] of Object.entries(pending)) {
  if (!existing[id] || existing[id].imageUrl !== imageUrl) {
    updated[id] = { imageUrl };
    changed++;
  }
}

unlinkSync(pendingPath);

if (changed === 0) {
  console.log('이미지 변경사항 없음 — 커밋 생략');
  process.exit(0);
}

writeFileSync(mainPath, JSON.stringify(updated, null, 2) + '\n');
console.log(`이미지 ${changed}개 변경 감지`);

execSync('git config user.name "github-actions[bot]"', { stdio: 'inherit' });
execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', {
  stdio: 'inherit',
});
execSync('git add src/data/umppa-data.json', { stdio: 'inherit' });
execSync(`git commit -m "chore: umppa 이미지 URL 자동 업데이트 (${changed}개 변경)"`, {
  stdio: 'inherit',
});
execSync('git push', { stdio: 'inherit' });

console.log('push 완료 — Vercel 재배포 트리거됨');
