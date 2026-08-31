import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Spacing } from "@/constants/theme";

/** 리뷰 플로우 헤더 2줄 타이틀(영수증·입력 공유). `headerTitle`에 넘겨 쓴다. */
export function ReviewHeaderTitle({ placeName }: { placeName: string }) {
  return (
    <View style={styles.wrap}>
      <ThemedText type="subtitle02" color={Palette.gray[700]}>
        리뷰 작성하기
      </ThemedText>
      <ThemedText type="label06" color={Palette.gray[400]}>
        {placeName}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    gap: Spacing.half,
  },
});
