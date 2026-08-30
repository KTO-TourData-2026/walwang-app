import {
  Pressable,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";

export type SelectChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** 선택형 pill 칩(크기·목적·시간·해시태그 공통). 기본 스타일은 해시태그 칩과 통일. */
export function SelectChip({
  label,
  selected,
  onPress,
  disabled = false,
  style,
}: SelectChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipDefault,
        disabled && styles.chipDisabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <ThemedText
        type="label03"
        color={selected ? Palette.white : Palette.main[500]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    paddingVertical: Spacing.one,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
  },
  chipDefault: {
    backgroundColor: "rgba(255, 154, 134, 0.12)",
  },
  chipSelected: {
    backgroundColor: Palette.main[400],
  },
  chipDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.85,
  },
});
