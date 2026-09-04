import { Image, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CATEGORY_LABEL } from "@/constants/category";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { NearbyPlace } from "@/types/course";

// 코스 인근 장소 카드. 탭하면 가진 정보만으로 가게 상세를 프리뷰로 연다(storeId 없음).
export function NearbyPlaceCard({
  place,
  onPress,
}: {
  place: NearbyPlace;
  onPress: (place: NearbyPlace) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(place)}
      accessibilityRole="button"
      accessibilityLabel={`인근 장소 ${place.title}`}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      {place.imageUrl ? (
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.thumb}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.thumb, styles.thumbEmpty]} />
      )}

      <View style={styles.body}>
        <ThemedText
          type="subtitle03"
          color={Palette.gray[700]}
          numberOfLines={1}
        >
          {place.title}
        </ThemedText>
        <ThemedText type="label05" color={Palette.gray[400]} numberOfLines={1}>
          {CATEGORY_LABEL[place.category]}
          {place.address ? ` · ${place.address}` : ""}
        </ThemedText>
      </View>
    </Pressable>
  );
}

const THUMB_SIZE = 48;

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.three,
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
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: Radius.small,
    backgroundColor: Palette.background.subtle,
  },
  thumbEmpty: {
    borderWidth: 1,
    borderColor: Palette.border.disabled,
  },
  body: {
    flex: 1,
    gap: Spacing.half,
  },
});
