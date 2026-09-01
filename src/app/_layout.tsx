import { QueryClientProvider } from "@tanstack/react-query";
import { DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { queryClient } from "@/api/query-client";

SplashScreen.preventAutoHideAsync();

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
              name="review/[placeId]/result"
              options={{
                headerShown: false,
                presentation: "transparentModal",
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="review/[placeId]/receipt"
              options={{
                title: "1 / 3",
                headerTitleAlign: "center",
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="review/[placeId]/photo"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="review/[placeId]/form"
              options={{
                title: "3 / 3",
                headerTitleAlign: "center",
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="review/[placeId]/done"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="store/[placeId]/index"
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="store/[placeId]/reviews"
              options={{ title: "리뷰" }}
            />

            <Stack.Screen
              name="recommend/keywords"
              options={{ title: "코스 추천받기" }}
            />
            <Stack.Screen
              name="recommend/result"
              options={{ headerShown: false }}
            />

            <Stack.Screen
              name="my/reviews"
              options={{ title: "내가 쓴 리뷰" }}
            />
            <Stack.Screen
              name="my/stamp/[stampId]"
              options={{
                headerShown: false,
                presentation: "transparentModal",
                animation: "fade",
              }}
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
