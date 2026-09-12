import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { searchStores } from "@/api/store";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

// 화면 단 훅: 가게명 검색. 입력을 디바운스하고, 빈 검색어면 호출하지 않는다.
// 타이핑 중 결과가 깜빡이지 않게 이전 데이터를 유지한다.
export function useStoreSearchQuery(keyword: string) {
  const debounced = useDebouncedValue(keyword.trim(), 300);
  const enabled = debounced.length > 0;

  return useQuery({
    queryKey: queryKeys.store.search(debounced),
    queryFn: () => searchStores(debounced),
    enabled,
    placeholderData: keepPreviousData,
  });
}
