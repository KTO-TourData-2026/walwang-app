import { PawPrint } from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";

export type RecommendFabProps = {
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
};

export function RecommendFab({ onPress, style }: RecommendFabProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="추천받기"
      style={({ pressed }) => [styles.fab, pressed && styles.pressed, style]}
    >
      <PawPrint size={20} color={Palette.white} fill={Palette.white} />
      <ThemedText type="subtitle03" color={Palette.white}>
        추천받기
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fab: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    backgroundColor: Palette.main[400],
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
