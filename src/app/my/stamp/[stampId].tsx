import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, PawPrint, X } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingView } from "@/components/ui/loading-view";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { usePassportDetailQuery } from "@/hooks/use-passport-detail-query";
import { formatReviewDate } from "@/utils/date";

// 이미지 저장은 네이티브 의존성(view-shot/media-library) 전이라 안내만 — 실제 저장은 범위 밖.
export default function StampDetailScreen() {
  const router = useRouter();
  const { stampId } = useLocalSearchParams<{ stampId: string }>();
  const {
    data: stamp,
    isLoading,
    isError,
    refetch,
  } = usePassportDetailQuery(stampId);

  const close = () => router.back();

  // 이미지 저장은 네이티브 의존성(view-shot/media-library) 전이라 후속 이슈에서 구현.
  const saveImage = () => {};

  const openStore = () => {
    if (stamp) {
      router.replace({
        pathname: "/store/[placeId]",
        params: { placeId: stamp.storeId },
      });
    }
  };

  return (
    <View style={styles.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <Pressable
        style={styles.backdrop}
        onPress={close}
        accessibilityLabel="닫기"
      />

      <View style={styles.card}>
        <Pressable
          style={styles.closeButton}
          onPress={close}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        >
          <X size={22} color={Palette.gray[500]} />
        </Pressable>

        {isLoading ? (
          <LoadingView style={styles.loading} />
        ) : isError ? (
          <ErrorState
            message="도장을 불러오지 못했어요"
            onRetry={() => refetch()}
            style={styles.loading}
          />
        ) : stamp ? (
          <>
            <View style={styles.imageWrap}>
              {stamp.photoUrl ? (
                <Image
                  source={{ uri: stamp.photoUrl }}
                  style={styles.image}
                  contentFit="cover"
                  transition={150}
                  accessibilityLabel="당시 촬영한 반려견 원본 사진"
                />
              ) : (
                <View style={styles.silhouette}>
                  <PawPrint
                    size={72}
                    color={Palette.main[300]}
                    strokeWidth={1.6}
                  />
                  <ThemedText type="label05" color={Palette.gray[400]}>
                    원본 사진이 없어 발도장으로 남겼어요
                  </ThemedText>
                </View>
              )}
            </View>

            <Pressable
              style={styles.storeRow}
              onPress={openStore}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel={`${stamp.storeName} 상세 보기`}
            >
              <ThemedText type="subtitle02" color={Palette.gray[700]}>
                {stamp.storeName}
              </ThemedText>
              <ChevronRight size={18} color={Palette.gray[500]} />
            </Pressable>

            <ThemedText type="label05" color={Palette.gray[400]}>
              {formatReviewDate(stamp.createdAt)}
            </ThemedText>

            <Button
              label="원본 이미지 저장하기"
              variant="secondary"
              onPress={saveImage}
              style={styles.saveButton}
            />
          </>
        ) : (
          <ThemedText
            type="label03"
            color={Palette.gray[500]}
            style={styles.notFound}
          >
            도장 정보를 찾을 수 없어요
          </ThemedText>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.four,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  card: {
    width: "100%",
    maxWidth: 360,
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.large,
    backgroundColor: Palette.background.base,
  },
  closeButton: {
    alignSelf: "flex-end",
  },
  imageWrap: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: Radius.medium,
    backgroundColor: Palette.background.subtle,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  silhouette: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  storeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
  },
  saveButton: {
    marginTop: Spacing.one,
  },
  loading: {
    minHeight: 200,
  },
  notFound: {
    textAlign: "center",
    paddingVertical: Spacing.five,
  },
});
