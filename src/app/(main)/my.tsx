import { useEffect } from "react";

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
import { ErrorState } from "@/components/ui/error-state";
import { LoadingView } from "@/components/ui/loading-view";
import { BottomTabInset, Palette, Spacing } from "@/constants/theme";
import { useDeleteAccountMutation } from "@/hooks/use-delete-account-mutation";
import { useLogoutMutation } from "@/hooks/use-logout-mutation";
import { useMyProfileQuery } from "@/hooks/use-my-profile-query";
import { usePassportQuery } from "@/hooks/use-passport-query";
import type { PassportSummary } from "@/types/user";

export default function MyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logoutMutation = useLogoutMutation();
  const deleteAccountMutation = useDeleteAccountMutation();
  const profileQuery = useMyProfileQuery();
  const passportQuery = usePassportQuery();
  const {
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = passportQuery;

  // 여권 도장 전 페이지를 순차로 이어받아 전부 표시한다(11개 이상 대응).
  // 다음 페이지 요청이 실패하면 자동 재요청을 멈춘다(무한 재시도 방지). 사용자가
  // refetch로 재시도하면 에러가 풀려 이어서 조회한다.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);

  // 무한 쿼리의 페이지 배열을 하나로 합쳐 Passport에 넘긴다.
  const stamps = passportQuery.data?.pages.flat() ?? [];

  const openReviews = () => router.push("/my/reviews");

  const openStamp = (stamp: PassportSummary) =>
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
          onPress: async () => {
            try {
              await deleteAccountMutation.mutateAsync();
            } catch {
              // 탈퇴 실패 시 계정·세션은 그대로 유지된다(deleteUser는 성공 뒤에만 토큰 정리).
              ToastAndroid.show(
                "탈퇴에 실패했어요. 잠시 후 다시 시도해주세요.",
                ToastAndroid.SHORT,
              );
              return;
            }
            ToastAndroid.show("탈퇴가 완료됐어요.", ToastAndroid.SHORT);
            router.replace("/login");
          },
        },
      ],
    );

  // 프로필·여권 두 쿼리가 모두 준비될 때까지 화면 전체를 채우는 로딩 하나만 보인다
  // (섹션별 스피너 중복 방지). ScrollView 밖에서 그려야 flex가 먹어 진짜 중앙에 온다.
  if (profileQuery.isLoading || passportQuery.isLoading) {
    return (
      <View style={[styles.root, styles.loading]}>
        <LoadingView />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.root}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + Spacing.three },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* 에러는 프로필·여권 원인이 서로 달라(재시도도 별도) 섹션별로 유지한다. */}
      {profileQuery.isError || !profileQuery.data ? (
        <ErrorState
          message="프로필을 불러오지 못했어요"
          onRetry={() => profileQuery.refetch()}
          style={styles.profileState}
        />
      ) : (
        <ProfileSummaryCard
          user={profileQuery.data}
          onPressReviews={openReviews}
          onLogout={logout}
        />
      )}

      <View style={styles.passportSection}>
        <ThemedText type="subtitle02" color={Palette.gray[700]}>
          나의 여권
        </ThemedText>
        {passportQuery.isError ? (
          <ErrorState
            message="여권을 불러오지 못했어요"
            onRetry={() => passportQuery.refetch()}
            style={styles.passportState}
          />
        ) : (
          <Passport stamps={stamps} onSelectStamp={openStamp} />
        )}
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
  loading: {
    // LoadingView(flex:1)가 화면을 채워 중앙정렬되게 한다. 하단 탭 높이만큼 빼서
    // 탭 바 위 보이는 영역 기준으로 가운데 오도록 보정.
    paddingBottom: BottomTabInset,
  },
  profileState: {
    minHeight: 148,
  },
  passportState: {
    minHeight: 260,
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
