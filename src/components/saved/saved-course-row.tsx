import { useRef, useState } from "react";

import { Check, MoreVertical, Pencil } from "lucide-react-native";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import type { MenuAnchor } from "@/components/saved/saved-place-row";
import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing, Typography } from "@/constants/theme";
import type { SavedCoursePreview } from "@/types/course";
import { formatDistance, formatWalkTime } from "@/utils/format";

export function SavedCourseRow({
  course,
  onPress,
  onRename,
  onMenu,
}: {
  course: SavedCoursePreview;
  onPress: (course: SavedCoursePreview) => void;
  onRename: (course: SavedCoursePreview, title: string) => void;
  onMenu: (course: SavedCoursePreview, anchor: MenuAnchor) => void;
}) {
  const menuRef = useRef<View>(null);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(course.title);

  const openMenu = () => {
    menuRef.current?.measureInWindow((x, y, width, height) =>
      onMenu(course, { x, y, width, height }),
    );
  };

  const startEdit = () => {
    setDraft(course.title);
    setEditing(true);
  };

  const commit = () => {
    const title = draft.trim();
    if (title.length > 0 && title !== course.title) {
      onRename(course, title);
    }
    setEditing(false);
  };

  return (
    <Pressable
      onPress={() => onPress(course)}
      onLongPress={openMenu}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <View style={styles.titleRow}>
          {editing ? (
            <>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                autoFocus
                maxLength={30}
                returnKeyType="done"
                selectTextOnFocus
                onSubmitEditing={commit}
                onBlur={commit}
                style={styles.input}
                accessibilityLabel="코스 이름 입력"
              />
              <Pressable
                onPress={commit}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="이름 저장"
                style={styles.editButton}
              >
                <Check size={16} color={Palette.main[500]} />
              </Pressable>
            </>
          ) : (
            <>
              <ThemedText
                type="subtitle03"
                color={Palette.gray[700]}
                numberOfLines={1}
                style={styles.title}
              >
                {course.title}
              </ThemedText>
              <Pressable
                onPress={startEdit}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${course.title} 이름 수정`}
                style={styles.editButton}
              >
                <Pencil size={15} color={Palette.gray[400]} />
              </Pressable>
            </>
          )}
        </View>

        <ThemedText type="label05" color={Palette.gray[400]} numberOfLines={1}>
          {course.storeNames.join(" · ")}
        </ThemedText>

        <View style={styles.metaLine}>
          <ThemedText type="label05" color={Palette.gray[500]}>
            {course.storeCount}지점{"   ·   "}총{" "}
            {formatDistance(course.totalDistance)}
            {"   ·   "}도보 약 {formatWalkTime(course.totalTime)}
          </ThemedText>
        </View>
      </View>

      <Pressable
        ref={menuRef}
        onPress={openMenu}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${course.title} 더보기`}
        style={styles.menuButton}
      >
        <MoreVertical size={20} color={Palette.gray[300]} strokeWidth={1.75} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    backgroundColor: Palette.background.base,
  },
  pressed: {
    backgroundColor: Palette.background.subtle,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    // 표시/편집 모드에서 카드 높이가 변하지 않도록 제목 줄 높이를 고정한다.
    height: 24,
  },
  title: {
    flexShrink: 1,
  },
  input: {
    flex: 1,
    height: 24,
    paddingVertical: 0,
    paddingHorizontal: 0,
    textAlignVertical: "center",
    color: Palette.gray[700],
    borderBottomWidth: 1,
    borderBottomColor: Palette.main[400],
    ...Typography.subtitle03,
    includeFontPadding: false,
    outlineWidth: 0,
    outlineStyle: "none" as "solid",
  },
  editButton: {
    padding: Spacing.half,
  },
  metaLine: {
    marginTop: Spacing.half,
  },
  menuButton: {
    marginTop: -Spacing.one,
    marginRight: -Spacing.two,
    padding: Spacing.one,
  },
});
