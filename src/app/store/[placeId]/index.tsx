import { useState } from "react";

import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  Heart,
  MessageCircleDashed,
  PawPrint,
} from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { HashtagChipList } from "@/components/place/hashtag-chip";
import { SizeStatusSection } from "@/components/place/size-status-section";
import { ReviewSummaryRow } from "@/components/review/review-summary-row";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABEL } from "@/constants/category";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { MOCK_PLACES } from "@/mocks/places";
import { getPlaceTags, getRecentReviews } from "@/mocks/reviews";

/**
 * 가게 상세(S-05) — 전체 화면 페이지. 지도 핀/검색 결과에서 진입한다.
 * 리뷰 쓰기 플로우(플로우 A)의 시작점. 데이터는 목(src/mocks).
 */
export default function StoreDetailScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);

  const place = MOCK_PLACES.find((item) => item.id === placeId);

  if (!place) {
    return (
      <View style={[styles.root, styles.center]}>
        <Stack.Screen options={{ headerShown: false }} />
        <ThemedText type="label03" color={Palette.gray[500]}>
          가게 정보를 찾을 수 없어요
        </ThemedText>
      </View>
    );
  }

  const reviews = getRecentReviews(place.id, 3);
  const tags = getPlaceTags(place.id);
  const coverUri = reviews.find((review) => review.photoUrl)?.photoUrl ?? null;
  const hasReviews = reviews.length > 0;

  const goWrite = () =>
    router.push({
      pathname: "/review/[placeId]/receipt",
      params: { placeId: place.id },
    });

  const goAllReviews = () =>
    router.push({
      pathname: "/store/[placeId]/reviews",
      params: { placeId: place.id },
    });

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: insets.bottom + 96,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.cover}>
          {coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.coverImage}
              contentFit="cover"
              transition={150}
              accessibilityLabel="가게 대표 사진"
            />
          ) : (
            <View style={styles.coverPlaceholder}>
              <PawPrint size={44} color={Palette.gray[300]} />
            </View>
          )}

          <Pressable
            style={[styles.iconButton, { top: insets.top + Spacing.two }]}
            onPress={() => router.back()}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
          >
            <ArrowLeft size={22} color={Palette.gray[700]} />
          </Pressable>

          <Pressable
            style={[
              styles.iconButton,
              styles.saveButton,
              { top: insets.top + Spacing.two },
            ]}
            onPress={() => setSaved((prev) => !prev)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={saved ? "저장 해제" : "저장"}
          >
            <Heart
              size={22}
              color={saved ? Palette.main[500] : Palette.gray[700]}
              fill={saved ? Palette.main[500] : "transparent"}
            />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.headerGroup}>
            <View style={styles.titleBlock}>
              <ThemedText type="head03" color={Palette.gray[700]}>
                {place.name}
              </ThemedText>
              <ThemedText type="label04" color={Palette.gray[400]}>
                {CATEGORY_LABEL[place.category]} · {place.location}
              </ThemedText>
            </View>

            <SizeStatusSection
              placeId={place.id}
              sizeStatus={place.sizeStatus}
            />
          </View>

          <View style={styles.divider} />

          {tags.length > 0 ? (
            <View style={styles.tagSection}>
              <ThemedText type="subtitle02" color={Palette.gray[700]}>
                인기 해시태그
              </ThemedText>
              <HashtagChipList tags={tags} />
            </View>
          ) : null}

          {hasReviews ? (
            <View style={styles.reviewSection}>
              <View style={styles.reviewSectionHeader}>
                <ThemedText type="subtitle02" color={Palette.gray[700]}>
                  최근 리뷰
                </ThemedText>
                <Pressable
                  style={styles.moreButton}
                  onPress={goAllReviews}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="리뷰 전체보기"
                >
                  <ThemedText type="label03" color={Palette.gray[500]}>
                    전체보기
                  </ThemedText>
                  <ChevronRight size={16} color={Palette.gray[500]} />
                </Pressable>
              </View>

              <View style={styles.reviewCard}>
                {reviews.map((review, index) => (
                  <View key={review.id}>
                    {index > 0 ? <View style={styles.reviewSep} /> : null}
                    <ReviewSummaryRow review={review} />
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MessageCircleDashed size={30} color={Palette.main[500]} />
              </View>
              <View style={styles.emptyText}>
                <ThemedText type="label03" color={Palette.gray[600]}>
                  아직 리뷰가 없어요
                </ThemedText>
                <ThemedText type="label04" color={Palette.gray[400]}>
                  첫 리뷰를 남겨보세요!
                </ThemedText>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.two }]}
      >
        <Button label="리뷰 쓰기" variant="main" onPress={goWrite} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  cover: {
    height: 220,
    backgroundColor: Palette.gray[100],
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButton: {
    position: "absolute",
    left: Spacing.four,
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
  },
  saveButton: {
    left: undefined,
    right: Spacing.four,
  },
  body: {
    flexGrow: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  headerGroup: {
    gap: 6,
  },
  titleBlock: {
    gap: Spacing.two,
  },
  divider: {
    height: 1,
    marginTop: -Spacing.two,
    backgroundColor: Palette.border.disabled,
  },
  tagSection: {
    gap: Spacing.three,
    marginTop: -Spacing.one,
  },
  reviewCard: {
    padding: Spacing.four,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    backgroundColor: Palette.background.subtle,
  },
  reviewSection: {
    gap: Spacing.three,
  },
  reviewSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moreButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
  },
  reviewSep: {
    height: 1,
    marginVertical: Spacing.three,
    backgroundColor: Palette.border.disabled,
  },
  empty: {
    flex: 1,
    gap: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 154, 134, 0.12)",
  },
  emptyText: {
    alignItems: "center",
    gap: Spacing.half,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    backgroundColor: Palette.background.base,
  },
});
