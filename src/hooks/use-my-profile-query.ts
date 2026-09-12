import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getMyProfile } from "@/api/user";

// 화면 단 훅. 컴포넌트는 목 함수 대신 이 훅으로 마이 요약을 가져온다.
export function useMyProfileQuery(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: getMyProfile,
    enabled: options.enabled ?? true,
  });
}
