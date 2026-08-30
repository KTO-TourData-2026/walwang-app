/** m → "900m" / "1.3km" (1km 이상은 소수 첫째 자리까지). */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  const km = meters / 1000;
  // 정수 km(예: 2.0km)는 "2km"로 짧게 보여준다.
  const text = km.toFixed(1);
  return `${text.endsWith(".0") ? text.slice(0, -2) : text}km`;
}

/** 도보 분 → "12분" / "1시간 5분" / "1시간". */
export function formatWalkTime(minutes: number): string {
  const total = Math.round(minutes);
  if (total < 60) {
    return `${total}분`;
  }
  const hours = Math.floor(total / 60);
  const rest = total % 60;
  return rest === 0 ? `${hours}시간` : `${hours}시간 ${rest}분`;
}
