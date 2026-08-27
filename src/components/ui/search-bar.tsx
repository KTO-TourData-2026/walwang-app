import type { Ref } from "react";

import { Search } from "lucide-react-native";
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { Palette, Radius, Spacing, Typography } from "@/constants/theme";

export type SearchBarProps = Omit<TextInputProps, "style"> & {
  containerStyle?: StyleProp<ViewStyle>;
  ref?: Ref<TextInput>;
};

export function SearchBar({
  containerStyle,
  placeholder = "검색",
  ref,
  ...rest
}: SearchBarProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        ref={ref}
        placeholder={placeholder}
        placeholderTextColor={Palette.gray[300]}
        returnKeyType="search"
        style={styles.input}
        {...rest}
      />
      <Search size={20} color={Palette.main[500]} strokeWidth={2.2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    height: 52,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border.default,
    backgroundColor: Palette.white,
  },
  input: {
    flex: 1,
    minWidth: 0,
    color: Palette.gray[700],
    ...Typography.label02,
    includeFontPadding: false,
    outlineWidth: 0,
    outlineStyle: "none" as "solid",
  },
});
