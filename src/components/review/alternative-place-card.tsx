import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CATEGORY_LABEL } from "@/constants/category";
import { SIZE_LABEL, STATUS_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { Place, SizeKey } from "@/types/place";

export function AlternativePlaceCard({
  place,
  size,
  onPress,
}: {
  place: Place;
  size: SizeKey;
  onPress: (placeId: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(place.id)}
      accessibilityRole="button"
      accessibilityLabel={`${place.name} 상세 보기`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <ThemedText type="subtitle03" color={Palette.gray[700]}>
        {place.name}
      </ThemedText>
      {place.location ? (
        <ThemedText type="label05" color={Palette.gray[400]}>
          {place.location}
        </ThemedText>
      ) : null}
      <View style={styles.metaRow}>
        <ThemedText type="label04" color={Palette.gray[500]}>
          {CATEGORY_LABEL[place.category]}
        </ThemedText>
        <ThemedText type="label04" color={Palette.gray[300]}>
          ·
        </ThemedText>
        <ThemedText type="label04" color={Palette.gray[500]}>
          {SIZE_LABEL[size]}
        </ThemedText>
        <ThemedText type="subtitle04" color={Palette.status.allowed[300]}>
          {STATUS_LABEL.allowed}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 6,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    backgroundColor: Palette.white,
  },
  pressed: {
    backgroundColor: Palette.background.subtle,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginTop: Spacing.half,
  },
});
