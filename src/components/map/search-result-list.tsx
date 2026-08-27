import { FlatList, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Spacing } from "@/constants/theme";
import type { Place } from "@/types/place";

import { PlaceListItem } from "./place-list-item";

// 한 항목 대략 높이(패딩 32 + 이름 19 + gap 4 + 메타 17). 3개까지만 보이고 넘치면 스크롤.
const ITEM_HEIGHT = 72;
const VISIBLE_COUNT = 3;
const LIST_MAX_HEIGHT = ITEM_HEIGHT * VISIBLE_COUNT;

export type SearchResultListProps = {
  results: Place[];
  onSelectPlace: (place: Place) => void;
};

export function SearchResultList({
  results,
  onSelectPlace,
}: SearchResultListProps) {
  if (results.length === 0) {
    return (
      <View style={styles.empty}>
        <ThemedText type="label04" color={Palette.gray[400]}>
          검색 결과가 없어요
        </ThemedText>
      </View>
    );
  }

  return (
    <FlatList
      data={results}
      keyExtractor={(place) => place.id}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <PlaceListItem place={item} onPress={onSelectPlace} />
      )}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      style={styles.list}
      contentContainerStyle={styles.content}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    maxHeight: LIST_MAX_HEIGHT,
    backgroundColor: Palette.background.base,
  },
  content: {
    paddingBottom: Spacing.two,
  },
  separator: {
    height: 1,
    marginHorizontal: Spacing.four,
    backgroundColor: Palette.border.disabled,
  },
  empty: {
    alignItems: "center",
    paddingVertical: Spacing.four,
    backgroundColor: Palette.background.base,
  },
});
