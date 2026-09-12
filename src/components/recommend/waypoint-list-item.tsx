import { Footprints } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CATEGORY_LABEL } from "@/constants/category";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { CourseWaypoint } from "@/types/course";
import { formatDistance, formatWalkTime } from "@/utils/format";

export function WaypointListItem({
  waypoint,
  index,
  isLast,
  onPress,
}: {
  waypoint: CourseWaypoint;
  index: number;
  isLast: boolean;
  onPress: (placeId: string) => void;
}) {
  const leg = waypoint.legToNext;

  return (
    <Pressable
      onPress={() => onPress(waypoint.placeId)}
      accessibilityRole="button"
      accessibilityLabel={`${index + 1}번 지점 ${waypoint.name}`}
      style={styles.row}
    >
      <View style={styles.timeline}>
        <View style={styles.badge}>
          <ThemedText type="subtitle05" color={Palette.white}>
            {index + 1}
          </ThemedText>
        </View>
        {!isLast ? <View style={styles.connector} /> : null}
      </View>

      <View style={[styles.content, isLast && styles.contentLast]}>
        <ThemedText type="subtitle03" color={Palette.gray[700]}>
          {waypoint.name}
        </ThemedText>
        <ThemedText type="label05" color={Palette.gray[400]}>
          {CATEGORY_LABEL[waypoint.category]}
        </ThemedText>

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
