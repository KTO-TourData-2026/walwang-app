import { useState } from "react";

import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronRight, Dog, X } from "lucide-react-native";
import { Pressable, StyleSheet, ToastAndroid, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingView } from "@/components/ui/loading-view";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { usePassportDetailQuery } from "@/hooks/use-passport-detail-query";
import { formatReviewDate } from "@/utils/date";
import { isLoadableImageUrl } from "@/utils/stamp";

export default function StampDetailScreen() {
  const router = useRouter();
  const { stampId } = useLocalSearchParams<{ stampId: string }>();
  const {
    data: stamp,
    isLoading,
    isError,
    refetch,
  } = usePassportDetailQuery(stampId);

  // 원본 사진 URL이 있어도 로드 실패(예: 데모의 도달 불가 목 URL)하면 아이콘 폴백으로 넘긴다.
  const [photoFailed, setPhotoFailed] = useState(false);
  const [saving, setSaving] = useState(false);
  const photoUrl = stamp?.photoUrl ?? null;
  const showPhoto = isLoadableImageUrl(photoUrl) && !photoFailed;

  const close = () => router.back();

  // 원본 사진을 기기 갤러리에 저장한다. expo-media-library는 네이티브 모듈이라
  // dev build 재빌드(npx expo run:android) 후에만 동작한다(재빌드 전엔 catch로 안내).
  const saveImage = async () => {
    if (saving) {
      return;
    }
    // 이미지가 없거나 로드 실패(아이콘 폴백)한 도장은 저장할 원본이 없다.
    if (!showPhoto || !photoUrl) {
      ToastAndroid.show("이미지를 저장할 수 없어요.", ToastAndroid.SHORT);
      return;
    }
    setSaving(true);
    try {
      const MediaLibrary = await import("expo-media-library");
      // 갤러리 쓰기 권한만 요청(writeOnly). 거부되면 저장하지 않는다.
      const permission = await MediaLibrary.requestPermissionsAsync(true);
      if (!permission.granted) {
        ToastAndroid.show("사진 저장 권한이 필요해요.", ToastAndroid.SHORT);
        return;
      }
      // 원격 사진을 캐시로 내려받은 뒤 갤러리 에셋으로 등록한다.
      const downloaded = await File.downloadFileAsync(
        photoUrl,
        new Directory(Paths.cache),
      );
      await MediaLibrary.Asset.create(downloaded.uri);
      ToastAndroid.show("사진을 저장했어요.", ToastAndroid.SHORT);
    } catch {
      ToastAndroid.show(
        "사진 저장에 실패했어요. 잠시 후 다시 시도해주세요.",
        ToastAndroid.SHORT,
      );
    } finally {
      setSaving(false);
    }
  };

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
              {isLoadableImageUrl(photoUrl) && !photoFailed ? (
                <Image
                  source={{ uri: photoUrl }}
                  style={styles.image}
                  contentFit="cover"
                  transition={150}
                  accessibilityLabel="당시 촬영한 반려견 원본 사진"
                  onError={() => setPhotoFailed(true)}
                />
              ) : (
                <View style={styles.silhouette}>
                  <Dog size={72} color={Palette.gray[300]} strokeWidth={1.6} />
                  <ThemedText type="label05" color={Palette.gray[400]}>
                    {photoFailed
                      ? "사진을 불러오지 못해 아이콘으로 남겼어요"
                      : "원본 사진이 없어 아이콘으로 남겼어요"}
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
              label={saving ? "저장 중…" : "원본 이미지 저장하기"}
              variant="secondary"
              onPress={saveImage}
              disabled={saving}
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
