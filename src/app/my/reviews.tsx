import { useRouter } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { MyReviewItem } from "@/components/review/my-review-item";
import { ThemedText } from "@/components/themed-text";
import { EmptyState } from "@/components/ui/empty-state";
import { ScreenHeader } from "@/components/ui/screen-header";
import { Palette, Spacing } from "@/constants/theme";
import { MOCK_PLACES } from "@/mocks/places";
import { getMyReviews } from "@/mocks/reviews";

const PLACE_BY_ID = new Map(MOCK_PLACES.map((place) => [place.id, place]));

export default function MyReviewsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const reviews = getMyReviews();

  const openStore = (placeId: string) =>
    router.push({ pathname: "/store/[placeId]", params: { placeId } });

  return (
    <View style={styles.root}>
      <ScreenHeader title="내가 쓴 리뷰" />

      {reviews.length > 0 ? (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingBottom: insets.bottom + Spacing.four,
          }}
          ItemSeparatorComponent={Separator}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <ThemedText
              type="label05"
              color={Palette.gray[400]}
              style={styles.summary}
            >
              최신순 · {reviews.length}건
            </ThemedText>
          }
          renderItem={({ item }) => {
            const place = PLACE_BY_ID.get(item.placeId);
            if (!place) {
              return null;
            }
            return (
              <MyReviewItem review={item} place={place} onPress={openStore} />
            );
          }}
        />
      ) : (
        <EmptyState
          message="아직 남긴 리뷰가 없어요"
          onAction={() => router.navigate("/map")}
        />
      )}
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
  summary: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  separator: {
    height: 1,
    marginHorizontal: Spacing.four,
    backgroundColor: Palette.border.disabled,
  },
});
