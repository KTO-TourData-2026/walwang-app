import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Spacing } from "@/constants/theme";
import type { Coordinate, CourseWaypoint } from "@/types/course";

export type CourseMapProps = {
  waypoints: CourseWaypoint[];
  walkPath: Coordinate[] | null;
  onSelectWaypoint: (placeId: string) => void;
};

// 지도는 네이티브 전용 모듈이라 웹에서는 자리표시자만 보여준다.
export default function CourseMap(_props: CourseMapProps) {
  return (
    <View style={styles.placeholder}>
      <ThemedText type="label03" color={Palette.gray[400]}>
        지도는 네이티브 전용이라 웹에서는 안 보여요
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    backgroundColor: Palette.gray[100],
  },
});
