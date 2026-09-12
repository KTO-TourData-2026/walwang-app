import {
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Palette, Radius, Spacing } from "@/constants/theme";

import { ThemedText } from "../themed-text";

export type CheckboxProps = {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  style?: StyleProp<ViewStyle>;
};

export function Checkbox({ label, checked, onChange, style }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={() => onChange(!checked)}
      style={[styles.row, style]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? (
          <ThemedText type="subtitle05" color={Palette.white}>
            ✓
          </ThemedText>
        ) : null}
      </View>
      <ThemedText type="label04" color={Palette.gray[700]} style={styles.label}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  box: {
    width: 20,
    height: 20,
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: Palette.border.default,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: {
    backgroundColor: Palette.main[500],
    borderColor: Palette.main[500],
  },
  label: {
    includeFontPadding: false,
    textAlignVertical: "center",
  },
});
