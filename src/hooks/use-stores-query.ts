import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getStores, type StoresQueryParams } from "@/api/store";

export function useStoresQuery(params: StoresQueryParams) {
  return useQuery({
    queryKey: queryKeys.store.list(params),
    queryFn: () => getStores(params),
  });
}
