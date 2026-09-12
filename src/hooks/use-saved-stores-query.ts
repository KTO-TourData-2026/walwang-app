import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getSavedStores } from "@/api/store";

// 저장한 장소 목록. 저장 탭·가게 상세 ♡가 같은 캐시(queryKeys.user.savedStores)를 공유한다.
export function useSavedStoresQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.user.savedStores(),
    queryFn: getSavedStores,
    enabled: options.enabled ?? true,
  });
}
