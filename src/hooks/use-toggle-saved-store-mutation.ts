import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToastAndroid } from "react-native";

import { queryKeys } from "@/api/query-keys";
import { saveStore, unsaveStore } from "@/api/store";
import type { Place } from "@/types/place";

type ToggleSavedVariables = {
  storeId: string;
  /** 다음 상태(true=저장, false=해제). 현재 상태의 반대를 넘긴다. */
  nextSaved: boolean;
  /** 저장(add) 시 목록 캐시에 낙관적으로 끼워 넣을 카드. 가게 상세에서 전달한다. */
  place?: Place;
};

/**
 * 장소 저장/해제 토글(`POST`/`DELETE /stores/{storeId}/save`).
 * 저장 목록 캐시를 낙관적으로 갱신하고, 실패하면 이전 캐시로 되돌린다(리뷰 삭제 패턴 준용).
 * 저장 탭·가게 상세 ♡가 이 캐시를 공유하므로 한 곳에서 토글하면 양쪽이 함께 반영된다.
 */
export function useToggleSavedStoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ storeId, nextSaved }: ToggleSavedVariables) =>
      nextSaved ? saveStore(storeId) : unsaveStore(storeId),
    onMutate: async ({ storeId, nextSaved, place }) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.user.savedStores(),
      });
      const previous = queryClient.getQueryData<Place[]>(
        queryKeys.user.savedStores(),
      );
      queryClient.setQueryData<Place[]>(
        queryKeys.user.savedStores(),
        (old = []) => {
          if (nextSaved) {
            if (!place || old.some((item) => item.id === storeId)) {
              return old;
            }
            return [place, ...old];
          }
          return old.filter((item) => item.id !== storeId);
        },
      );
      return { previous };
    },
    onSuccess: (_data, { nextSaved }) => {
      ToastAndroid.show(
        nextSaved ? "장소를 저장했어요" : "저장을 해제했어요",
        ToastAndroid.SHORT,
      );
    },
    onError: (_error, { nextSaved }, context) => {
      // 조회 전 토글이라 캐시가 없던 경우(previous가 undefined)엔 낙관적으로 써넣은 값을
      // 지워 원상복구한다. 캐시가 있었으면 그 스냅샷으로 되돌린다.
      if (context?.previous === undefined) {
        queryClient.removeQueries({ queryKey: queryKeys.user.savedStores() });
      } else {
        queryClient.setQueryData(
          queryKeys.user.savedStores(),
          context.previous,
        );
      }
      ToastAndroid.show(
        nextSaved ? "저장하지 못했어요" : "해제하지 못했어요",
        ToastAndroid.SHORT,
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.user.savedStores(),
      });
    },
  });
}
