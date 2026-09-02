import { useRouter } from "expo-router";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Passport } from "@/components/my/passport";
import { ProfileSummaryCard } from "@/components/my/profile-summary-card";
import { ThemedText } from "@/components/themed-text";
import { Palette, Spacing } from "@/constants/theme";
import { useLogoutMutation } from "@/hooks/use-logout-mutation";
import { MOCK_PASSPORT, MOCK_USER } from "@/mocks/user";
import type { PassportStamp } from "@/types/user";

export default function MyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logoutMutation = useLogoutMutation();

  const openReviews = () => router.push("/my/reviews");

  const openStamp = (stamp: PassportStamp) =>
    router.push({
      pathname: "/my/stamp/[stampId]",
      params: { stampId: stamp.id },
    });

  const logout = () =>
    Alert.alert("로그아웃", "로그아웃할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        style: "destructive",
        onPress: async () => {
          // 서버 호출이 실패해도 토큰은 정리되므로(logout()의 finally) 로그인으로 보낸다.
          try {
            await logoutMutation.mutateAsync();
          } catch {
            // 네트워크 실패는 무시 — 로컬 세션은 이미 정리됨.
          }
          ToastAndroid.show("로그아웃됐어요!", ToastAndroid.SHORT);
          router.replace("/login");
        },
      },
    ]);

  const deleteAccount = () =>
    Alert.alert(
      "회원 탈퇴",
      "정말 탈퇴할까요?\n모은 도장과 리뷰가 모두 사라져요.",
      [
        { text: "취소", style: "cancel" },
        {
          text: "탈퇴",
          style: "destructive",
          onPress: () => router.replace("/login"),
        },
      ],
    );

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.three },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ProfileSummaryCard
        user={MOCK_USER}
        onPressReviews={openReviews}
        onLogout={logout}
      />

      <View style={styles.passportSection}>
        <ThemedText type="subtitle02" color={Palette.gray[700]}>
          나의 여권
        </ThemedText>
        <Passport stamps={MOCK_PASSPORT} onSelectStamp={openStamp} />
      </View>

      <Pressable
        onPress={deleteAccount}
        hitSlop={8}
        accessibilityRole="button"
        style={styles.deleteAccount}
      >
        <ThemedText
          type="label05"
          color={Palette.gray[400]}
          style={styles.deleteAccountText}
        >
          회원 탈퇴
        </ThemedText>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
  },
  passportSection: {
    gap: Spacing.three,
  },
  deleteAccount: {
    alignSelf: "center",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  deleteAccountText: {
    textDecorationLine: "underline",
  },
});
