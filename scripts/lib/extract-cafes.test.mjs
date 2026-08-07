/**
 * extractCafesFromHtml 회귀 테스트
 * 스펙: docs/specs/fetch-with-retry.spec.md (J 그룹)
 *
 * 이번 변경 대상은 네트워크 계층이지만, 파싱 결과가 그대로임을 보장하기 위해 고정한다.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

import { extractCafesFromHtml } from './extract-cafes.mjs';

/** umppa 목록 페이지의 카드 하나를 최소 형태로 재현한다 */
function card({ fcltyId, image, birthYears }) {
  return `
    <li>
      <a href="/icare/user/kidsCafe/BD_selectKidsCafe.do?q_fcltyId=${fcltyId}">
        <img src="${image}" />
      </a>
      <a href="/icare/user/kidsCafe/BD_selectKidsCafe.do?q_fcltyId=${fcltyId}">상세</a>
      ${birthYears ? `<span>${birthYears}</span>` : ''}
    </li>`;
}

describe('J. extractCafesFromHtml', () => {
  test('J1: fcltyId·이미지·출생연도를 순서대로 묶는다', () => {
    const html = [
      card({
        fcltyId: 'A001',
        image: '/icare/upload/fcltyInfoManage/a.jpg',
        birthYears: '2022년생 ~ 2016년생',
      }),
      card({
        fcltyId: 'B002',
        image: 'https://umppa.seoul.go.kr/icare/upload/fcltyInfoManage/b.png',
        birthYears: '2021년생 ~ 2015년생',
      }),
    ].join('');

    assert.deepEqual(extractCafesFromHtml(html), {
      A001: {
        imageUrl: 'https://umppa.seoul.go.kr/icare/upload/fcltyInfoManage/a.jpg',
        birthYearYounger: 2022,
        birthYearOlder: 2016,
      },
      B002: {
        imageUrl: 'https://umppa.seoul.go.kr/icare/upload/fcltyInfoManage/b.png',
        birthYearYounger: 2021,
        birthYearOlder: 2015,
      },
    });
  });

  test('J1-a: 상대 경로 이미지는 절대 URL로 변환한다', () => {
    const html = card({ fcltyId: 'A001', image: '/icare/upload/fcltyInfoManage/a.jpg' });

    assert.equal(
      extractCafesFromHtml(html).A001.imageUrl,
      'https://umppa.seoul.go.kr/icare/upload/fcltyInfoManage/a.jpg'
    );
  });

  test('J1-b: 같은 fcltyId가 여러 번 나와도 한 번만 센다', () => {
    const html = card({ fcltyId: 'A001', image: '/icare/upload/fcltyInfoManage/a.jpg' });

    assert.deepEqual(Object.keys(extractCafesFromHtml(html)), ['A001']);
  });

  test('J1-c: 출생연도는 큰 값이 younger, 작은 값이 older가 된다', () => {
    const html = card({
      fcltyId: 'A001',
      image: '/icare/upload/fcltyInfoManage/a.jpg',
      birthYears: '2016년생 ~ 2022년생',
    });

    const { birthYearYounger, birthYearOlder } = extractCafesFromHtml(html).A001;
    assert.equal(birthYearYounger, 2022);
    assert.equal(birthYearOlder, 2016);
  });

  test('J1-d: 출생연도가 없으면 imageUrl만 담는다', () => {
    const html = card({ fcltyId: 'A001', image: '/icare/upload/fcltyInfoManage/a.jpg' });

    assert.deepEqual(extractCafesFromHtml(html).A001, {
      imageUrl: 'https://umppa.seoul.go.kr/icare/upload/fcltyInfoManage/a.jpg',
    });
  });

  test('J2: 이미지가 fcltyId보다 적으면 적은 쪽 개수만큼만 반환한다', () => {
    const html =
      card({ fcltyId: 'A001', image: '/icare/upload/fcltyInfoManage/a.jpg' }) +
      '<a href="?q_fcltyId=B002">이미지 없는 항목</a>';

    assert.deepEqual(Object.keys(extractCafesFromHtml(html)), ['A001']);
  });

  test('J3: 빈 HTML이면 빈 객체', () => {
    assert.deepEqual(extractCafesFromHtml(''), {});
  });

  test('J3-a: 매칭되는 내용이 없는 HTML이면 빈 객체', () => {
    assert.deepEqual(extractCafesFromHtml('<html><body>결과 없음</body></html>'), {});
  });
});
