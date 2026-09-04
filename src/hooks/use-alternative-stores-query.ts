import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getAlternativeStores } from "@/api/store";
import type { SizeKey } from "@/types/place";

// 거절 완료 화면(S-12)의 대체 장소. size는 리뷰 크기(없으면 소·중형 폴백)를 넘긴다.
export function useAlternativeStoresQuery(
  storeId: string | undefined,
  size: SizeKey,
) {
  return useQuery({
    queryKey: queryKeys.store.alternatives(storeId ?? "", size),
    queryFn: () => getAlternativeStores(storeId as string, size),
    enabled: Boolean(storeId),
  });
}
