import { Image } from "expo-image";
import { Dog } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { HashtagChipList } from "@/components/place/hashtag-chip";
import { ReviewResultBadge } from "@/components/review/review-result-badge";
import { ThemedText } from "@/components/themed-text";
import { SIZE_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { Review } from "@/types/review";
import { formatReviewDate } from "@/utils/date";

/**
 * 리뷰 전체보기 화면의 리뷰 카드(전체 내용).
 * 상단: 프사 · 닉네임 · 크기 ⋯ 결과 배지(우측) / 인증 사진 / 내용 / 해시태그 / 날짜(하단 우측).
 * 거절 리뷰는 사진이 없어(photoUrl null) 텍스트만 렌더한다.
 */
export function ReviewCard({ review }: { review: Review }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Dog size={22} color={Palette.main[500]} />
          </View>
          <ThemedText
            type="subtitle03"
            color={Palette.gray[700]}
            numberOfLines={1}
            style={styles.nameText}
          >
            {review.nickname}
            <ThemedText type="label04" color={Palette.gray[300]}>
              {"  ·  "}
            </ThemedText>
            <ThemedText type="label04" color={Palette.gray[500]}>
              {SIZE_LABEL[review.dogSize]}
            </ThemedText>
          </ThemedText>
        </View>

        <ReviewResultBadge
          allowed={review.dogAllowed}
          textType="subtitle04"
          paddingVertical={6}
          paddingHorizontal={10}
        />
      </View>

      {review.photoUrl ? (
        <Image
          source={{ uri: review.photoUrl }}
          style={styles.photo}
          contentFit="cover"
          transition={150}
          accessibilityLabel="반려견 인증 사진"
        />
      ) : null}

      {review.content ? (
        <ThemedText
          type="label01"
          color={Palette.gray[700]}
          style={styles.content}
        >
          {review.content}
        </ThemedText>
      ) : null}

      <HashtagChipList tags={review.tags} />

      <ThemedText type="label06" color={Palette.gray[400]} style={styles.date}>
        {formatReviewDate(review.createdAt)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.two,
    paddingVertical: 20,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    flexShrink: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 154, 134, 0.12)",
  },
  nameText: {
    flexShrink: 1,
  },
  content: {
    paddingVertical: Spacing.two,
  },
  photo: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: Radius.medium,
    backgroundColor: Palette.gray[100],
  },
  date: {
    alignSelf: "flex-end",
  },
});
