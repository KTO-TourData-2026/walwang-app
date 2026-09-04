import type { Category } from "@/types/place";

/**
 * 업종/장소 타입 표시 라벨. 가게(park/cafe/restaurant/shopping)와
 * 코스 nearby(park/festival/attraction)를 함께 담는다.
 */
export const CATEGORY_LABEL: Record<Category, string> = {
  park: "공원·산책로",
  cafe: "카페",
  restaurant: "식당",
  shopping: "쇼핑",
  festival: "축제",
  attraction: "관광지",
};
