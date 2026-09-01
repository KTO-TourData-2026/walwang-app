import { Image } from "expo-image";
import { PawPrint } from "lucide-react-native";
import { Pressable, StyleSheet } from "react-native";

import { Palette, Radius } from "@/constants/theme";
import type { PassportStamp } from "@/types/user";

export function PassportStampView({
  stamp,
  size,
  angle,
  onPress,
}: {
  stamp: PassportStamp;
  size: number;
  angle: number;
  onPress: (stamp: PassportStamp) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(stamp)}
      accessibilityRole="button"
      accessibilityLabel={`${stamp.storeName} 도장`}
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
      {stamp.stampUrl ? (
        <Image
          source={{ uri: stamp.stampUrl }}
          style={styles.image}
          contentFit="cover"
          transition={120}
          accessibilityLabel={`${stamp.storeName} 도장`}
        />
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
