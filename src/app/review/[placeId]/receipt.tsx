import { useState } from "react";

import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Check } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CameraCapture } from "@/components/review/camera-capture";
import { ReviewHeaderTitle } from "@/components/review/review-header-title";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { MOCK_PLACES } from "@/mocks/places";
import { mockVerifyReceipt, type ReceiptOutcome } from "@/mocks/receipt";
import { useReviewDraft } from "@/stores/review-draft";

const SAMPLE_RECEIPT_URI = "https://picsum.photos/seed/walwang-receipt/600/900";

type ReceiptFailure = "unreadable" | "mismatch";

/** S-06 영수증 OCR 인증. OCR은 API라 결과만 목으로 흉내 낸다(mockVerifyReceipt). */
export default function ReceiptScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const setReceipt = useReviewDraft((state) => state.setReceipt);
  const resetReceipt = useReviewDraft((state) => state.resetReceipt);

  const [verified, setVerified] = useState(false);
  const [failure, setFailure] = useState<ReceiptFailure | null>(null);
  const [mismatchName, setMismatchName] = useState<string | null>(null);

  const place = MOCK_PLACES.find((item) => item.id === placeId);
  const placeName = place?.name ?? "이 가게";

  const applyOutcome = (outcome: ReceiptOutcome, imageUri: string) => {
    if (!place) {
      return;
    }
    const verdict = mockVerifyReceipt(place, outcome);

    if (verdict.verified) {
      setReceipt({
        verified: true,
        imageUri,
        matchedName: verdict.matchedName,
        token: verdict.receiptToken,
      });
      setVerified(true);
      return;
    }

    resetReceipt();
    if (verdict.reason === "OCR_FAILED") {
      setFailure("unreadable");
    } else {
      setMismatchName(verdict.matchedName);
      setFailure("mismatch");
    }
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
                accessibilityLabel="다시 촬영"
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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <CameraCapture
        title="영수증 사진 촬영"
        hint={"상호명이 잘 나오도록 촬영해주세요.\n금액·날짜는 보지 않아요."}
        fallbackUri={SAMPLE_RECEIPT_URI}
        onCapture={(uri) => applyOutcome("verified", uri)}
        onBack={() => router.back()}
        overlay={
          __DEV__ ? (
            <DevOutcomeRow
              onPick={(outcome) => applyOutcome(outcome, SAMPLE_RECEIPT_URI)}
            />
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

/** [DEV 전용] OCR 결과 강제 — 실연동 시 제거. */
function DevOutcomeRow({
  onPick,
}: {
  onPick: (outcome: ReceiptOutcome) => void;
}) {
  const options: { label: string; outcome: ReceiptOutcome }[] = [
    { label: "정상", outcome: "verified" },
    { label: "불일치", outcome: "mismatch" },
    { label: "판독실패", outcome: "unreadable" },
  ];
  return (
    <View style={styles.devRow}>
      <ThemedText type="label06" color="rgba(255,255,255,0.6)">
        DEV
      </ThemedText>
      {options.map((option) => (
        <Pressable
          key={option.outcome}
          onPress={() => onPick(option.outcome)}
          hitSlop={6}
          style={styles.devChip}
        >
          <ThemedText type="label06" color={Palette.white}>
            {option.label}
          </ThemedText>
        </Pressable>
      ))}
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
  devRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  devChip: {
    paddingVertical: Spacing.half,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.small,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.4)",
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
