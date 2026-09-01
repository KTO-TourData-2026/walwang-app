import { type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";

export type SegmentOption<T extends string> = {
  value: T;
  label: string;
  Icon?: LucideIcon;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.track}>
      {options.map((option) => {
        const selected = option.value === value;
        const { Icon } = option;
        const contentColor = selected ? Palette.gray[700] : Palette.gray[400];
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            {Icon ? (
              <Icon
                size={18}
                color={selected ? Palette.main[500] : Palette.gray[400]}
                strokeWidth={selected ? 2.4 : 2}
              />
            ) : null}
            <ThemedText type="subtitle04" color={contentColor}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    gap: Spacing.one,
    padding: Spacing.one,
    borderRadius: Radius.large,
    backgroundColor: Palette.gray[100],
  },
  segment: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: 12,
    // 트랙 radius(large 20) − 트랙 패딩(one 4) = 16 이어야 안쪽 카드가 동심으로 맞는다.
    borderRadius: Radius.large - Spacing.one,
  },
  segmentSelected: {
    backgroundColor: Palette.white,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});
