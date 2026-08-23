import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

/**
 * 라우팅만 먼저 뚫어두기 위한 임시 화면.
 * 실제 UI를 붙이면서 하나씩 지워나갈 용도이므로, 여기에 로직을 추가하지 말 것.
 */
export function ScreenStub({
  name,
  detail,
}: {
  name: string;
  detail?: string;
}) {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle">{name}</ThemedText>
      {detail ? (
        <ThemedText type="small" themeColor="textSecondary">
          {detail}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    padding: Spacing.four,
  },
});
