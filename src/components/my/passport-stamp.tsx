import { Image } from "expo-image";
import { Dog, PawPrint } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { Palette, Radius } from "@/constants/theme";
import type { PassportSummary } from "@/types/user";

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
  // status 3분기: READY=생성된 도장 이미지 / FALLBACK=실루엣 / PENDING=생성 중 발도장.
  const showStamp = stamp.status === "ready" && stamp.stampUrl;
  return (
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
          transform: [{ rotate: `${angle}deg` }, { scale: pressed ? 0.94 : 1 }],
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
        />
      ) : stamp.status === "fallback" ? (
        <Dog size={size * 0.46} color={Palette.main[400]} strokeWidth={1.8} />
      ) : (
        <PawPrint
          size={size * 0.44}
          color={Palette.main[500]}
          strokeWidth={2}
        />
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stamp: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: Palette.main[300],
    backgroundColor: "rgba(255, 154, 134, 0.14)",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: Radius.pill,
  },
});
