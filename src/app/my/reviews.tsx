import { useState } from "react";

import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { MessageCircleDashed, Trash2 } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { queryKeys } from "@/api/query-keys";
import { MyReviewItem } from "@/components/review/my-review-item";
import { ThemedText } from "@/components/themed-text";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingView } from "@/components/ui/loading-view";
import { PopoverMenu, type MenuAnchor } from "@/components/ui/popover-menu";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Spacing } from "@/constants/theme";
import { useDeleteReviewMutation } from "@/hooks/use-delete-review-mutation";
import { useMyReviewsQuery } from "@/hooks/use-my-reviews-query";
import type { MyReview } from "@/types/review";

type DeleteMenu = { anchor: MenuAnchor; reviewId: string };

export default function MyReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [menu, setMenu] = useState<DeleteMenu | null>(null);

  const reviewsQuery = useMyReviewsQuery();
  const deleteMutation = useDeleteReviewMutation();

  const reviews = reviewsQuery.data?.pages.flat() ?? [];

  const openStore = (storeId: string) =>
    router.push({ pathname: "/store/[placeId]", params: { placeId: storeId } });

  const deleteActive = () => {
    if (!menu) {
      return;
    }
    const { reviewId } = menu;
    setMenu(null);
    // 낙관적 제거: 성공 응답 전에 목록에서 먼저 지운다. 실패 시 onError에서 되돌린다.
    queryClient.setQueryData<InfiniteData<MyReview[], number>>(
      queryKeys.user.myReviews(),
      (old) =>
        old
          ? {
              ...old,
              pages: old.pages.map((page) =>
                page.filter((review) => review.id !== reviewId),
              ),
            }
          : old,
    );
    deleteMutation.mutate(
      { reviewId },
      {
        onSuccess: () =>
          ToastAndroid.show("리뷰를 삭제했어요", ToastAndroid.SHORT),
        onError: () => {
          ToastAndroid.show("삭제하지 못했어요", ToastAndroid.SHORT);
          queryClient.invalidateQueries({
            queryKey: queryKeys.user.myReviews(),
          });
        },
      },
    );
  };

  if (reviewsQuery.isLoading) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="내가 쓴 리뷰" />
        <LoadingView />
      </View>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="내가 쓴 리뷰" />
        <ErrorState
          message="리뷰를 불러오지 못했어요"
          onRetry={() => reviewsQuery.refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title="내가 쓴 리뷰" />

      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          reviews.length === 0 && styles.listEmpty,
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
        ItemSeparatorComponent={Separator}
        showsVerticalScrollIndicator={false}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (reviewsQuery.hasNextPage && !reviewsQuery.isFetchingNextPage) {
            reviewsQuery.fetchNextPage();
          }
        }}
        ListHeaderComponent={
          reviews.length > 0 ? (
            <ThemedText
              type="label05"
              color={Palette.gray[400]}
              style={styles.summary}
            >
              최신순 · {reviews.length}건
            </ThemedText>
          ) : null
        }
        ListFooterComponent={
          reviewsQuery.isFetchingNextPage ? (
            <ActivityIndicator
              color={Palette.main[500]}
              style={styles.footerLoader}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <MyReviewItem
            review={item}
            onPress={openStore}
            onMenu={(review, anchor) =>
              setMenu({ anchor, reviewId: review.id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            Icon={MessageCircleDashed}
            title="아직 남긴 리뷰가 없어요"
            subtitle="지도에서 방문한 곳의 리뷰를 남겨보세요"
          />
        }
      />

      <PopoverMenu
        anchor={menu?.anchor ?? null}
        onClose={() => setMenu(null)}
        items={[
          {
            label: "삭제",
            Icon: Trash2,
            onPress: deleteActive,
            destructive: true,
          },
        ]}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  listEmpty: {
    flexGrow: 1,
  },
  summary: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  separator: {
    height: 1,
    marginHorizontal: Spacing.four,
    backgroundColor: Palette.border.disabled,
  },
  footerLoader: {
    paddingVertical: Spacing.four,
  },
});
