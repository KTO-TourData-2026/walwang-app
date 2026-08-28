import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

import { ReviewResultBadge } from "@/components/review/review-result-badge";
import { ThemedText } from "@/components/themed-text";
import { SIZE_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { Review } from "@/types/review";
import { formatReviewDate } from "@/utils/date";

/**
 * 상세의 "최근 리뷰" 요약 행.
 * 좌측 썸네일(있으면) + 결과 배지 · 크기 · 요약(내용 2줄) · 작성일.
 * 거절 리뷰는 썸네일이 없어 텍스트만 나온다.
 */
export function ReviewSummaryRow({ review }: { review: Review }) {
  return (
    <View style={styles.container}>
      {review.thumbnailUrl ? (
        <Image
          source={{ uri: review.thumbnailUrl }}
          style={styles.thumb}
          contentFit="cover"
          transition={120}
          accessibilityLabel="리뷰 사진"
        />
      ) : null}

      <View style={styles.textCol}>
        <View style={styles.header}>
          <ReviewResultBadge allowed={review.dogAllowed} />
          <ThemedText type="label05" color={Palette.gray[600]}>
            {SIZE_LABEL[review.dogSize]}
          </ThemedText>
          <View style={styles.spacer} />
          <ThemedText type="label06" color={Palette.gray[400]}>
            {formatReviewDate(review.createdAt)}
          </ThemedText>
        </View>

        {review.content ? (
          <ThemedText
            type="label04"
            color={Palette.gray[700]}
            numberOfLines={2}
          >
            {review.content}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  textCol: {
    flex: 1,
    gap: 6,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  spacer: {
    flex: 1,
  },
  thumb: {
    width: 64,
    height: 64,
    borderRadius: Radius.medium,
    backgroundColor: Palette.gray[100],
  },
});
