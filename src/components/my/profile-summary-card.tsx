import { ChevronRight, Dog } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { UserSummary } from "@/types/user";

export function ProfileSummaryCard({
  user,
  onPressReviews,
  onLogout,
}: {
  user: UserSummary;
  onPressReviews: () => void;
  onLogout: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Dog size={24} color={Palette.main[500]} />
        </View>
        <ThemedText
          type="subtitle01"
          color={Palette.gray[700]}
          style={styles.name}
        >
          {user.nickname}
        </ThemedText>
        <Pressable onPress={onLogout} hitSlop={8} accessibilityRole="button">
          <ThemedText type="label05" color={Palette.gray[400]}>
            로그아웃
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.stats}>
        <Pressable
          style={styles.stat}
          onPress={onPressReviews}
          accessibilityRole="button"
          accessibilityLabel="내가 쓴 리뷰 목록 보기"
        >
          <View style={styles.statLabelRow}>
            <ThemedText type="label05" color={Palette.gray[500]}>
              내가 쓴 리뷰
            </ThemedText>
            <ChevronRight size={14} color={Palette.gray[400]} />
          </View>
          <ThemedText type="head03" color={Palette.gray[700]}>
            {user.reviewCount}
          </ThemedText>
        </Pressable>

        <View style={styles.divider} />

        <View style={styles.stat}>
          <ThemedText type="label05" color={Palette.gray[500]}>
            모은 도장
          </ThemedText>
          <ThemedText type="head03" color={Palette.gray[700]}>
            {user.stampCount}
          </ThemedText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    backgroundColor: Palette.background.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
  },
  avatar: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255, 154, 134, 0.16)",
  },
  name: {
    flex: 1,
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    gap: Spacing.two,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
  },
  divider: {
    width: 1,
    alignSelf: "stretch",
    marginHorizontal: Spacing.three,
    backgroundColor: Palette.border.disabled,
  },
});
