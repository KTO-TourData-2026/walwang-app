import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { Heart, Map, UserRound, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Palette, Spacing } from "@/constants/theme";

import { ThemedText } from "./themed-text";

/**
 * 웹 탭바. 네이티브(app-tabs.tsx)의 커스텀 탭바와 비주얼을 맞춘다.
 * 웹은 native `Tabs`의 커스텀 tabBar 제약이 있어 `expo-router/ui`로 구성하되,
 * 아이콘·라벨·강조 색 규칙은 네이티브와 동일하게 렌더한다.
 */
export default function AppTabs() {
  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList asChild>
        <TabBar>
          <TabTrigger name="saved" href="/saved" asChild>
            <TabButton Icon={Heart}>저장</TabButton>
          </TabTrigger>
          <TabTrigger name="map" href="/map" asChild>
            <TabButton Icon={Map}>지도</TabButton>
          </TabTrigger>
          <TabTrigger name="my" href="/my" asChild>
            <TabButton Icon={UserRound}>마이</TabButton>
          </TabTrigger>
        </TabBar>
      </TabList>
    </Tabs>
  );
}

function TabBar({ children, ...props }: { children?: React.ReactNode }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      {...props}
      style={[styles.bar, { paddingBottom: insets.bottom + Spacing.one }]}
    >
      {children}
    </View>
  );
}

type TabButtonProps = TabTriggerSlotProps & { Icon: LucideIcon };

function TabButton({ children, isFocused, Icon, ...props }: TabButtonProps) {
  const color = isFocused ? Palette.main[500] : Palette.gray[400];

  return (
    <Pressable
      {...props}
      style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
    >
      <Icon size={24} color={color} strokeWidth={isFocused ? 2.4 : 2} />
      <ThemedText
        type={isFocused ? "subtitle05" : "label06"}
        color={color}
        style={styles.label}
      >
        {children}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    height: "100%",
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    paddingTop: Spacing.two,
    backgroundColor: Palette.background.base,
    borderTopWidth: 1,
    borderTopColor: Palette.border.disabled,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.half,
    paddingVertical: Spacing.one,
  },
  tabPressed: {
    transform: [{ scale: 0.94 }],
  },
  // 선택/비선택 라벨의 lineHeight 차이로 아이콘~글자 간격이 흔들리지 않게 고정
  label: {
    lineHeight: 16,
  },
});
