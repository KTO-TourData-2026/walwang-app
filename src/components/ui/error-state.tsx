import { TriangleAlert } from "lucide-react-native";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";

export type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  onBack?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** 공용 에러 상태 — 문구 + [다시 시도] + (선택) [뒤로가기]. */
export function ErrorState({
  message = "정보를 불러오지 못했어요",
  onRetry,
  onBack,
  style,
}: ErrorStateProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconWrap}>
        <TriangleAlert size={30} color={Palette.error[300]} />
      </View>
      <ThemedText
        type="label03"
        color={Palette.gray[500]}
        style={styles.message}
      >
        {message}
      </ThemedText>
      {onRetry || onBack ? (
        <View style={styles.actions}>
          {onBack ? (
            <Button
              label="뒤로가기"
              variant="secondary"
              onPress={onBack}
              style={styles.button}
            />
          ) : null}
          {onRetry ? (
            <Button
              label="다시 시도"
              variant="secondary"
              onPress={onRetry}
              style={styles.button}
            />
          ) : null}
        </View>
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
    backgroundColor: Palette.error[100],
  },
  message: {
    textAlign: "center",
  },
  actions: {
    marginTop: Spacing.one,
    flexDirection: "row",
    gap: Spacing.two,
    alignItems: "center",
  },
  button: {
    minHeight: 0,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
});
