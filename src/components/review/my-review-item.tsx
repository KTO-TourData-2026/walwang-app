import { useRef } from "react";

import { Image } from "expo-image";
import { MoreVertical } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ReviewResultBadge } from "@/components/review/review-result-badge";
import { ThemedText } from "@/components/themed-text";
import { type MenuAnchor } from "@/components/ui/popover-menu";
import { CATEGORY_LABEL } from "@/constants/category";
import { SIZE_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { Place } from "@/types/place";
import type { Review } from "@/types/review";
import { formatMonthDay } from "@/utils/date";

export function MyReviewItem({
  review,
  place,
  onPress,
  onMenu,
}: {
  review: Review;
  place: Place;
  onPress: (placeId: string) => void;
  onMenu?: (review: Review, anchor: MenuAnchor) => void;
}) {
  const thumbnail = review.thumbnailUrl ?? review.photoUrl;
  const menuRef = useRef<View>(null);

  const openMenu = () => {
    menuRef.current?.measureInWindow((x, y, width, height) =>
      onMenu?.(review, { x, y, width, height }),
    );
  };

  return (
    <Pressable
      onPress={() => onPress(place.id)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      {thumbnail ? (
        <Image
          source={{ uri: thumbnail }}
          style={styles.thumbnail}
          contentFit="cover"
          transition={150}
          accessibilityLabel={`${place.name} 리뷰 사진`}
        />
      ) : null}

      <View style={styles.content}>
        <View style={styles.topRow}>
          <ReviewResultBadge allowed={review.dogAllowed} />
          <ThemedText type="label05" color={Palette.gray[400]}>
            {formatMonthDay(review.createdAt)}
          </ThemedText>
        </View>

        <ThemedText type="subtitle03" color={Palette.gray[700]}>
          {place.name}
        </ThemedText>
        <ThemedText type="label05" color={Palette.gray[400]}>
          {CATEGORY_LABEL[place.category]} · {SIZE_LABEL[review.dogSize]}
        </ThemedText>
      </View>

      {onMenu ? (
        <Pressable
          ref={menuRef}
          onPress={openMenu}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${place.name} 리뷰 더보기`}
          style={styles.menuButton}
        >
          <MoreVertical
            size={20}
            color={Palette.gray[300]}
            strokeWidth={1.75}
          />
        </Pressable>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  menuButton: {
    alignSelf: "flex-start",
    marginTop: -Spacing.one,
    marginRight: -Spacing.two,
    padding: Spacing.one,
  },
  pressed: {
    backgroundColor: Palette.background.subtle,
  },
  content: {
    flex: 1,
    gap: 6,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: Radius.medium,
    backgroundColor: Palette.gray[100],
  },
});
