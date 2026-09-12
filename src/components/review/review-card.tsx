import { useRef, useState } from "react";

import { Image } from "expo-image";
import { Dog, MoreVertical } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { HashtagChipList } from "@/components/place/hashtag-chip";
import { ReviewResultBadge } from "@/components/review/review-result-badge";
import { ThemedText } from "@/components/themed-text";
import { type MenuAnchor } from "@/components/ui/popover-menu";
import { SIZE_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { Review } from "@/types/review";
import { formatReviewDate } from "@/utils/date";
import { isLoadableImageUrl } from "@/utils/stamp";

/**
 * 리뷰 전체보기 화면의 리뷰 카드(전체 내용).
 * 상단: 프사 · 닉네임 · 크기 ⋯ 결과 배지(우측) / 인증 사진 / 내용 / 해시태그 / 날짜(하단 우측).
 * 거절 리뷰는 사진이 없어(photoUrl null) 텍스트만 렌더한다.
 * onMenu를 주면 우상단에 ⋯(신고 등) 버튼을 노출한다.
 */
export function ReviewCard({
  review,
  onMenu,
}: {
  review: Review;
  onMenu?: (anchor: MenuAnchor) => void;
}) {
  const menuRef = useRef<View>(null);
  // 이미지 로드 실패/도달 불가 URL이면 대기 없이 강아지 얼굴 아이콘으로 폴백한다.
  const [photoFailed, setPhotoFailed] = useState(false);
  const showPhoto = isLoadableImageUrl(review.photoUrl) && !photoFailed;

  const openMenu = () => {
    menuRef.current?.measureInWindow((x, y, width, height) =>
      onMenu?.({ x, y, width, height }),
    );
  };

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

        <View style={styles.rightCluster}>
          <ReviewResultBadge
            allowed={review.dogAllowed}
            textType="subtitle04"
            paddingVertical={6}
            paddingHorizontal={10}
          />
          {onMenu ? (
            <Pressable
              ref={menuRef}
              onPress={openMenu}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="리뷰 더보기"
              style={styles.menuButton}
            >
              <MoreVertical
                size={18}
                color={Palette.gray[300]}
                strokeWidth={1.75}
              />
            </Pressable>
          ) : null}
        </View>
      </View>

      {review.photoUrl ? (
        showPhoto ? (
          <Image
            source={{ uri: review.photoUrl }}
            style={styles.photo}
            contentFit="cover"
            transition={150}
            accessibilityLabel="반려견 인증 사진"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Dog size={56} color={Palette.gray[300]} strokeWidth={1.6} />
          </View>
        )
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
  rightCluster: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  menuButton: {
    padding: Spacing.half,
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
  photoFallback: {
    alignItems: "center",
    justifyContent: "center",
  },
  date: {
    alignSelf: "flex-end",
  },
});
