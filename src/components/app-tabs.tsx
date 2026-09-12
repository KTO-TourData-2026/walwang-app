import { Tabs } from "expo-router";
import { Heart, Map, UserRound, type LucideIcon } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Palette, Spacing } from "@/constants/theme";

import { ThemedText } from "./themed-text";

type TabDef = { name: string; label: string; Icon: LucideIcon };

/** expo-router가 react-navigation을 내부 번들해 타입 경로가 불안정하므로, 쓰는 필드만 구조적으로 선언한다. */
type TabBarProps = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: {
    emit: (event: {
      type: "tabPress";
      target: string;
      canPreventDefault: true;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
};

const TABS: TabDef[] = [
  { name: "saved", label: "저장", Icon: Heart },
  { name: "map", label: "지도", Icon: Map },
  { name: "my", label: "마이", Icon: UserRound },
];

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(props) => (
        <CustomTabBar {...(props as unknown as TabBarProps)} />
      )}
    >
      {TABS.map((tab) => (
        <Tabs.Screen key={tab.name} name={tab.name} />
      ))}
    </Tabs>
  );
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + Spacing.one }]}>
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) {
          return null;
        }

        const focused = state.index === index;
        const color = focused ? Palette.main[500] : Palette.gray[400];
        const { Icon } = tab;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            style={({ pressed }) => [styles.tab, pressed && styles.tabPressed]}
          >
            <Icon size={24} color={color} strokeWidth={focused ? 2.4 : 2} />
            <ThemedText
              type={focused ? "subtitle05" : "label06"}
              color={color}
              style={styles.label}
            >
              {tab.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
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
