import { useState } from "react";

import { useRouter } from "expo-router";
import { MapPin, Route, Trash2 } from "lucide-react-native";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SavedCourseRow } from "@/components/saved/saved-course-row";
import {
  SavedPlaceRow,
  type MenuAnchor,
} from "@/components/saved/saved-place-row";
import { EmptyState } from "@/components/ui/empty-state";
import { PopoverMenu } from "@/components/ui/popover-menu";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Palette, Spacing } from "@/constants/theme";
import { MOCK_SAVED_COURSES, MOCK_SAVED_PLACES } from "@/mocks/saved";
import type { SavedCoursePreview } from "@/types/course";
import type { Place } from "@/types/place";

type Segment = "place" | "course";

type ActiveMenu = { type: Segment; id: string; anchor: MenuAnchor };

const SEGMENTS = [
  { value: "place" as const, label: "장소", Icon: MapPin },
  { value: "course" as const, label: "코스", Icon: Route },
];

export default function SavedScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [segment, setSegment] = useState<Segment>("place");
  const [places, setPlaces] = useState<Place[]>(MOCK_SAVED_PLACES);
  const [courses, setCourses] =
    useState<SavedCoursePreview[]>(MOCK_SAVED_COURSES);
  const [menu, setMenu] = useState<ActiveMenu | null>(null);

  const openPlace = (place: Place) =>
    router.push({
      pathname: "/store/[placeId]",
      params: { placeId: place.id },
    });

  const openCourse = (course: SavedCoursePreview) =>
    router.push({
      pathname: "/recommend/result",
      params: { courseId: course.id },
    });

  const deleteActive = () => {
    if (!menu) {
      return;
    }
    if (menu.type === "place") {
      setPlaces((prev) => prev.filter((item) => item.id !== menu.id));
    } else {
      setCourses((prev) => prev.filter((item) => item.id !== menu.id));
    }
    setMenu(null);
  };

  const renameCourse = (course: SavedCoursePreview, title: string) =>
    setCourses((prev) =>
      prev.map((item) => (item.id === course.id ? { ...item, title } : item)),
    );

  return (
    <View style={[styles.root, { paddingTop: insets.top + Spacing.three }]}>
      <View style={styles.header}>
        <SegmentedControl
          options={SEGMENTS}
          value={segment}
          onChange={setSegment}
        />
      </View>

      {segment === "place" ? (
        places.length > 0 ? (
          <FlatList
            data={places}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={Separator}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SavedPlaceRow
                place={item}
                onPress={openPlace}
                onMenu={(place, anchor) =>
                  setMenu({ type: "place", id: place.id, anchor })
                }
              />
            )}
          />
        ) : (
          <EmptyState
            Icon={MapPin}
            title="저장한 장소가 없어요"
            subtitle="지도에서 마음에 드는 곳을 저장해보세요"
          />
        )
      ) : courses.length > 0 ? (
        <FlatList
          data={courses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={Separator}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <SavedCourseRow
              course={item}
              onPress={openCourse}
              onRename={renameCourse}
              onMenu={(course, anchor) =>
                setMenu({ type: "course", id: course.id, anchor })
              }
            />
          )}
        />
      ) : (
        <EmptyState
          Icon={Route}
          title="저장한 코스가 없어요"
          subtitle="추천받기로 코스를 만들어 저장해보세요"
        />
      )}

      <PopoverMenu
        anchor={menu?.anchor ?? null}
        onClose={() => setMenu(null)}
        items={[
          {
            label: "삭제",
            Icon: Trash2,
            onPress: deleteActive,
            destructive: true,
          },
        ]}
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  header: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  listContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: Spacing.five,
  },
  separator: {
    height: Spacing.three,
  },
});
