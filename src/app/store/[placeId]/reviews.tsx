import { useLocalSearchParams } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReviewCard } from "@/components/review/review-card";
import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Spacing } from "@/constants/theme";
import { MOCK_PLACES } from "@/mocks/places";
import { getPlaceReviews } from "@/mocks/reviews";

/**
 * 리뷰 전체보기(NEW). 상세 시트의 [전체보기 >]로 진입하는 별도 화면.
 * 모든 리뷰를 한 화면 스크롤 목록으로 보여준다.
 * 거절 리뷰는 사진 자리 없이 텍스트만 렌더된다(ReviewCard가 처리).
 */
export default function StoreReviewsScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const insets = useSafeAreaInsets();

  const place = MOCK_PLACES.find((item) => item.id === placeId);
  const reviews = getPlaceReviews(placeId ?? "");

  return (
    <View style={styles.root}>
      <ScreenHeader title={place?.name ?? "리뷰"} />

      <FlatList
        data={reviews}
        keyExtractor={(review) => review.id}
        renderItem={({ item }) => (
          <View style={styles.rowPad}>
            <ReviewCard review={item} />
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.list,
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <ThemedText
              type="subtitle02"
              color={Palette.gray[700]}
              style={styles.rowPad}
            >
              전체 리뷰 {reviews.length}건
              <ThemedText type="label03" color={Palette.gray[400]}>
                {"  ·  최신순"}
              </ThemedText>
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <ThemedText type="label03" color={Palette.gray[500]}>
              아직 리뷰가 없어요
            </ThemedText>
          </View>
        }
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
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.six,
  },
});
