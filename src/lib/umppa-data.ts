import umppaData from '../data/umppa-data.json';

type UmppaEntry = {
  imageUrl: string;
};

const data = umppaData as Record<string, UmppaEntry>;

export function getUmppaEntry(fcltyId: string): UmppaEntry {
  const entry = data[fcltyId];
  if (!entry) throw new Error(`umppa 데이터 없음: ${fcltyId}`);
  return entry;
}

export function getUmppaImageUrl(fcltyId: string): string {
  return getUmppaEntry(fcltyId).imageUrl;
}


export function getUmppaDetailUrl(fcltyId: string): string {
  return `https://umppa.seoul.go.kr/icare/user/kidsCafe/BD_selectKidsCafeView.do?q_fcltyId=${fcltyId}&q_fcltyStle=2001`;
}
