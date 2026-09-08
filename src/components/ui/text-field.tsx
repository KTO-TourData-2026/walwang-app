import { useState, type ReactNode, type Ref } from "react";

import { Eye, EyeClosed } from "lucide-react-native";
import {
  Pressable,
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
  /** 우측에 표시/숨김 눈 아이콘을 띄운다(비밀번호 입력란). 켜면 기본은 가려진 상태. */
  secureToggle?: boolean;
  focusColor?: string;
  ref?: Ref<TextInput>;
};

export function TextField({
  label,
  error,
  containerStyle,
  rightAccessory,
  secureToggle = false,
  secureTextEntry,
  focusColor = Palette.black,
  style,
  onFocus,
  onBlur,
  ref,
  ...rest
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  const borderColor = error
    ? ERROR_COLOR
    : focused
      ? focusColor
      : Palette.border.default;

  // secureToggle이면 눈 상태로 가림 여부를 정한다(기본 가림). 아니면 전달값 그대로.
  const isSecure = secureToggle ? !visible : secureTextEntry;

  // 눈 아이콘은 rightAccessory 자리를 공유한다(둘을 함께 쓰는 입력란은 없다).
  const right = secureToggle ? (
    <Pressable
      onPress={() => setVisible((prev) => !prev)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={visible ? "비밀번호 숨기기" : "비밀번호 보기"}
      style={styles.eyeButton}
    >
      {/* 뜬 눈=보임, 감은 눈=가림. 표준(아이콘이 현재 표시 상태를 나타냄). */}
      {visible ? (
        <Eye size={20} color={Palette.gray[400]} />
      ) : (
        <EyeClosed size={20} color={Palette.gray[400]} />
      )}
    </Pressable>
  ) : (
    rightAccessory
  );

  const input = (
    <TextInput
      ref={ref}
      placeholderTextColor={Palette.gray[300]}
      secureTextEntry={isSecure}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={[styles.input, right ? styles.inputBare : { borderColor }, style]}
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

      {right ? (
        <View style={[styles.inputWrap, { borderColor }]}>
          {input}
          {right}
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
    // 우측 액세서리(눈·중복확인)와의 간격은 wrap의 gap이 잡는다 → 입력 영역을 오른쪽으로 넓힌다.
    paddingRight: 0,
    backgroundColor: "transparent",
  },
  eyeButton: {
    paddingHorizontal: Spacing.one,
    paddingVertical: Spacing.two,
  },
  error: {
    marginTop: Spacing.one,
  },
});
