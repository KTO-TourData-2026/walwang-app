import { useState } from "react";

import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Dog } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlternativePlaceCard } from "@/components/review/alternative-place-card";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingView } from "@/components/ui/loading-view";
import { SHOW_REVIEW_ALTERNATIVES } from "@/constants/feature-flags";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useAlternativeStoresQuery } from "@/hooks/use-alternative-stores-query";
import { useStoreDetailQuery } from "@/hooks/use-store-detail-query";
import { useDemoMode } from "@/stores/demo-mode";
import { useReviewDraft } from "@/stores/review-draft";
import { hasCustomStamp } from "@/utils/stamp";

export default function ReviewDoneScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDemo = useDemoMode((state) => state.isDemo);
  const result = useReviewDraft((state) => state.result);
  const size = useReviewDraft((state) => state.size);
  const stampUrl = useReviewDraft((state) => state.stampUrl);
  const reset = useReviewDraft((state) => state.reset);

  const storeQuery = useStoreDetailQuery(placeId);
  const placeName = storeQuery.data?.name ?? "이 가게";
  const allowed = result === "allowed";

  // 도장 이미지 로드 실패(404·네트워크) 시 기본 아이콘으로 폴백한다(expo-image는 자동 폴백 없음).
  const [stampFailed, setStampFailed] = useState(false);

  // 데모 리뷰는 판정·집계에서 제외되고 본인에게만 보인다(§6-3). 완료 화면에 짧게 고지한다.
  const demoNotice = isDemo ? (
    <ThemedText
      type="label05"
      color={Palette.error[300]}
      style={styles.demoNotice}
    >
      데모에서 등록한 리뷰는 본인에게만 보이며, 가게 리뷰 수 집계에 반영되지
      않아요.
    </ThemedText>
  ) : null;

  const leave = (to: "/map" | "/my") => {
    reset();
    router.dismissAll();
    router.navigate(to);
  };

  // dismissAll·reset 금지 — 상세에서 뒤로가기 시 완료 화면 유지.
  const openStore = (targetId: string) => {
    router.push({
      pathname: "/store/[placeId]",
      params: { placeId: targetId },
    });
  };

  const altSize = size ?? "smallMedium";
  // 거절 완료에서만, 그리고 플래그가 켜진 경우에만 대체 장소를 조회한다
  // (들어갔어요는 스탬프 화면 / 플래그 off면 섹션 자체를 숨기므로 조회도 생략).
  const alternativesQuery = useAlternativeStoresQuery(
    !allowed && SHOW_REVIEW_ALTERNATIVES ? placeId : undefined,
    altSize,
  );
  const alternatives = (alternativesQuery.data ?? []).slice(0, 3);

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          allowed
            ? {
                justifyContent: "center",
                paddingTop: insets.top,
                paddingBottom: insets.bottom + 96,
              }
            : { paddingTop: insets.top + Spacing.six },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {allowed ? (
          <View style={styles.heroGroup}>
            <ThemedText type="head03" color={Palette.gray[700]}>
              리뷰 작성 완료
            </ThemedText>
            <Pressable
              onPress={() => openStore(placeId)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`${placeName} 상세 보기`}
            >
              <ThemedText
                type="subtitle03"
                color={Palette.gray[500]}
                style={styles.storeName}
              >
                {placeName}
              </ThemedText>
            </Pressable>

            <View style={styles.stampCircle}>
              {hasCustomStamp(stampUrl) && !stampFailed ? (
                <Image
                  source={{ uri: stampUrl }}
                  style={styles.stampImage}
                  contentFit="cover"
                  transition={150}
                  accessibilityLabel="획득한 도장"
                  onError={() => setStampFailed(true)}
                />
              ) : (
                <Dog size={56} color={Palette.main[400]} strokeWidth={1.8} />
              )}
            </View>

            <ThemedText type="subtitle01" color={Palette.gray[700]}>
              스탬프를 받았어요!
            </ThemedText>
            <ThemedText type="label04" color={Palette.gray[400]}>
              소중한 리뷰가 지도에 반영되었어요
            </ThemedText>
            {demoNotice}
          </View>
        ) : (
          <View style={styles.deniedGroup}>
            <View style={styles.heroGroup}>
              <ThemedText type="head03" color={Palette.gray[700]}>
                리뷰 작성 완료
              </ThemedText>
              <Pressable
                onPress={() => openStore(placeId)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`${placeName} 상세 보기`}
              >
                <ThemedText
                  type="subtitle03"
                  color={Palette.gray[500]}
                  style={styles.storeName}
                >
                  {placeName}
                </ThemedText>
              </Pressable>
              <ThemedText type="label04" color={Palette.gray[400]}>
                소중한 리뷰가 지도에 반영되었어요
              </ThemedText>
              {demoNotice}
            </View>

            {SHOW_REVIEW_ALTERNATIVES ? (
              <>
                <View style={styles.divider} />

                <ThemedText type="subtitle02" color={Palette.gray[700]}>
                  인근에 이런 곳은 어때요?
                </ThemedText>

                {alternativesQuery.isLoading ? (
                  <LoadingView style={styles.altLoading} />
                ) : alternativesQuery.isError ? (
                  <ErrorState
                    message="추천 장소를 불러오지 못했어요"
                    onRetry={() => alternativesQuery.refetch()}
                    style={styles.altLoading}
                  />
                ) : alternatives.length > 0 ? (
                  <View style={styles.cardList}>
                    {alternatives.map((alt) => (
                      <AlternativePlaceCard
                        key={alt.id}
                        place={alt}
                        size={altSize}
                        onPress={openStore}
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyBox}>
                    <ThemedText type="label04" color={Palette.gray[400]}>
                      근처에 추천할 만한 곳을 아직 못 찾았어요
                    </ThemedText>
                  </View>
                )}
              </>
            ) : null}
          </View>
        )}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.two }]}
      >
        {allowed ? (
          <View style={styles.footerRow}>
            <Button
              label="닫기"
              variant="secondary"
              onPress={() => leave("/map")}
              style={styles.flexButton}
            />
            <Button
              label="여권 확인하러 가기"
              variant="primary"
              onPress={() => leave("/my")}
              style={styles.flexButton}
            />
          </View>
        ) : (
          <Button
            label="닫기"
            variant="secondary"
            onPress={() => leave("/map")}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  heroGroup: {
    alignItems: "center",
    gap: Spacing.three,
  },
  storeName: {
    textDecorationLine: "underline",
  },
  demoNotice: {
    textAlign: "center",
  },
  stampCircle: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255, 154, 134, 0.14)",
    marginVertical: Spacing.four,
    overflow: "hidden",
  },
  stampImage: {
    width: "100%",
    height: "100%",
  },
  deniedGroup: {
    gap: Spacing.four,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border.disabled,
  },
  cardList: {
    gap: Spacing.three,
  },
  altLoading: {
    minHeight: 120,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: Spacing.five,
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    backgroundColor: Palette.background.base,
  },
  footerRow: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  flexButton: {
    flex: 1,
  },
});
