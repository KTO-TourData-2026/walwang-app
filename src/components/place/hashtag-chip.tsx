import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";

/** 해시태그 칩 하나. label은 # 없이 이름만 넘긴다. */
export function HashtagChip({ label }: { label: string }) {
  return (
    <View style={styles.chip}>
      <ThemedText type="label03" color={Palette.main[500]}>
        #{label}
      </ThemedText>
    </View>
  );
}

/** 해시태그 칩 목록. 태그가 없으면 아무것도 렌더하지 않는다. */
export function HashtagChipList({ tags }: { tags: string[] }) {
  if (tags.length === 0) {
    return null;
  }

  return (
    <View style={styles.list}>
      {tags.map((tag) => (
        <HashtagChip key={tag} label={tag} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.one,
    paddingHorizontal: 12,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255, 154, 134, 0.12)",
  },
});
