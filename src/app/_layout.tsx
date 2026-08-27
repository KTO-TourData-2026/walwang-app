import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />

            <Stack.Screen name="(main)" options={{ headerShown: false }} />

            <Stack.Screen
              name="(auth)/login"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="(auth)/signup"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="review/[placeId]/receipt"
              options={{ title: "영수증 인증" }}
            />
            <Stack.Screen
              name="review/[placeId]/photo"
              options={{ title: "사진 첨부" }}
            />
            <Stack.Screen
              name="review/[placeId]/form"
              options={{ title: "리뷰 작성" }}
            />
            <Stack.Screen
              name="review/[placeId]/done"
              options={{ title: "작성 완료", headerBackVisible: false }}
            />

            <Stack.Screen
              name="recommend/keywords"
              options={{ title: "키워드 선택" }}
            />
            <Stack.Screen
              name="recommend/result"
              options={{ title: "추천 코스" }}
            />
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
