import { useState } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CourseMap from "@/components/recommend/course-map";
import { WaypointListItem } from "@/components/recommend/waypoint-list-item";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { DURATION_LABEL, PURPOSE_LABEL } from "@/constants/course";
import { SIZE_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { MOCK_COURSE, MOCK_COURSE_FALLBACK } from "@/mocks/courses";
import type { CourseDuration, CoursePurpose } from "@/types/course";
import type { SizeKey } from "@/types/place";
import { formatDistance, formatWalkTime } from "@/utils/format";

export default function RecommendResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    size?: string;
    purposes?: string;
    duration?: string;
    variant?: string;
  }>();

  const [saved, setSaved] = useState(false);
  const [savedModalOpen, setSavedModalOpen] = useState(false);

  const save = () => {
    setSaved(true);
    setSavedModalOpen(true);
  };

  const goSavedTab = () => {
    setSavedModalOpen(false);
    router.dismissAll();
    router.navigate("/saved");
  };

  // 경로 API 실패·조건 완화 상태 확인용 폴백 코스(?variant=fallback).
  const course =
    params.variant === "fallback" ? MOCK_COURSE_FALLBACK : MOCK_COURSE;

  const title = buildTitle(params, course);

  const goStore = (placeId: string) =>
    router.push({ pathname: "/store/[placeId]", params: { placeId } });

  return (
    <View style={styles.root}>
      <View style={styles.mapWrap}>
        <CourseMap
          waypoints={course.waypoints}
          walkPath={course.walkPath}
          onSelectWaypoint={goStore}
        />
      </View>

      <View style={styles.sheet}>
        <View style={styles.grabber} />

        <View style={styles.header}>
          <ThemedText type="subtitle01" color={Palette.gray[700]}>
            {title}
          </ThemedText>
          <View style={styles.metaRow}>
            <ThemedText type="label04" color={Palette.gray[500]}>
              {course.waypoints.length}지점 · 총{" "}
              {formatDistance(course.totalDistance)}
            </ThemedText>
            <ThemedText type="label04" color={Palette.gray[500]}>
              도보 약 {formatWalkTime(course.totalTime)}
            </ThemedText>
          </View>
        </View>

        {course.relaxed ? (
          <View style={styles.banner}>
            <ThemedText type="label05" color={Palette.main[500]}>
              조건에 딱 맞는 곳이 적어 조건을 조금 넓혔어요
            </ThemedText>
          </View>
        ) : null}

        {course.walkPath === null ? (
          <View style={styles.noteRow}>
            <ThemedText type="label06" color={Palette.gray[400]}>
              경로를 불러오지 못해 지점을 직선으로 이었어요
            </ThemedText>
          </View>
        ) : null}

        <View style={styles.listDivider} />

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {course.waypoints.map((waypoint, index) => (
            <WaypointListItem
              key={waypoint.placeId}
              waypoint={waypoint}
              index={index}
              isLast={index === course.waypoints.length - 1}
              onPress={goStore}
            />
          ))}
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + Spacing.two },
          ]}
        >
          <Button
            label="닫기"
            variant="secondary"
            onPress={() => router.dismissAll()}
            style={styles.footerButton}
          />
          <Button
            label={saved ? "저장됨" : "코스 저장"}
            variant="main"
            disabled={saved}
            onPress={save}
            style={styles.footerButton}
          />
        </View>
      </View>

      <Modal
        visible={savedModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSavedModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ThemedText type="subtitle01" color={Palette.gray[700]}>
              저장 완료
            </ThemedText>
            <ThemedText
              type="label03"
              color={Palette.gray[500]}
              style={styles.modalMessage}
            >
              코스 저장이 완료되었습니다!{"\n"}저장 탭에서 확인해 보세요
            </ThemedText>

            <View style={styles.modalActions}>
              <Button
                label="닫기"
                variant="secondary"
                onPress={() => setSavedModalOpen(false)}
                style={styles.modalButton}
              />
              <Button
                label="저장 탭 바로가기"
                variant="primary"
                onPress={goSavedTab}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function buildTitle(
  params: { size?: string; purposes?: string; duration?: string },
  course: typeof MOCK_COURSE,
): string {
  const size = (params.size as SizeKey) ?? course.size;
  const purposes = params.purposes
    ? (params.purposes.split(",").filter(Boolean) as CoursePurpose[])
    : course.purposes;
  const duration =
    (params.duration as CourseDuration | undefined) ?? course.duration;

  const purposeText = purposes.map((p) => PURPOSE_LABEL[p]).join(" ");
  return [SIZE_LABEL[size], purposeText, DURATION_LABEL[duration]]
    .filter(Boolean)
    .join(" · ");
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  mapWrap: {
    flex: 1,
  },
  sheet: {
    maxHeight: "72%",
    marginTop: -Radius.large,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    backgroundColor: Palette.background.base,
    overflow: "hidden",
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    marginTop: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: Palette.border.default,
  },
  header: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  banner: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: "rgba(255, 154, 134, 0.12)",
  },
  noteRow: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  listDivider: {
    height: 1,
    marginTop: Spacing.one,
    backgroundColor: Palette.border.disabled,
  },
  list: {
    flexShrink: 1,
  },
  listContent: {
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  footer: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    backgroundColor: Palette.background.base,
  },
  footerButton: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    gap: Spacing.three,
    paddingTop: Spacing.four,
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
    borderRadius: Radius.large,
    backgroundColor: Palette.background.base,
    alignItems: "center",
  },
  modalMessage: {
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.two,
    alignSelf: "stretch",
    marginTop: Spacing.two,
  },
  modalButton: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: Spacing.one,
  },
});
