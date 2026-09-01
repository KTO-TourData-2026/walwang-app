import { Map, type LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";

export type EmptyStateProps = {
  message: string;
  Icon?: LucideIcon;
  /** null이면 액션 버튼 숨김. */
  actionLabel?: string | null;
  onAction?: () => void;
};

export function EmptyState({
  message,
  Icon = Map,
  actionLabel = "지도로 가기",
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon size={30} color={Palette.main[500]} />
      </View>
      <ThemedText
        type="label03"
        color={Palette.gray[500]}
        style={styles.message}
      >
        {message}
      </ThemedText>
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
  message: {
    textAlign: "center",
  },
  button: {
    marginTop: Spacing.one,
    paddingHorizontal: Spacing.five,
  },
});
