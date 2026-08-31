import { useState, type ReactNode, type Ref } from "react";

import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { Palette, Radius, Spacing, Typography } from "@/constants/theme";

import { ThemedText } from "../themed-text";

const ERROR_COLOR = Palette.error[300];

export type TextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
  rightAccessory?: ReactNode;
  focusColor?: string;
  ref?: Ref<TextInput>;
};

export function TextField({
  label,
  error,
  containerStyle,
  rightAccessory,
  focusColor = Palette.black,
  style,
  onFocus,
  onBlur,
  ref,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? ERROR_COLOR
    : focused
      ? focusColor
      : Palette.border.default;

  const input = (
    <TextInput
      ref={ref}
      placeholderTextColor={Palette.gray[300]}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[
        styles.input,
        rightAccessory ? styles.inputBare : { borderColor },
        style,
      ]}
      {...rest}
    />
  );

  return (
    <View style={containerStyle}>
      {label ? (
        <ThemedText
          type="label03"
          color={Palette.gray[500]}
          style={styles.label}
        >
          {label}
        </ThemedText>
      ) : null}

      {rightAccessory ? (
        <View style={[styles.inputWrap, { borderColor }]}>
          {input}
          {rightAccessory}
        </View>
      ) : (
        input
      )}

      {error ? (
        <ThemedText type="label06" color={ERROR_COLOR} style={styles.error}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.two,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.medium,
    backgroundColor: Palette.white,
    paddingRight: Spacing.two,
    gap: Spacing.two,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.medium,
    backgroundColor: Palette.white,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    color: Palette.gray[700],
    ...Typography.label02,
    includeFontPadding: false,
    outlineWidth: 0,
    outlineStyle: "none" as "solid",
  },
  inputBare: {
    flex: 1,
    minWidth: 0,
    borderWidth: 0,
    borderRadius: 0,
    backgroundColor: "transparent",
  },
  error: {
    marginTop: Spacing.one,
  },
});
