import { useRef, useState, type ReactNode } from "react";

import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, SwitchCamera } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";

/** 인앱 카메라 뷰파인더(사진·영수증 공유). 촬영하면 uri를 onCapture로 넘긴다. */
export function CameraCapture({
  title,
  hint,
  fallbackUri,
  onCapture,
  onBack,
  overlay,
}: {
  title: string;
  hint?: string;
  fallbackUri: string;
  onCapture: (uri: string) => void;
  onBack: () => void;
  overlay?: ReactNode;
}) {
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<"back" | "front">("back");
  const cameraRef = useRef<CameraView>(null);

  const capture = async () => {
    if (!permission?.granted) {
      const next = await requestPermission();
      // 권한 거부 시엔 진행하지 않고 화면에 머문다.
      // (에뮬레이터·데모용 폴백은 개발 빌드에서만)
      if (!next.granted && __DEV__) {
        onCapture(fallbackUri);
      }
      return;
    }
    const shot = await cameraRef.current?.takePictureAsync({ quality: 0.7 });
    // 촬영 실패로 uri가 없으면 진행하지 않는다(개발 빌드만 폴백).
    if (shot?.uri) {
      onCapture(shot.uri);
    } else if (__DEV__) {
      onCapture(fallbackUri);
    }
  };

  // 갤러리에서 로컬 이미지를 고른다(카메라 대신). file:// 로컬 URI라 multipart 업로드가 정상 동작한다.
  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      onCapture(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.root}>
      {permission?.granted ? (
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
        />
      ) : (
        <View style={styles.fallback} />
      )}

      <View style={[styles.topBar, { paddingTop: insets.top + Spacing.two }]}>
        <View style={styles.topRow}>
          <Pressable
            onPress={onBack}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="뒤로가기"
          >
            <ArrowLeft size={22} color={Palette.white} />
          </Pressable>
          <ThemedText type="subtitle03" color={Palette.white}>
            {title}
          </ThemedText>
          <View style={styles.topSpacer} />
        </View>

        {hint ? (
          <View style={styles.toast}>
            <ThemedText
              type="label04"
              color={Palette.white}
              style={styles.toastText}
            >
              {hint}
            </ThemedText>
          </View>
        ) : null}

        {overlay}
      </View>

      {!permission?.granted ? (
        <View style={styles.permissionHint}>
          <ThemedText type="label04" color={Palette.white}>
            카메라 권한이 필요해요
          </ThemedText>
        </View>
      ) : null}

      <View
        style={[styles.bar, { paddingBottom: insets.bottom + Spacing.four }]}
      >
        <Pressable
          onPress={pickFromLibrary}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="갤러리에서 선택"
          style={styles.switchButton}
        >
          <ThemedText type="label05" color={Palette.white}>
            갤러리
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={capture}
          accessibilityRole="button"
          accessibilityLabel="촬영"
          style={styles.shutterOuter}
        >
          <View style={styles.shutterInner} />
        </Pressable>

        <Pressable
          onPress={() =>
            setFacing((prev) => (prev === "back" ? "front" : "back"))
          }
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="카메라 전환"
          style={styles.switchButton}
        >
          <SwitchCamera size={22} color={Palette.white} />
          <ThemedText type="label05" color={Palette.white}>
            전환
          </ThemedText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.black,
  },
  fallback: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1A1A1A",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 2,
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topSpacer: {
    width: 22,
  },
  toast: {
    padding: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: "rgba(34, 34, 34, 0.55)",
  },
  toastText: {
    textAlign: "center",
  },
  permissionHint: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.four,
  },
  shutterOuter: {
    width: 72,
    height: 72,
    borderRadius: Radius.pill,
    borderWidth: 4,
    borderColor: Palette.white,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterInner: {
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    backgroundColor: Palette.white,
  },
  switchButton: {
    alignItems: "center",
    gap: Spacing.half,
  },
});
