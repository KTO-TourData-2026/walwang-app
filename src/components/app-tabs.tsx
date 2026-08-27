import { NativeTabs } from "expo-router/unstable-native-tabs";

import { Palette } from "@/constants/theme";

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Palette.background.base}
      indicatorColor={Palette.gray[100]}
      labelStyle={{ selected: { color: Palette.gray[700] } }}
    >
      <NativeTabs.Trigger name="map">
        <NativeTabs.Trigger.Label>지도</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map" md="map" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="saved">
        <NativeTabs.Trigger.Label>저장</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bookmark" md="bookmark" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="my">
        <NativeTabs.Trigger.Label>마이</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
