import { type LucideIcon } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import {
  Palette,
  Radius,
  Spacing,
  type TypographyToken,
} from "@/constants/theme";

/** 상태 색 토큰 키 = 동반 상태 3단계와 동일. */
export type StatusTone = "allowed" | "denied" | "unknown";

export type StatusPillProps = {
  tone: StatusTone;
  label: string;
  Icon?: LucideIcon;
  /** 라벨 타이포 토큰 (기본 subtitle05) */
  textType?: TypographyToken;
  paddingVertical?: number;
  paddingHorizontal?: number;
  iconSize?: number;
};

/**
 * 상태 색(Palette.status)으로 그리는 알약형 배지.
 * 색만으로 구분하지 않도록 아이콘·텍스트를 함께 렌더한다(PRD 접근성).
 * 역할: 100=배경 · 300=텍스트/아이콘.
 * 글자 크기·패딩·아이콘 크기는 prop으로 호출부마다 조절한다.
 */
export function StatusPill({
  tone,
  label,
  Icon,
  textType = "subtitle05",
  paddingVertical = Spacing.one,
  paddingHorizontal = Spacing.two,
  iconSize = 13,
}: StatusPillProps) {
  const color = Palette.status[tone];

  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: color[100], paddingVertical, paddingHorizontal },
      ]}
    >
      {Icon ? (
        <Icon size={iconSize} color={color[300]} strokeWidth={2.6} />
      ) : null}
      <ThemedText type={textType} color={color[300]}>
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
    borderRadius: Radius.pill,
  },
});
