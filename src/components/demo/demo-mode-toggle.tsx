import { Info } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useDemoMode } from "@/stores/demo-mode";

// 작은 실사용/데모 토글(docs/demo-mode.md §7-2). 양쪽 모드에서 상시 노출한다.
// 세그먼트 탭 → 즉시 전환(setDemo). ⓘ 탭 → 전체 안내 모달(§6-1).
const OPTIONS = [
  { value: false, label: "실사용" },
  { value: true, label: "데모" },
] as const;

export function DemoModeToggle() {
  const isDemo = useDemoMode((state) => state.isDemo);
  const setDemo = useDemoMode((state) => state.setDemo);
  const openNotice = useDemoMode((state) => state.openNotice);

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        {OPTIONS.map((option) => {
          const selected = option.value === isDemo;
          return (
            <Pressable
              key={option.label}
              onPress={() => setDemo(option.value)}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              style={[styles.segment, selected && styles.segmentSelected]}
            >
              <ThemedText
                type="label05"
                color={selected ? Palette.main[500] : Palette.gray[400]}
              >
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>

      {/* 데모일 때 상시 disclosure(§5-3 "명시") — 트랙과 ⓘ 사이 인라인. */}
      {isDemo ? (
        <ThemedText type="label05" color={Palette.main[500]}>
          모든 데이터는 목 데이터입니다
        </ThemedText>
      ) : null}

      <Pressable
        onPress={openNotice}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="실사용·데모 모드 안내"
        style={styles.info}
      >
        <Info size={18} color={Palette.gray[500]} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: Palette.white,
    // 지도 위에 얹히므로 그림자로 떠 보이게(안드로이드 elevation).
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  track: {
    flexDirection: "row",
    gap: Spacing.half,
    padding: Spacing.half,
    borderRadius: Radius.pill,
    backgroundColor: Palette.gray[100],
  },
  segment: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
  },
  segmentSelected: {
    backgroundColor: Palette.white,
  },
  info: {
    paddingRight: Spacing.half,
  },
});
