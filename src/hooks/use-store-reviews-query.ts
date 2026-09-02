import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getStoreReviews } from "@/api/store";

export function useStoreReviewsQuery(storeId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.store.reviews(storeId ?? ""),
    queryFn: () => getStoreReviews(storeId as string),
    enabled: Boolean(storeId),
  });
}
