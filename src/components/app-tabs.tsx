import { NativeTabs } from "expo-router/unstable-native-tabs";

import { Palette } from "@/constants/theme";

/**
 * 네이티브 탭바 (Android/iOS).
 *
 * [함정] NativeTabs는 Stack과 달리 라우트를 자동으로 탭에 올려주지 않는다.
 * Trigger로 명시한 것만 탭바에 뜬다. name은 (tabs) 폴더 기준 파일명이다.
 *
 * 아이콘은 png 대신 sf(iOS SF Symbols) + md(Android Material Symbols)를 쓴다.
 * 시스템 폰트에서 가져오므로 에셋 파일이 필요 없고 해상도별 @2x/@3x도 신경 안 써도 된다.
 */
export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor={Palette.background.base}
      indicatorColor={Palette.gray[100]}
      labelStyle={{ selected: { color: Palette.gray[700] } }}
    >
      {/* 지도가 첫 탭이자 기본 화면 = (tabs)/index.tsx */}
      <NativeTabs.Trigger name="index">
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
