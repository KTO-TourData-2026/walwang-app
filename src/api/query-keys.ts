// 도메인별 React Query 키 팩토리. 무효화(invalidate) 범위를 계층으로 잡을 수 있게 한다.
// 예: queryClient.invalidateQueries({ queryKey: queryKeys.user.all })

import type { CourseRecommendRequest } from "@/types/course";

type StoreListParams = {
  lat: number;
  lng: number;
  radius?: number;
  size?: string;
};

export const queryKeys = {
  user: {
    all: ["user"] as const,
    me: () => ["user", "me"] as const,
    savedStores: () => ["user", "savedStores"] as const,
    savedCourses: () => ["user", "savedCourses"] as const,
    passport: (page: number) => ["user", "passport", page] as const,
    passportDetail: (id: string) => ["user", "passport", "detail", id] as const,
    myReviews: (page?: number) => ["user", "reviews", page] as const,
  },
  store: {
    all: ["store"] as const,
    list: (params: StoreListParams) => ["store", "list", params] as const,
    search: (keyword: string) => ["store", "search", keyword] as const,
    detail: (id: string) => ["store", "detail", id] as const,
    reviews: (id: string, page?: number) =>
      ["store", "reviews", id, page] as const,
    alternatives: (id: string, size: string) =>
      ["store", "alternatives", id, size] as const,
  },
  course: {
    all: ["course"] as const,
    recommend: (request: CourseRecommendRequest) =>
      ["course", "recommend", request] as const,
    detail: (id: string) => ["course", "detail", id] as const,
  },
  tags: () => ["tags"] as const,
} as const;
