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
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingView } from "@/components/ui/loading-view";
import { CATEGORY_LABEL } from "@/constants/category";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useSavedStoresQuery } from "@/hooks/use-saved-stores-query";
import { useStoreDetailQuery } from "@/hooks/use-store-detail-query";
import { useStoreReviewsQuery } from "@/hooks/use-store-reviews-query";
import { useToggleSavedStoreMutation } from "@/hooks/use-toggle-saved-store-mutation";
import type { Category } from "@/types/place";
import type { StoreDetail } from "@/types/store";
import { isLoadableImageUrl } from "@/utils/stamp";

type NearbyParams = {
  title?: string;
  address?: string;
  category?: string;
  imageUrl?: string;
};

// 코스 인근 장소(nearby)는 storeId가 없어 서버 조회를 못 한다. 넘어온 정보만으로
// 상세를 프리뷰로 채운다(크기 상태·리뷰 없음, 리뷰쓰기/저장 비활성).
function buildNearbyPlace(params: NearbyParams, id: string): StoreDetail {
  return {
    id,
    name: params.title ?? "",
    category: (params.category as Category) ?? "cafe",
    location: params.address ?? "",
    latitude: 0,
    longitude: 0,
    // 한국관광공사 API로 검증된 장소라 리뷰가 없어도 크기 무관 동반 가능으로 본다.
    sizeStatus: { smallMedium: "allowed", large: "allowed" },
    reviewCount: 0,
    lastVerifiedAt: null,
    tags: [],
    openTime: null,
    closeTime: null,
    thumbnailUrls: params.imageUrl ? [params.imageUrl] : [],
    sizeCounts: {
      smallMedium: { possible: 0, impossible: 0 },
      large: { possible: 0, impossible: 0 },
    },
  };
}

/**
 * 가게 상세(S-05) — 전체 화면 페이지. 지도 핀/검색 결과에서 진입한다.
 * 리뷰 쓰기 플로우(플로우 A)의 시작점.
 */
export default function StoreDetailScreen() {
  const params = useLocalSearchParams<
    { placeId: string; nearby?: string } & NearbyParams
  >();
  const placeId = params.placeId;
  const isNearby = params.nearby === "1";
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [failedCoverUri, setFailedCoverUri] = useState<string | null>(null);

  // 인근 장소 프리뷰는 조회 훅을 모두 비활성화하고 넘어온 params로 렌더한다.
  const detailQuery = useStoreDetailQuery(isNearby ? undefined : placeId);
  const reviewsQuery = useStoreReviewsQuery(isNearby ? undefined : placeId);
  const savedStoresQuery = useSavedStoresQuery({ enabled: !isNearby });
  const toggleSaved = useToggleSavedStoreMutation();
  const place = isNearby ? buildNearbyPlace(params, placeId) : detailQuery.data;

  // 저장 여부는 저장 목록 캐시에서 파생한다(상세 응답엔 saved 필드가 없음).
  const saved =
    savedStoresQuery.data?.some((item) => item.id === placeId) ?? false;

  const toggleSave = () => {
    if (!place) {
      return;
    }
    toggleSaved.mutate({ storeId: place.id, nextSaved: !saved, place });
  };

  if (detailQuery.isLoading) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <LoadingView />
      </View>
    );
  }

  if (detailQuery.isError || !place) {
    return (
      <View style={styles.root}>
        <Stack.Screen options={{ headerShown: false }} />
        <ErrorState
          message="가게 정보를 불러오지 못했어요"
          onRetry={() => detailQuery.refetch()}
          onBack={() => router.back()}
        />
      </View>
    );
  }

  const reviews = (reviewsQuery.data?.pages.flat() ?? []).slice(0, 3);
  const tags = place.tags;
  const reviewCover =
    reviews.find((review) => review.photoUrl)?.photoUrl ?? null;
  const coverUri = isNearby ? (place.thumbnailUrls[0] ?? null) : reviewCover;
  const hasReviews = reviews.length > 0;

  const goWrite = () =>
    router.push({
      pathname: "/review/[placeId]/result",
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
          {isLoadableImageUrl(coverUri) && failedCoverUri !== coverUri ? (
            <Image
              source={{ uri: coverUri }}
              style={styles.coverImage}
              contentFit="cover"
              transition={150}
              accessibilityLabel="가게 대표 사진"
              onError={() => setFailedCoverUri(coverUri)}
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

          {isNearby ? null : (
            <Pressable
              style={[
                styles.iconButton,
                styles.saveButton,
                { top: insets.top + Spacing.two },
              ]}
              onPress={toggleSave}
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
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.headerGroup}>
            <View style={styles.titleBlock}>
              <ThemedText type="head03" color={Palette.gray[700]}>
                {place.name}
              </ThemedText>
              <ThemedText type="label04" color={Palette.gray[400]}>
                {CATEGORY_LABEL[place.category]}
                {place.location ? ` · ${place.location}` : ""}
              </ThemedText>
            </View>

            <SizeStatusSection
              sizeStatus={place.sizeStatus}
              counts={{
                smallMedium: place.sizeCounts.smallMedium.possible,
                large: place.sizeCounts.large.possible,
              }}
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

          {reviewsQuery.isLoading ? (
            <LoadingView style={styles.reviewState} />
          ) : reviewsQuery.isError ? (
            <ErrorState
              message="리뷰를 불러오지 못했어요"
              onRetry={() => reviewsQuery.refetch()}
              style={styles.reviewState}
            />
          ) : hasReviews ? (
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
            <EmptyState
              Icon={MessageCircleDashed}
              title="아직 리뷰가 없어요"
              subtitle={
                isNearby ? "코스 주변 추천 장소예요" : "첫 리뷰를 남겨보세요!"
              }
              actionLabel={null}
              style={styles.reviewState}
            />
          )}
        </View>
      </ScrollView>

      {isNearby ? null : (
        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + Spacing.two },
          ]}
        >
          <Button label="리뷰 쓰기" variant="main" onPress={goWrite} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
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
  reviewState: {
    minHeight: 220,
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
