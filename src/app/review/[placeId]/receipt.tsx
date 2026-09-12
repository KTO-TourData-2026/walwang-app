import { useState } from "react";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CameraCapture } from "@/components/review/camera-capture";
import { ReviewHeaderTitle } from "@/components/review/review-header-title";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useStoreDetailQuery } from "@/hooks/use-store-detail-query";
import { useVerifyReceiptMutation } from "@/hooks/use-verify-receipt-mutation";
import { useDemoMode } from "@/stores/demo-mode";
import { useReviewDraft } from "@/stores/review-draft";
import type { ReceiptVerifyResponse } from "@/types/review";

const SAMPLE_RECEIPT_URI = "https://picsum.photos/seed/walwang-receipt/600/900";

type ReceiptFailure = "unreadable" | "mismatch";

/** S-06 영수증 OCR 인증. `POST /reviews/receipt-verify`가 상호명 유사도로 판정한다. */
export default function ReceiptScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const isDemo = useDemoMode((state) => state.isDemo);
  const setReceipt = useReviewDraft((state) => state.setReceipt);
  const resetReceipt = useReviewDraft((state) => state.resetReceipt);
  const verifyMutation = useVerifyReceiptMutation();

  const [verified, setVerified] = useState(false);
  const [failure, setFailure] = useState<ReceiptFailure | null>(null);
  const [mismatchName, setMismatchName] = useState<string | null>(null);

  const storeQuery = useStoreDetailQuery(placeId);
  const placeName = storeQuery.data?.name ?? "이 가게";

  const applyResult = (result: ReceiptVerifyResponse, imageUri: string) => {
    if (result.verified && result.receiptToken) {
      setReceipt({
        verified: true,
        imageUri,
        matchedName: result.matchedName,
        token: result.receiptToken,
      });
      setVerified(true);
      return;
    }

    // 실패 분기는 상호명(matchedName) 유무로 판정 — 읽었는데 다르면 불일치, 못 읽으면 판독실패.
    resetReceipt();
    if (result.matchedName) {
      setMismatchName(result.matchedName);
      setFailure("mismatch");
    } else {
      setFailure("unreadable");
    }
  };

  const capture = (imageUri: string) => {
    if (verifyMutation.isPending) {
      return;
    }
    verifyMutation.mutate(
      { storeId: placeId, imageUri },
      {
        onSuccess: (result) => applyResult(result, imageUri),
        onError: () =>
          ToastAndroid.show(
            "영수증 인증에 실패했어요. 다시 시도해주세요.",
            ToastAndroid.SHORT,
          ),
      },
    );
  };

  // 데모: OCR(receipt-verify) 없이 상호명 인식을 임의 통과시킨다(§6-2). 토큰 없이도
  // POST /reviews?demo=true로 등록되므로 draft.receipt.verified만 세워 폼 선행조건을 통과시킨다.
  const passDemo = () => {
    setReceipt({
      verified: true,
      imageUri: null,
      matchedName: null,
      token: null,
    });
    setVerified(true);
  };

  const goPhoto = () =>
    router.push({ pathname: "/review/[placeId]/photo", params: { placeId } });

  const reselectStore = () => {
    router.dismissAll();
    router.navigate("/map");
  };

  if (verified) {
    return (
      <View style={styles.root}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerBackVisible: false,
            headerTitle: () => <ReviewHeaderTitle placeName={placeName} />,
            headerLeft: () => (
              <Pressable
                onPress={() => setVerified(false)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={isDemo ? "뒤로" : "다시 촬영"}
              >
                <ArrowLeft size={22} color={Palette.gray[700]} />
              </Pressable>
            ),
          }}
        />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.verifiedBlock}>
            <View style={styles.checkCircle}>
              <Check
                size={36}
                color={Palette.status.allowed[300]}
                strokeWidth={3}
              />
            </View>

            <View style={styles.titleGroup}>
              <ThemedText
                type="head03"
                color={Palette.gray[700]}
                style={styles.center}
              >
                영수증 인증이 완료됐어요
              </ThemedText>
              <ThemedText
                type="label04"
                color={Palette.gray[400]}
                style={styles.center}
              >
                {placeName} · 상호명 확인 완료
              </ThemedText>
            </View>
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + Spacing.two },
          ]}
        >
          <Button
            label="반려견 사진 찍기"
            variant="primary"
            onPress={goPhoto}
          />
          <ThemedText
            type="label05"
            color={Palette.gray[400]}
            style={styles.footerHint}
          >
            사진은 스탬프 재료로 쓰여요
          </ThemedText>
        </View>
      </View>
    );
  }

  // 데모: 카메라/OCR 대신 튜토리얼 안내를 띄우고, 상호명 인식을 임의 통과시킨다(§6-2).
  if (isDemo) {
    return (
      <View style={styles.root}>
        <Stack.Screen
          options={{
            headerShown: true,
            headerBackVisible: false,
            headerTitle: () => <ReviewHeaderTitle placeName={placeName} />,
            headerLeft: () => (
              <Pressable
                onPress={() => router.back()}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="뒤로"
              >
                <ArrowLeft size={22} color={Palette.gray[700]} />
              </Pressable>
            ),
          }}
        />

        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 120 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.tutorialHeader}>
            <ThemedText type="head03" color={Palette.gray[700]}>
              영수증 인증 튜토리얼
            </ThemedText>
            <ThemedText type="label04" color={Palette.gray[400]}>
              지금은 데모 모드예요. 가상 상호명이라 실제 영수증과 매칭할 수
              없어, 영수증 인증은 실제로 체험할 수 없어요.
            </ThemedText>
          </View>

          <View style={styles.tutorialCard}>
            <ThemedText type="subtitle03" color={Palette.gray[700]}>
              실사용에서는 이렇게 동작해요
            </ThemedText>
            <TutorialItem
              title="인증 성공"
              desc="영수증 상호명이 확인되면 바로 반려견 사진 단계로 넘어가요."
            />
            <TutorialItem
              title="판독 실패"
              desc="글씨가 잘 안 보이면 다시 촬영하도록 안내해요."
            />
            <TutorialItem
              title="상호 불일치"
              desc="다른 가게 영수증이면 가게를 다시 선택하도록 안내해요."
            />
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            { paddingBottom: insets.bottom + Spacing.two },
          ]}
        >
          <Button
            label="상호명 인식 완료"
            variant="primary"
            onPress={passDemo}
          />
          <ThemedText
            type="label05"
            color={Palette.gray[400]}
            style={styles.footerHint}
          >
            데모에서는 이 단계를 건너뛰고 통과 처리해요
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CameraCapture
        title="영수증 사진 촬영"
        hint={"상호명이 잘 나오도록 촬영해주세요.\n금액·날짜는 보지 않아요."}
        fallbackUri={SAMPLE_RECEIPT_URI}
        onCapture={capture}
        onBack={() => router.back()}
        overlay={
          verifyMutation.isPending ? (
            <View style={styles.verifyingRow}>
              <ActivityIndicator color={Palette.white} />
              <ThemedText type="label04" color={Palette.white}>
                영수증을 확인하고 있어요…
              </ThemedText>
            </View>
          ) : null
        }
      />

      <Modal
        visible={failure !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setFailure(null)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            {failure === "mismatch" ? (
              <>
                <ThemedText
                  type="subtitle02"
                  color={Palette.gray[700]}
                  style={styles.modalText}
                >
                  이 가게가 아닌 것 같아요
                </ThemedText>
                <ThemedText
                  type="label04"
                  color={Palette.gray[400]}
                  style={styles.modalText}
                >
                  {mismatchName
                    ? `영수증 상호명: ${mismatchName}`
                    : "영수증 상호명이 선택한 가게와 달라요"}
                </ThemedText>
                <View style={styles.modalActions}>
                  <Button
                    label="가게 다시 선택"
                    variant="secondary"
                    onPress={reselectStore}
                    style={styles.modalButton}
                  />
                  <Button
                    label="다시 촬영하기"
                    variant="primary"
                    onPress={() => setFailure(null)}
                    style={styles.modalButton}
                  />
                </View>
              </>
            ) : (
              <>
                <ThemedText
                  type="subtitle02"
                  color={Palette.gray[700]}
                  style={styles.modalText}
                >
                  영수증을 읽지 못했어요
                </ThemedText>
                <ThemedText
                  type="label04"
                  color={Palette.gray[400]}
                  style={styles.modalText}
                >
                  글씨가 잘 보이도록 다시 촬영해주세요
                </ThemedText>
                <View style={styles.modalActions}>
                  <Button
                    label="닫기"
                    variant="secondary"
                    onPress={() => setFailure(null)}
                    style={styles.modalButton}
                  />
                  <Button
                    label="다시 촬영하기"
                    variant="primary"
                    onPress={() => setFailure(null)}
                    style={styles.modalButton}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

function TutorialItem({ title, desc }: { title: string; desc: string }) {
  return (
    <View style={styles.tutorialItem}>
      <View style={styles.tutorialDot} />
      <View style={styles.tutorialItemText}>
        <ThemedText type="subtitle04" color={Palette.gray[700]}>
          {title}
        </ThemedText>
        <ThemedText type="label04" color={Palette.gray[400]}>
          {desc}
        </ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  tutorialHeader: {
    gap: Spacing.two,
  },
  tutorialCard: {
    gap: Spacing.three,
    marginTop: Spacing.four,
    padding: Spacing.four,
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    backgroundColor: Palette.white,
  },
  tutorialItem: {
    flexDirection: "row",
    gap: Spacing.two,
  },
  tutorialDot: {
    width: 6,
    height: 6,
    marginTop: 6,
    borderRadius: Radius.pill,
    backgroundColor: Palette.main[400],
  },
  tutorialItemText: {
    flex: 1,
    gap: Spacing.half,
  },
  content: {
    flexGrow: 1,
    padding: Spacing.four,
  },
  verifiedBlock: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
  },
  titleGroup: {
    gap: Spacing.two,
  },
  center: {
    textAlign: "center",
  },
  checkCircle: {
    width: 76,
    height: 76,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: Palette.status.allowed[100],
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    backgroundColor: Palette.background.base,
  },
  footerHint: {
    marginTop: Spacing.two,
    textAlign: "center",
  },
  verifyingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    backgroundColor: "rgba(34, 34, 34, 0.45)",
  },
  modalCard: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.large,
    backgroundColor: Palette.white,
  },
  modalText: {
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  modalButton: {
    flex: 1,
  },
});
