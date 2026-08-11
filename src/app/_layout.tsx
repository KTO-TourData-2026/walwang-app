import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { AnimatedSplashOverlay } from '@/components/animated-icon';

SplashScreen.preventAutoHideAsync();

/**
 * QueryClient는 반드시 컴포넌트 "바깥"에서 만든다.
 *
 * [RN/React 함정] 컴포넌트 안에서 `new QueryClient()`를 하면 리렌더마다
 * 새 인스턴스가 생기고, 그 순간 캐시가 통째로 날아가서
 * "화면 깜빡일 때마다 API를 다시 부르는" 버그가 된다.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 모바일은 웹과 달리 앱을 껐다 켜는 텀이 길다. 기본 0초는 너무 공격적이라 1분으로.
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    /**
     * [RN 함정 — 매우 중요] GestureHandlerRootView는 앱 최상단에 있어야 하고,
     * 반드시 flex: 1 을 줘야 한다.
     * - 여기 없으면 @gorhom/bottom-sheet 시트가 "에러 없이 그냥 안 열린다".
     *   제스처 이벤트를 받아줄 루트가 없어서 조용히 무시되기 때문에 디버깅이 최악이다.
     * - style 없이 쓰면 높이 0이라 하위 화면이 전부 안 보인다.
     *   웹의 div처럼 자식 크기만큼 늘어나지 않는다.
     */
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <AnimatedSplashOverlay />

          {/*
            루트를 Stack으로 두고 탭을 (tabs) 그룹으로 내렸다.
            이래야 리뷰 작성/로그인 화면이 "탭바 위로 push"되어 뒤로가기가 정상 동작한다.
            루트가 곧 탭 네비게이터면 그 화면들이 전부 숨은 탭이 되어버린다.
          */}
          <Stack>
            {/* 탭 화면은 자체 탭바를 그리므로 스택 헤더를 끈다. */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen name="(auth)/login" options={{ title: '로그인' }} />
            <Stack.Screen name="(auth)/signup" options={{ title: '회원가입' }} />

            <Stack.Screen name="review/[placeId]/receipt" options={{ title: '영수증 인증' }} />
            <Stack.Screen name="review/[placeId]/photo" options={{ title: '사진 첨부' }} />
            <Stack.Screen name="review/[placeId]/form" options={{ title: '리뷰 작성' }} />
            <Stack.Screen
              name="review/[placeId]/done"
              options={{ title: '작성 완료', headerBackVisible: false }}
            />

            <Stack.Screen name="recommend/keywords" options={{ title: '키워드 선택' }} />
            <Stack.Screen name="recommend/result" options={{ title: '추천 코스' }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
