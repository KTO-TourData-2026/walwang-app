import { useEffect } from "react";

import { Image } from "expo-image";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { Palette, Radius, Spacing } from "@/constants/theme";

const LOGO = require("@/assets/images/logo.png");

const DOT_COUNT = 3;
const BOUNCE = 8; // 점이 튀어오르는 높이(px)
const STEP = 160; // 점 사이 시작 간격(ms)

/** 위로 튀었다 내려오는 한 사이클을 딜레이만 다르게 반복하는 점 하나. */
function BouncingDot({ delay }: { delay: number }) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(-BOUNCE, { duration: 300 }),
          withTiming(0, { duration: 300 }),
        ),
        -1,
      ),
    );
  }, [delay, offset]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export type LoadingViewProps = {
  style?: StyleProp<ViewStyle>;
};

/** 공용 로딩 화면 — 원형 앱 로고 + 점 3개 바운스. */
export function LoadingView({ style }: LoadingViewProps) {
  return (
    <View
      style={[styles.container, style]}
      accessibilityRole="progressbar"
      accessibilityLabel="불러오는 중"
    >
      <Image source={LOGO} style={styles.logo} contentFit="cover" />
      <View style={styles.dots}>
        {Array.from({ length: DOT_COUNT }, (_, index) => (
          <BouncingDot key={index} delay={index * STEP} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: Spacing.four,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
  },
  dots: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radius.pill,
    backgroundColor: Palette.main[400],
  },
});
