import { useState } from "react";

import { HelpCircle } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { SIZE_LABEL, STATUS_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { PlaceStatus, SizeKey } from "@/types/place";

export function SizeStatusSection({
  sizeStatus,
  counts,
}: {
  sizeStatus: Record<SizeKey, PlaceStatus>;
  /** 크기별 "동반 확인(가능)" 리뷰 수. 상세 응답 sizeCounts.possible에서 온다. */
  counts: Record<SizeKey, number>;
}) {
  const [open, setOpen] = useState(false);

  const statusColor = (status: PlaceStatus) => Palette.status[status][300];

  return (
    <View style={styles.section}>
      <View style={styles.row}>
        <ThemedText
          type="label03"
          color={Palette.gray[700]}
          style={styles.line}
        >
          {SIZE_LABEL.smallMedium}{" "}
          <ThemedText
            type="label03"
            color={statusColor(sizeStatus.smallMedium)}
          >
            {STATUS_LABEL[sizeStatus.smallMedium]}
          </ThemedText>
          <ThemedText type="label03" color={Palette.gray[300]}>
            {"   ·   "}
          </ThemedText>
          {SIZE_LABEL.large}{" "}
          <ThemedText type="label03" color={statusColor(sizeStatus.large)}>
            {STATUS_LABEL[sizeStatus.large]}
          </ThemedText>
        </ThemedText>

        <Pressable
          onPress={() => setOpen((prev) => !prev)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="크기별 상태 근거 보기"
        >
          <HelpCircle size={16} color={Palette.gray[400]} />
        </Pressable>
      </View>

      {open ? (
        <View style={styles.popover}>
          <ThemedText type="label03" color={Palette.gray[700]}>
            소·중형견 확인 리뷰{" "}
            <ThemedText type="subtitle04" color={Palette.main[500]}>
              {counts.smallMedium}
            </ThemedText>
            건
            <ThemedText type="label03" color={Palette.gray[300]}>
              {"   ·   "}
            </ThemedText>
            대형견 확인 리뷰{" "}
            <ThemedText type="subtitle04" color={Palette.main[500]}>
              {counts.large}
            </ThemedText>
            건
          </ThemedText>

          <ThemedText type="label06" color={Palette.gray[500]}>
            일정 리뷰 수를 충족시키면 상태가 확정돼요
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  line: {
    flexShrink: 1,
  },
  popover: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: "rgba(255, 154, 134, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 154, 134, 0.40)",
  },
});
