import { useState } from "react";

import { useLocalSearchParams } from "expo-router";
import { Flag, Trash2 } from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReportModal } from "@/components/review/report-modal";
import { ReviewCard } from "@/components/review/review-card";
import { ThemedText } from "@/components/themed-text";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingView } from "@/components/ui/loading-view";
import { PopoverMenu, type MenuAnchor } from "@/components/ui/popover-menu";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Spacing } from "@/constants/theme";
import { useStoreDetailQuery } from "@/hooks/use-store-detail-query";
import { useStoreReviewsQuery } from "@/hooks/use-store-reviews-query";

type ReviewMenu = { anchor: MenuAnchor; reviewId: string; mine: boolean };

/**
 * 리뷰 전체보기(NEW). 상세 시트의 [전체보기 >]로 진입하는 별도 화면.
 * 무한스크롤로 모든 리뷰를 이어붙여 보여준다.
 * 각 리뷰의 ⋯ → 본인 리뷰면 삭제, 남의 리뷰면 신고(신고 API 미구현: 접수 안내만).
 */
export default function StoreReviewsScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const insets = useSafeAreaInsets();

  const { data: place } = useStoreDetailQuery(placeId);
  const reviewsQuery = useStoreReviewsQuery(placeId);

  const [menu, setMenu] = useState<ReviewMenu | null>(null);
  const [reportOpen, setReportOpen] = useState(false);

  const reviews = reviewsQuery.data?.pages.flat() ?? [];

  const openReport = () => {
    setMenu(null);
    setReportOpen(true);
  };

  const submitReport = () => {
    setReportOpen(false);
    ToastAndroid.show("신고가 접수됐어요", ToastAndroid.SHORT);
  };

  const openDelete = () => {
    setMenu(null);
  };

  if (reviewsQuery.isLoading) {
    return (
      <View style={styles.root}>
        <ScreenHeader title={place?.name ?? "리뷰"} />
        <LoadingView />
      </View>
    );
  }

  if (reviewsQuery.isError) {
    return (
      <View style={styles.root}>
        <ScreenHeader title={place?.name ?? "리뷰"} />
        <ErrorState
          message="리뷰를 불러오지 못했어요"
          onRetry={() => reviewsQuery.refetch()}
        />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScreenHeader title={place?.name ?? "리뷰"} />

      <FlatList
        data={reviews}
        keyExtractor={(review) => review.id}
        renderItem={({ item }) => (
          <View style={styles.rowPad}>
            <ReviewCard
              review={item}
              onMenu={(anchor) =>
                setMenu({ anchor, reviewId: item.id, mine: item.mine })
              }
            />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.list,
          reviews.length === 0 && styles.listEmpty,
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (reviewsQuery.hasNextPage && !reviewsQuery.isFetchingNextPage) {
            reviewsQuery.fetchNextPage();
          }
        }}
        ListHeaderComponent={
          reviews.length > 0 ? (
            <View style={styles.listHeader}>
              <ThemedText
                type="subtitle02"
                color={Palette.gray[700]}
                style={styles.rowPad}
              >
                전체 리뷰 {place?.reviewCount ?? reviews.length}건
                <ThemedText type="label03" color={Palette.gray[400]}>
                  {"  ·  최신순"}
                </ThemedText>
              </ThemedText>
            </View>
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
        ListEmptyComponent={
          <EmptyState
            title="아직 리뷰가 없어요"
            subtitle="첫 리뷰를 남겨보세요!"
            actionLabel={null}
          />
        }
      />

      <PopoverMenu
        anchor={menu?.anchor ?? null}
        onClose={() => setMenu(null)}
        items={
          menu?.mine
            ? [
                {
                  label: "삭제",
                  Icon: Trash2,
                  onPress: openDelete,
                  destructive: true,
                },
              ]
            : [
                {
                  label: "신고",
                  Icon: Flag,
                  onPress: openReport,
                  destructive: true,
                },
              ]
        }
      />

      <ReportModal
        visible={reportOpen}
        onClose={() => setReportOpen(false)}
        onSubmit={submitReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  list: {
    paddingTop: Spacing.three,
  },
  listEmpty: {
    flexGrow: 1,
  },
  rowPad: {
    paddingHorizontal: Spacing.four,
  },
  listHeader: {
    paddingVertical: Spacing.two,
  },
  separator: {
    height: 1,
    backgroundColor: Palette.border.disabled,
  },
  footerLoader: {
    paddingVertical: Spacing.four,
  },
});
