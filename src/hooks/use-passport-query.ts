import { useInfiniteQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getPassport } from "@/api/user";

/** 여권 목록 페이지 크기. 서버 상한이 10이라 페이지당 최대 10개씩 받아 이어붙인다. */
export const PASSPORT_PAGE_SIZE = 10;

// 화면 단 훅. 여권 도장은 11개 이상일 수 있어 무한 쿼리로 전 페이지를 이어받아 합친다.
// (도장 목록이 첫 페이지만 보이던 문제 대응 — PR #35 리뷰.)
export function usePassportQuery() {
  return useInfiniteQuery({
    queryKey: queryKeys.user.passport(),
    queryFn: ({ pageParam }) => getPassport(pageParam, PASSPORT_PAGE_SIZE),
    initialPageParam: 0,
    // 서버에 total이 없어, 받은 수가 페이지 크기와 같으면 다음 페이지가 있다고 본다.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PASSPORT_PAGE_SIZE ? allPages.length : undefined,
  });
}
