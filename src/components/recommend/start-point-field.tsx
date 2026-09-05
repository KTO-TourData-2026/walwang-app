import { useState } from "react";

import { MapPin, X } from "lucide-react-native";
import { FlatList, Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlaceListItem } from "@/components/map/place-list-item";
import { ThemedText } from "@/components/themed-text";
import { SearchBar } from "@/components/ui/search-bar";
import { Palette, Spacing } from "@/constants/theme";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useStoreSearchQuery } from "@/hooks/use-store-search-query";
import type { StartPoint } from "@/types/course";
import type { Place } from "@/types/place";

/**
 * 출발 지점 지정 필드(S-10).
 *
 * 위치정보(GPS) 미사용 — 사용자가 검색으로 직접 지정한 좌표만 쓴다.
 * 지정 전에는 [코스 만들기]가 비활성이므로, 여기서 값이 없으면 상위에서 버튼을 막는다.
 * 실제 가게 검색(`GET /stores/search`)으로 고른다.
 */
export function StartPointField({
  value,
  onChange,
  onClear,
}: {
  value: StartPoint | null;
  onChange: (next: StartPoint) => void;
  onClear: () => void;
}) {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const searchQuery = useStoreSearchQuery(query);
  const keyword = query.trim();
  const hasKeyword = keyword.length > 0;
  // 훅과 같은 지연으로 입력이 안정됐는지 본다. 디바운스 중이거나 이전 결과(placeholder)를
  // 보여주는 동안엔 목록을 비워, 현재 검색어와 안 맞는 장소가 선택되는 걸 막는다.
  const debounced = useDebouncedValue(keyword, 300);
  const isSettled = keyword === debounced && !searchQuery.isPlaceholderData;
  const results = isSettled ? (searchQuery.data ?? []) : [];

  const select = (place: Place) => {
    onChange({
      storeId: place.id,
      label: place.name,
      latitude: place.latitude,
      longitude: place.longitude,
    });
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={
          value ? `출발지 ${value.label}, 변경` : "출발지 지정"
        }
        style={({ pressed }) => [styles.field, pressed && styles.pressed]}
      >
        <MapPin
          size={18}
          color={value ? Palette.main[500] : Palette.gray[400]}
          strokeWidth={2}
        />
        <ThemedText
          type="label03"
          color={value ? Palette.gray[700] : Palette.gray[400]}
          style={styles.fieldLabel}
          numberOfLines={1}
        >
          {value ? value.label : "출발지를 검색해 지정하세요"}
        </ThemedText>
        {value ? (
          <Pressable
            onPress={onClear}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="출발지 삭제"
          >
            <ThemedText type="subtitle05" color={Palette.main[500]}>
              삭제
            </ThemedText>
          </Pressable>
        ) : null}
      </Pressable>

      <Modal
        visible={open}
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={[styles.sheet, { paddingTop: insets.top + Spacing.two }]}>
          <View style={styles.sheetHeader}>
            <ThemedText type="subtitle02" color={Palette.gray[700]}>
              출발지 선택
            </ThemedText>
            <Pressable
              onPress={() => setOpen(false)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <X size={22} color={Palette.gray[600]} />
            </Pressable>
          </View>

          <View style={styles.searchWrap}>
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="장소명으로 검색"
              autoCorrect={false}
              autoFocus
            />
          </View>

          <FlatList
            data={results}
            keyExtractor={(place) => place.id}
            renderItem={({ item }) => (
              <PlaceListItem place={item} onPress={select} />
            )}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.empty}>
                <ThemedText type="label03" color={Palette.gray[400]}>
                  {!hasKeyword
                    ? "장소명으로 출발지를 검색하세요"
                    : !isSettled || searchQuery.isFetching
                      ? "검색 중…"
                      : "검색 결과가 없어요"}
                </ThemedText>
              </View>
            }
            contentContainerStyle={{
              paddingBottom: insets.bottom + Spacing.four,
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    backgroundColor: Palette.white,
  },
  pressed: {
    backgroundColor: Palette.background.subtle,
  },
  fieldLabel: {
    flex: 1,
    minWidth: 0,
  },
  sheet: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  searchWrap: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.six,
  },
});
