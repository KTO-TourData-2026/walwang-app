import { useRef, useState } from "react";

import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { markOnboardingSeen } from "@/stores/onboarding";

const PAGES = [
  {
    keyword: "반려견 출입 가능 지도",
    title: "우리 아이랑 갈 수 있는 곳,\n지도에서 한눈에",
    image: require("@/assets/images/onboarding/map.png"),
  },
  {
    keyword: "리뷰에 기반한 믿을 수 있는 정보",
    title: "직접 다녀온 사람들의 후기로\n믿을 수 있는 정보",
    image: require("@/assets/images/onboarding/review.png"),
  },
  {
    keyword: "하나뿐인 우리 아이 도장",
    title: "리뷰를 남기고\n나만의 도장을 모아요",
    image: require("@/assets/images/onboarding/stamp.png"),
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();

  const scrollRef = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);

  const isLast = page === PAGES.length - 1;

  const onMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(event.nativeEvent.contentOffset.x / width);
    setPage(next);
  };

  const goToLogin = () => {
    void markOnboardingSeen();
    router.replace("/login");
  };

  const onPressPrimary = () => {
    if (isLast) {
      goToLogin();
      return;
    }
    scrollRef.current?.scrollTo({ x: (page + 1) * width, animated: true });
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable
          accessibilityRole="button"
          hitSlop={Spacing.three}
          onPress={goToLogin}
        >
          <ThemedText type="label04" color={Palette.gray[400]}>
            건너뛰기
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.indicator}>
        {PAGES.map((item, index) => (
          <View
            key={item.keyword}
            style={[styles.dot, index === page && styles.dotActive]}
          />
        ))}
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onMomentumEnd}
        style={styles.pager}
      >
        {PAGES.map((item) => (
          <View key={item.keyword} style={[styles.page, { width }]}>
            <ThemedText
              type="subtitle02"
              color={Palette.main[500]}
              style={styles.keyword}
            >
              {item.keyword}
            </ThemedText>
            <ThemedText type="head03" style={styles.title}>
              {item.title}
            </ThemedText>

            <Image
              source={item.image}
              style={styles.phone}
              contentFit="contain"
              accessibilityLabel={`${item.keyword} 화면 미리보기`}
            />
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          variant="main"
          label={isLast ? "시작하기" : "다음"}
          onPress={onPressPrimary}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  indicator: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Palette.gray[200],
  },
  dotActive: {
    width: 12,
    height: 12,
    backgroundColor: Palette.main[400],
  },
  pager: {
    flex: 1,
  },
  page: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
  },
  keyword: {
    textAlign: "center",
  },
  title: {
    marginTop: Spacing.two,
    textAlign: "center",
  },
  phone: {
    flex: 1,
    width: "100%",
    marginTop: Spacing.five,
    marginBottom: Spacing.four,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
