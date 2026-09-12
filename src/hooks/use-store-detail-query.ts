import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getStoreDetail } from "@/api/store";

export function useStoreDetailQuery(storeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.store.detail(storeId ?? ""),
    queryFn: () => getStoreDetail(storeId as string),
    enabled: Boolean(storeId),
  });
}
