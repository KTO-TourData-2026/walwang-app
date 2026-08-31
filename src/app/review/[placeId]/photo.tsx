import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CameraCapture } from "@/components/review/camera-capture";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useReviewDraft } from "@/stores/review-draft";

const SAMPLE_PHOTO_URI = "https://picsum.photos/seed/walwang-dog/900/1200";

export default function PhotoScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const photoUri = useReviewDraft((state) => state.photoUri);
  const setPhotoUri = useReviewDraft((state) => state.setPhotoUri);

  const goForm = () =>
    router.push({ pathname: "/review/[placeId]/form", params: { placeId } });

  if (photoUri) {
    return (
      <View style={styles.previewRoot}>
        <Stack.Screen options={{ headerShown: false }} />

        <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
          <Pressable
            onPress={() => setPhotoUri(null)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
          >
            <ArrowLeft size={22} color={Palette.gray[700]} />
          </Pressable>
          <ThemedText type="subtitle03" color={Palette.gray[700]}>
            반려견 사진 촬영
          </ThemedText>
          <View style={styles.topSpacer} />
        </View>

        <View style={styles.previewBody}>
          <Image
            source={{ uri: photoUri }}
            style={styles.previewImage}
            contentFit="cover"
            transition={150}
            accessibilityLabel="촬영한 반려견 사진"
          />
        </View>

        <View
          style={[
            styles.previewFooter,
            { paddingBottom: insets.bottom + Spacing.two },
          ]}
        >
          <Button
            label="다시 찍기"
            variant="secondary"
            onPress={() => setPhotoUri(null)}
            style={styles.flexButton}
          />
          <Button
            label="다음"
            variant="primary"
            onPress={goForm}
            style={styles.flexButton}
          />
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CameraCapture
        title="반려견 사진 촬영"
        hint={"반려견이 잘 보이게 찍어주세요\n스탬프는 이 사진에서 만들어져요"}
        fallbackUri={SAMPLE_PHOTO_URI}
        onCapture={setPhotoUri}
        onBack={() => router.back()}
      />
    </>
  );
}

const styles = StyleSheet.create({
  previewRoot: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  topSpacer: {
    width: 22,
  },
  previewBody: {
    flex: 1,
    padding: Spacing.four,
    justifyContent: "center",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: Radius.large,
    backgroundColor: Palette.gray[100],
  },
  previewFooter: {
    flexDirection: "row",
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
  },
  flexButton: {
    flex: 1,
  },
});
