import { Map, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";

export type EmptyStateProps = {
  title: string;
  subtitle?: string;
  Icon?: LucideIcon;
  actionLabel?: string | null;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** 공용 빈 상태 — 원형 아이콘 + 제목·부제(2줄) + 선택 액션. */
export function EmptyState({
  title,
  subtitle,
  Icon = Map,
  actionLabel = "지도로 가기",
  onAction,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        <Icon size={30} color={Palette.main[500]} />
      </View>
      <View style={styles.text}>
        <ThemedText
          type="label03"
          color={Palette.gray[600]}
          style={styles.line}
        >
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText
            type="label04"
            color={Palette.gray[400]}
            style={styles.line}
          >
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <Button
          label={actionLabel}
          variant="main"
          onPress={onAction}
          style={styles.button}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  iconWrap: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255, 154, 134, 0.12)",
  },
  text: {
    alignItems: "center",
    gap: Spacing.half,
  },
  line: {
    textAlign: "center",
  },
  button: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.five,
  },
});
