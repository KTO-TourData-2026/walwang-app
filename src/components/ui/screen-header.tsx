import { Stack } from "expo-router";
import { StyleSheet, View } from "react-native";

import { Palette } from "@/constants/theme";

/**
 * 화면 공용 헤더. 네이티브 스택 헤더를 가운데 정렬 + 그림자 제거로 통일하고,
 * 헤더 바로 아래에 얇은 구분선을 그린다. (리뷰 전체보기 헤더 스타일이 표준)
 *
 * 화면 body의 맨 위에 렌더한다. title을 주면 헤더 타이틀을 덮어쓴다(가게명 등
 * 동적 타이틀용). 정적 타이틀은 app/_layout.tsx에서 관리한다.
 */
export function ScreenHeader({ title }: { title?: string }) {
  return (
    <>
      <Stack.Screen
        options={{
          ...(title ? { title } : {}),
          headerTitleAlign: "center",
          headerShadowVisible: false,
        }}
      />
      <View style={styles.divider} />
    </>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Palette.border.disabled,
  },
});
