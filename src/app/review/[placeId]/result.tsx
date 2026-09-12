import { useEffect } from "react";

import { useLocalSearchParams, useRouter } from "expo-router";
import { X } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useStoreDetailQuery } from "@/hooks/use-store-detail-query";
import { useReviewDraft, type ReviewResult } from "@/stores/review-draft";

export default function ReviewResultScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();
  const begin = useReviewDraft((state) => state.begin);
  const setResult = useReviewDraft((state) => state.setResult);

  const storeQuery = useStoreDetailQuery(placeId);
  const placeName = storeQuery.data?.name ?? null;

  useEffect(() => {
    if (placeId) {
      begin(placeId);
    }
  }, [placeId, begin]);

  const close = () => router.back();

  const choose = (result: ReviewResult) => {
    setResult(result);
    if (result === "allowed") {
      router.push({
        pathname: "/review/[placeId]/receipt",
        params: { placeId },
      });
    } else {
      router.push({ pathname: "/review/[placeId]/form", params: { placeId } });
    }
  };

  return (
    <View style={styles.root}>
      <Pressable
        style={styles.backdrop}
        onPress={close}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      />

      <View style={styles.card}>
        <Pressable
          onPress={close}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="닫기"
          style={styles.closeButton}
        >
          <X size={20} color={Palette.gray[400]} />
        </Pressable>

        <View style={styles.heading}>
          <ThemedText type="subtitle01" color={Palette.gray[700]}>
            들어갈 수 있었나요?
          </ThemedText>
          {placeName ? (
            <ThemedText type="subtitle03" color={Palette.gray[400]}>
              {placeName}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.actions}>
          <Button
            label="거절당했어요"
            variant="secondary"
            onPress={() => choose("denied")}
            style={styles.actionButton}
          />
          <Button
            label="들어갔어요"
            variant="primary"
            onPress={() => choose("allowed")}
            style={styles.actionButton}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(34, 34, 34, 0.45)",
  },
  card: {
    gap: Spacing.five,
    padding: Spacing.four,
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
  },
  closeButton: {
    position: "absolute",
    top: Spacing.three,
    right: Spacing.three,
    zIndex: 1,
  },
  heading: {
    alignItems: "center",
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  actionButton: {
    flex: 1,
  },
});
