import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { PawPrint } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AlternativePlaceCard } from "@/components/review/alternative-place-card";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { getAlternativePlaces, MOCK_PLACES } from "@/mocks/places";
import { useReviewDraft } from "@/stores/review-draft";

export default function ReviewDoneScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const result = useReviewDraft((state) => state.result);
  const size = useReviewDraft((state) => state.size);
  const reset = useReviewDraft((state) => state.reset);

  const place = MOCK_PLACES.find((item) => item.id === placeId);
  const placeName = place?.name ?? "이 가게";
  const allowed = result === "allowed";

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
  const alternatives = allowed ? [] : getAlternativePlaces(placeId, altSize, 3);

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
              <PawPrint size={56} color={Palette.main[400]} />
            </View>

            <ThemedText type="subtitle01" color={Palette.gray[700]}>
              스탬프를 받았어요!
            </ThemedText>
            <ThemedText type="label04" color={Palette.gray[400]}>
              소중한 리뷰가 지도에 반영되었어요
            </ThemedText>
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
            </View>

            <View style={styles.divider} />

            <ThemedText type="subtitle02" color={Palette.gray[700]}>
              인근에 이런 곳은 어때요?
            </ThemedText>

            {alternatives.length > 0 ? (
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
  stampCircle: {
    width: 180,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: "rgba(255, 154, 134, 0.14)",
    marginVertical: Spacing.four,
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
