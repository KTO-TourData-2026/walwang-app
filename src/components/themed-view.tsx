import { View, type ViewProps } from "react-native";

import { Palette } from "@/constants/theme";

export type ThemedViewProps = ViewProps & {
  /** 배경색. 기본은 화면 바탕색 */
  color?: string;
};

export function ThemedView({
  style,
  color = Palette.background.base,
  ...rest
}: ThemedViewProps) {
  return <View style={[{ backgroundColor: color }, style]} {...rest} />;
}
