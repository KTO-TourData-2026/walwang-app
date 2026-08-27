import type { Category } from "@/types/place";

/**
 * 업종 표시 라벨. 검색 결과·가게 상세 등 UI 공통으로 쓴다.
 * 백엔드 enum(`park`/`cafe`/`restaurant`)과 1:1 대응.
 */
export const CATEGORY_LABEL: Record<Category, string> = {
  park: "공원·산책로",
  cafe: "카페",
  restaurant: "식당",
};
