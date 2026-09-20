import { Footprints } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CATEGORY_LABEL } from "@/constants/category";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { CourseWaypoint } from "@/types/course";
import { formatDistance, formatWalkTime } from "@/utils/format";

export function WaypointListItem({
  waypoint,
  stepNumber,
  isLast,
  onPress,
}: {
  waypoint: CourseWaypoint;
  /** 실제 가게 순번(1부터). 출발 위치면 null(번호 없음). */
  stepNumber: number | null;
  isLast: boolean;
  onPress: (placeId: string) => void;
}) {
  const leg = waypoint.legToNext;
  const { isStart } = waypoint;

  return (
    <Pressable
      onPress={isStart ? undefined : () => onPress(waypoint.placeId)}
      disabled={isStart}
      accessibilityRole={isStart ? "text" : "button"}
      accessibilityLabel={
        isStart ? "출발 위치" : `${stepNumber}번 지점 ${waypoint.name}`
      }
      style={styles.row}
    >
      <View style={styles.timeline}>
        <View style={styles.badge}>
          {isStart ? (
            <View style={styles.startDot} />
          ) : (
            <ThemedText type="subtitle05" color={Palette.white}>
              {stepNumber}
            </ThemedText>
          )}
        </View>
        {!isLast ? <View style={styles.connector} /> : null}
      </View>

      <View style={[styles.content, isLast && styles.contentLast]}>
        <ThemedText type="subtitle03" color={Palette.gray[700]}>
          {isStart ? "출발 위치" : waypoint.name}
        </ThemedText>
        {isStart ? null : (
          <ThemedText type="label05" color={Palette.gray[400]}>
            {CATEGORY_LABEL[waypoint.category]}
          </ThemedText>
        )}

        {leg ? (
          <View style={styles.leg}>
            <Footprints size={13} color={Palette.gray[400]} strokeWidth={2} />
            <ThemedText type="label06" color={Palette.gray[500]}>
              도보 {formatWalkTime(leg.duration)} ·{" "}
              {formatDistance(leg.distance)}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

const BADGE_SIZE = 24;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  timeline: {
    alignItems: "center",
    width: BADGE_SIZE,
  },
  badge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Palette.main[500],
  },
  startDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.white,
  },
  connector: {
    flex: 1,
    width: 2,
    marginTop: Spacing.one,
    marginBottom: Spacing.one,
    backgroundColor: Palette.border.default,
  },
  content: {
    flex: 1,
    gap: Spacing.half,
    paddingBottom: Spacing.four,
  },
  contentLast: {
    paddingBottom: Spacing.two,
  },
  leg: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
    marginTop: Spacing.one,
  },
});
