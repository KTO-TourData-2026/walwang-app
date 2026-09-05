import { useEffect, useMemo, useRef, useState } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import { Footprints } from "lucide-react-native";
import {
  Modal,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { getStoreDetail } from "@/api/store";
import CourseMap from "@/components/recommend/course-map";
import { NearbyPlaceCard } from "@/components/recommend/nearby-place-card";
import { WaypointListItem } from "@/components/recommend/waypoint-list-item";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingView } from "@/components/ui/loading-view";
import { DURATION_LABEL, PURPOSE_LABEL } from "@/constants/course";
import { SIZE_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useCourseDetailQuery } from "@/hooks/use-course-detail-query";
import { useRecommendCourseQuery } from "@/hooks/use-recommend-course-query";
import { useSaveCourseMutation } from "@/hooks/use-save-course-mutation";
import { useSavedCoursesQuery } from "@/hooks/use-saved-courses-query";
import { useDemoMode } from "@/stores/demo-mode";
import type {
  Course,
  CourseDuration,
  CoursePurpose,
  CourseRecommendRequest,
  NearbyPlace,
} from "@/types/course";
import type { SizeKey } from "@/types/place";
import { formatDistance, formatWalkTime } from "@/utils/format";

export default function RecommendResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    size?: string;
    purposes?: string;
    duration?: string;
    tags?: string;
    startLat?: string;
    startLng?: string;
    startLabel?: string;
    /** 저장 코스(S-15)에서 열 때 id 재사용 — 재계산 없이 같은 코스를 재조회한다. */
    courseId?: string;
  }>();

  const [saved, setSaved] = useState(false);
  const [savedModalOpen, setSavedModalOpen] = useState(false);
  // 추천 결과를 최초 1회 고정한다(아래 freeze 효과). 모드 토글 시 재추천 대신 이 코스를 유지.
  const [frozenCourse, setFrozenCourse] = useState<Course | null>(null);
  const frozenRef = useRef<Course | null>(null);
  const isDemo = useDemoMode((state) => state.isDemo);

  const fromSaved = Boolean(params.courseId);

  const recommendRequest = useMemo<CourseRecommendRequest | null>(() => {
    if (
      params.courseId ||
      !params.size ||
      !params.startLat ||
      !params.startLng
    ) {
      return null;
    }
    return {
      size: params.size as SizeKey,
      purposes: params.purposes
        ? (params.purposes.split(",").filter(Boolean) as CoursePurpose[])
        : [],
      duration: (params.duration as CourseDuration | undefined) ?? "halfDay",
      start: {
        latitude: Number(params.startLat),
        longitude: Number(params.startLng),
      },
      ...(params.tags ? { tags: params.tags.split(",").filter(Boolean) } : {}),
    };
  }, [
    params.courseId,
    params.size,
    params.purposes,
    params.duration,
    params.tags,
    params.startLat,
    params.startLng,
  ]);

  // 고정 후에는 추천 쿼리를 비활성화(null)해, resetQueries가 새 코스를 재생성하지 않게 한다.
  const recommendQuery = useRecommendCourseQuery(
    frozenCourse ? null : recommendRequest,
  );
  const detailQuery = useCourseDetailQuery(params.courseId, {
    enabled: fromSaved,
  });
  // 이름 변경은 저장 목록 title만 바꾸므로, 상세 타이틀 동기화를 위해 목록 캐시를 함께 읽는다.
  const savedCoursesQuery = useSavedCoursesQuery({ enabled: fromSaved });
  const saveMutation = useSaveCourseMutation();

  // 추천 결과 최초 1회 고정(렌더 중 파생 상태 확정 — effect가 아니라 조건부 setState).
  // 고정되면 위 recommendQuery가 비활성화돼 모드 토글 시 재추천이 일어나지 않는다.
  if (!fromSaved && !frozenCourse && recommendQuery.data) {
    setFrozenCourse(recommendQuery.data);
  }

  useEffect(() => {
    frozenRef.current = frozenCourse;
  }, [frozenCourse]);

  // 모드 전환 시 고정된 코스의 지점 상호명만 현재 모드 기준으로 다시 조회(§5 마스킹).
  // 코스 구조(순서·경로)는 그대로 두고 라벨만 갱신. 주변 장소(nearby)는 대상에서 제외.
  useEffect(() => {
    const current = frozenRef.current;
    if (fromSaved || !current) {
      return;
    }
    let cancelled = false;
    Promise.all(
      current.waypoints.map((waypoint) =>
        getStoreDetail(waypoint.placeId)
          .then((detail) => detail.name)
          .catch(() => null),
      ),
    ).then((names) => {
      if (cancelled) {
        return;
      }
      setFrozenCourse((prev) =>
        prev
          ? {
              ...prev,
              waypoints: prev.waypoints.map((waypoint, index) =>
                names[index]
                  ? { ...waypoint, name: names[index] as string }
                  : waypoint,
              ),
            }
          : prev,
      );
    });
    return () => {
      cancelled = true;
    };
  }, [isDemo, fromSaved]);

  const activeQuery = fromSaved ? detailQuery : recommendQuery;
  const course = fromSaved
    ? detailQuery.data
    : (frozenCourse ?? recommendQuery.data);
  const isLoading = fromSaved
    ? detailQuery.isLoading
    : !frozenCourse && recommendQuery.isLoading;
  const isError = fromSaved
    ? detailQuery.isError
    : !frozenCourse && recommendQuery.isError;

  const save = () => {
    if (!course) {
      return;
    }
    // 서버 추천 응답의 title이 비어 오는 경우가 있어(POST /courses는 @NotBlank),
    // 화면 제목과 동일한 폴백(크기·목적·시간)으로 채워 저장한다.
    const saveTitle = course.title?.trim() || buildTitle(params, course);
    saveMutation.mutate(
      { ...course, title: saveTitle },
      {
        onSuccess: () => {
          setSaved(true);
          setSavedModalOpen(true);
        },
        onError: () => {
          ToastAndroid.show("코스를 저장하지 못했어요", ToastAndroid.SHORT);
        },
      },
    );
  };

  const goSavedTab = () => {
    setSavedModalOpen(false);
    router.dismissAll();
    router.navigate("/saved");
  };

  const goStore = (placeId: string) =>
    router.push({ pathname: "/store/[placeId]", params: { placeId } });

  // 인근 장소: storeId가 생기면 실제 가게 상세로, 아직 없으면 가진 정보만으로 프리뷰를 연다.
  const goNearby = (place: NearbyPlace) => {
    if (place.storeId) {
      goStore(place.storeId);
      return;
    }
    router.push({
      pathname: "/store/[placeId]",
      params: {
        placeId: "nearby",
        nearby: "1",
        title: place.title,
        category: place.category,
        ...(place.address ? { address: place.address } : {}),
        ...(place.imageUrl ? { imageUrl: place.imageUrl } : {}),
      },
    });
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <LoadingView />
      </View>
    );
  }

  if (isError || !course) {
    return (
      <View style={styles.centered}>
        <ErrorState
          message="코스를 불러오지 못했어요"
          onRetry={() => activeQuery.refetch()}
        />
      </View>
    );
  }

  // 지점이 비어 오면 지도(카메라 계산)가 터지므로 방어적으로 안내만 노출한다.
  if (course.waypoints.length === 0) {
    return (
      <View style={styles.centered}>
        <ErrorState
          message="코스 지점 정보를 불러오지 못했어요"
          onRetry={() => activeQuery.refetch()}
        />
      </View>
    );
  }

  const savedTitle = fromSaved
    ? savedCoursesQuery.data?.find((item) => item.id === params.courseId)?.title
    : undefined;
  const title = savedTitle || course.title || buildTitle(params, course);

  return (
    <View style={styles.root}>
      <View style={styles.mapWrap}>
        <CourseMap
          waypoints={course.waypoints}
          walkPath={course.walkPath}
          nearby={course.nearby}
          onSelectWaypoint={goStore}
          onSelectNearby={goNearby}
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
            <View style={styles.walkMeta}>
              <Footprints size={14} color={Palette.gray[500]} strokeWidth={2} />
              <ThemedText type="label04" color={Palette.gray[500]}>
                도보 약 {formatWalkTime(course.totalTime)}
              </ThemedText>
            </View>
          </View>
        </View>

        {course.relaxed || course.walkPath === null ? (
          <View style={styles.noticeBox}>
            {course.relaxed ? (
              <ThemedText type="subtitle05" color={Palette.main[500]}>
                조건에 딱 맞는 곳이 적어 조건을 조금 넓혔어요
              </ThemedText>
            ) : null}
            {course.walkPath === null ? (
              <ThemedText type="label06" color={Palette.gray[400]}>
                경로를 불러오지 못해 지점을 직선으로 이었어요
              </ThemedText>
            ) : null}
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
              key={`${waypoint.placeId}-${index}`}
              waypoint={waypoint}
              index={index}
              isLast={index === course.waypoints.length - 1}
              onPress={goStore}
            />
          ))}

          {course.nearby.length > 0 ? (
            <View style={styles.nearbySection}>
              <ThemedText
                type="subtitle03"
                color={Palette.gray[700]}
                style={styles.nearbyTitle}
              >
                주변 가볼 만한 곳
              </ThemedText>
              {course.nearby.map((place, index) => (
                <NearbyPlaceCard
                  key={`nearby-${index}`}
                  place={place}
                  onPress={goNearby}
                />
              ))}
            </View>
          ) : null}
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
          {fromSaved ? null : (
            <Button
              label={
                saveMutation.isPending
                  ? "저장 중…"
                  : saved
                    ? "저장됨"
                    : "코스 저장"
              }
              variant="main"
              disabled={saved || saveMutation.isPending}
              onPress={save}
              style={styles.footerButton}
            />
          )}
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
  course: Course,
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
  centered: {
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
  walkMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.one,
  },
  noticeBox: {
    marginHorizontal: Spacing.four,
    marginBottom: Spacing.two,
    padding: Spacing.three,
    gap: Spacing.one,
    borderRadius: Radius.medium,
    backgroundColor: "rgba(255, 154, 134, 0.12)",
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
  nearbySection: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
  },
  nearbyTitle: {
    marginBottom: Spacing.one,
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
