import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { Palette, Radius, Spacing } from "@/constants/theme";

import { ThemedText } from "../themed-text";

type ButtonVariant = "primary" | "secondary" | "main";

const VARIANT_COLORS: Record<
  ButtonVariant,
  { background: string; border: string; text: string }
> = {
  primary: {
    background: Palette.black,
    border: Palette.black,
    text: Palette.white,
  },
  secondary: {
    background: Palette.white,
    border: Palette.border.default,
    text: Palette.gray[700],
  },
  main: {
    background: Palette.main[400],
    border: Palette.main[400],
    text: Palette.white,
  },
};

const DISABLED_COLORS = {
  background: Palette.gray[300],
  border: Palette.gray[300],
  text: Palette.white,
};

export type ButtonProps = Omit<PressableProps, "style" | "children"> & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  disabled = false,
  style,
  ...rest
}: ButtonProps) {
  const isInactive = disabled || loading;
  const colors = isInactive ? DISABLED_COLORS : VARIANT_COLORS[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: colors.background, borderColor: colors.border },
        pressed && styles.pressed,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={colors.text} />
      ) : (
        <ThemedText type="subtitle03" color={colors.text}>
          {label}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.medium,
    borderWidth: 1,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    minHeight: 52,
  },
  pressed: {
    opacity: 0.85,
  },
});
