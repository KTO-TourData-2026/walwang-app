import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getPassport } from "@/api/user";

/** 여권 목록 페이지 크기. 서버 상한이 10이라 첫 페이지로 여권 도장을 채운다. */
export const PASSPORT_PAGE_SIZE = 10;

// 화면 단 훅. 마이 화면의 여권 도장을 목 대신 이 훅으로 가져온다.
export function usePassportQuery(page = 0) {
  return useQuery({
    queryKey: queryKeys.user.passport(page),
    queryFn: () => getPassport(page, PASSPORT_PAGE_SIZE),
  });
}
