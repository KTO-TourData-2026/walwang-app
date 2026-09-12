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

const DISABLED_OPACITY = 0.7;

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
  const colors = VARIANT_COLORS[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: colors.background,
          // 비활성 상태에는 stroke 색을 따로 지정하지 않는다(테두리 없이 dim만).
          borderColor: isInactive ? "transparent" : colors.border,
        },
        isInactive && styles.inactive,
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
    transform: [{ scale: 0.99 }],
  },
  inactive: {
    opacity: DISABLED_OPACITY,
  },
});
