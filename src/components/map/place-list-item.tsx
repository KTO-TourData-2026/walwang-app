import { Pressable, StyleSheet } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CATEGORY_LABEL } from "@/constants/category";
import { Palette, Spacing } from "@/constants/theme";
import type { Place } from "@/types/place";

export type PlaceListItemProps = {
  place: Place;
  onPress: (place: Place) => void;
};

export function PlaceListItem({ place, onPress }: PlaceListItemProps) {
  return (
    <Pressable
      onPress={() => onPress(place)}
      accessibilityRole="button"
      style={({ pressed }) => [styles.item, pressed && styles.pressed]}
    >
      <ThemedText type="subtitle03" color={Palette.gray[700]}>
        {place.name}
      </ThemedText>
      <ThemedText type="label05" color={Palette.gray[400]}>
        {CATEGORY_LABEL[place.category]} · {place.location}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    gap: Spacing.one,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  pressed: {
    backgroundColor: Palette.background.subtle,
  },
});
