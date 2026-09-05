import { useState } from "react";

import { Image } from "expo-image";
import { Dog } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius } from "@/constants/theme";
import type { PassportSummary } from "@/types/user";
import { formatReviewDate } from "@/utils/date";
import { hasCustomStamp } from "@/utils/stamp";

export function PassportStampView({
  stamp,
  size,
  angle,
  onPress,
}: {
  stamp: PassportSummary;
  size: number;
  angle: number;
  onPress: (stamp: PassportSummary) => void;
}) {
  // READY이고 커스텀 도장 이미지가 있으면 이미지, 그 외(PENDING·FALLBACK·기본 발도장 애셋)는
  // 기본 아이콘(강아지 얼굴)으로 통일한다.
  // 이미지 로드 실패(예: 데모의 도달 불가 목 URL) 시 기본 아이콘으로 폴백한다.
  const [imageFailed, setImageFailed] = useState(false);
  const showStamp =
    stamp.status === "ready" && hasCustomStamp(stamp.stampUrl) && !imageFailed;
  const dateLabel = stamp.createdAt ? formatReviewDate(stamp.createdAt) : "";
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => onPress(stamp)}
        accessibilityRole="button"
        accessibilityLabel="도장"
        style={({ pressed }) => [
          styles.stamp,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [
              { rotate: `${angle}deg` },
              { scale: pressed ? 0.94 : 1 },
            ],
          },
        ]}
      >
        {showStamp ? (
          <Image
            source={{ uri: stamp.stampUrl as string }}
            style={styles.image}
            contentFit="cover"
            transition={120}
            accessibilityLabel="도장"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <Dog size={size * 0.46} color={Palette.main[400]} strokeWidth={1.8} />
        )}
      </Pressable>

      {dateLabel ? (
        // 도장과 같은 기울기로 원 바로 아래에 생성일자(YYYY.MM.DD)를 표기한다.
        <ThemedText
          type="label06"
          color={Palette.gray[500]}
          style={[
            styles.date,
            { width: size, transform: [{ rotate: `${angle}deg` }] },
          ]}
        >
          {dateLabel}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
  },
  stamp: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: Radius.pill,
  },
  date: {
    marginTop: 0,
    textAlign: "center",
  },
});
