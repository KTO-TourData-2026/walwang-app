import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/api/query-keys";
import { getPassportDetail } from "@/api/user";

// 도장 상세 모달용. 목록엔 없는 가게명·원본사진을 상세에서 채운다.
export function usePassportDetailQuery(passportId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.user.passportDetail(passportId ?? ""),
    queryFn: () => getPassportDetail(passportId as string),
    enabled: Boolean(passportId),
  });
}
