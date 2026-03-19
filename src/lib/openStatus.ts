const KO_DAYS_SHORT = ['월', '화', '수', '목', '금', '토', '일'] as const;

export function isOpenToday(operatingHours: string): boolean {
  const todayIndex = new Date().getDay(); // 0=Sunday … 6=Saturday
  // Map JS getDay() index to KO_DAYS_SHORT index (월=0 … 일=6)
  const koIndex = todayIndex === 0 ? 6 : todayIndex - 1;
  const today = KO_DAYS_SHORT[koIndex];

  // Range detection: "화~일" or "월~토"
  const rangeMatch = operatingHours.match(/([월화수목금토일])~([월화수목금토일])/);
  if (rangeMatch) {
    const startIdx = KO_DAYS_SHORT.indexOf(rangeMatch[1] as (typeof KO_DAYS_SHORT)[number]);
    const endIdx = KO_DAYS_SHORT.indexOf(rangeMatch[2] as (typeof KO_DAYS_SHORT)[number]);
    if (startIdx !== -1 && endIdx !== -1) {
      if (startIdx <= endIdx) {
        return koIndex >= startIdx && koIndex <= endIdx;
      }
      // Wrap-around range (e.g. "금~월")
      return koIndex >= startIdx || koIndex <= endIdx;
    }
  }

  return operatingHours.includes(today);
}
