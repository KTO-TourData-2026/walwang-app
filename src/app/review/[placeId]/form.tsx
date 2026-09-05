import { useRef, type ReactNode } from "react";

import { Image } from "expo-image";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { Camera } from "lucide-react-native";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  ToastAndroid,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ReviewHeaderTitle } from "@/components/review/review-header-title";
import { ReviewResultBadge } from "@/components/review/review-result-badge";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { SelectChip } from "@/components/ui/select-chip";
import { TextField } from "@/components/ui/text-field";
import { HASHTAGS } from "@/constants/hashtags";
import { SIZE_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useCreateReviewMutation } from "@/hooks/use-create-review-mutation";
import { useStoreDetailQuery } from "@/hooks/use-store-detail-query";
import { useReviewDraft } from "@/stores/review-draft";
import type { SizeKey } from "@/types/place";

const MIN_CONTENT = 10;
const MAX_CONTENT = 50;

const SIZE_ORDER: SizeKey[] = ["smallMedium", "large"];

export default function ReviewFormScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const result = useReviewDraft((state) => state.result);
  const receipt = useReviewDraft((state) => state.receipt);
  const photoUri = useReviewDraft((state) => state.photoUri);
  const size = useReviewDraft((state) => state.size);
  const tags = useReviewDraft((state) => state.tags);
  const content = useReviewDraft((state) => state.content);
  const setSize = useReviewDraft((state) => state.setSize);
  const toggleTag = useReviewDraft((state) => state.toggleTag);
  const setContent = useReviewDraft((state) => state.setContent);
  const setStampUrl = useReviewDraft((state) => state.setStampUrl);
  const createReviewMutation = useCreateReviewMutation();
  // 연타로 등록 API가 여러 번 호출되는 것 방지. isPending은 재렌더 후에야 반영돼
  // 프레임 내 빠른 연타를 못 막으므로, 동기 ref로 즉시 잠근다(실패 시 해제해 재시도 허용).
  const submittingRef = useRef(false);

  const storeQuery = useStoreDetailQuery(placeId);
  const placeName = storeQuery.data?.name ?? "이 가게";
  const allowed = result === "allowed";
  // 들어갔어요는 영수증 인증·사진까지 끝난 경우에만 등록 가능(선행 단계 검증).
  const prerequisitesMet =
    result === "denied" ||
    (result === "allowed" && receipt.verified && photoUri !== null);
  const canSubmit =
    prerequisitesMet && size !== null && content.trim().length >= MIN_CONTENT;

  const submit = () => {
    if (
      !canSubmit ||
      size === null ||
      submittingRef.current ||
      createReviewMutation.isPending
    ) {
      return;
    }
    submittingRef.current = true;
    createReviewMutation.mutate(
      {
        storeId: placeId,
        dogAllowed: allowed,
        dogSize: size,
        content,
        // 태그는 들어갔어요에서만 입력받는다(거절 리뷰는 빈 배열).
        tags: allowed ? tags : [],
        // 영수증 토큰·사진은 들어갔어요에서만 존재.
        receiptToken: allowed ? receipt.token : null,
        photoUri: allowed ? photoUri : null,
      },
      {
        onSuccess: (data) => {
          // 등록 응답으로 온 도장 이미지를 완료 화면에서 렌더하도록 넘긴다(없으면 폴백).
          setStampUrl(data.stampUrl);
          router.push({
            pathname: "/review/[placeId]/done",
            params: { placeId },
          });
        },
        onError: () => {
          submittingRef.current = false; // 실패 시 잠금 해제 — 다시 시도 가능.
          ToastAndroid.show(
            "리뷰 등록에 실패했어요. 잠시 후 다시 시도해주세요.",
            ToastAndroid.SHORT,
          );
        },
      },
    );
  };

  return (
    <View style={styles.root}>
      <Stack.Screen
        options={{
          headerTitle: () => <ReviewHeaderTitle placeName={placeName} />,
        }}
      />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.badgeRow}>
          <ReviewResultBadge
            allowed={allowed}
            textType="subtitle04"
            paddingVertical={6}
            paddingHorizontal={Spacing.three}
            iconSize={15}
          />
        </View>

        {allowed && photoUri ? (
          <View style={styles.photoWrap}>
            <Image
              source={{ uri: photoUri }}
              style={styles.photo}
              contentFit="cover"
              transition={150}
              accessibilityLabel="촬영한 반려견 사진"
            />
            <Pressable
              onPress={() => router.back()}
              hitSlop={6}
              accessibilityRole="button"
              accessibilityLabel="사진 다시 찍기"
              style={styles.retakeButton}
            >
              <Camera size={14} color={Palette.white} />
              <ThemedText type="label06" color={Palette.white}>
                다시 찍기
              </ThemedText>
            </Pressable>
          </View>
        ) : null}

        <Field title="견종 크기" required>
          <View style={styles.chipRow}>
            {SIZE_ORDER.map((value) => (
              <SelectChip
                key={value}
                label={SIZE_LABEL[value]}
                selected={size === value}
                onPress={() => setSize(value)}
              />
            ))}
          </View>
        </Field>

        {allowed ? (
          <Field title="해시태그" caption="선택">
            <View style={styles.chipWrap}>
              {HASHTAGS.map((tag) => (
                <SelectChip
                  key={tag}
                  label={`#${tag}`}
                  selected={tags.includes(tag)}
                  onPress={() => toggleTag(tag)}
                />
              ))}
            </View>
          </Field>
        ) : null}

        <Field
          title={allowed ? "한마디" : "어떤 상황이었나요?"}
          required
          caption="10자 이상 작성해 주세요"
          trailing={
            <ThemedText type="label05" color={Palette.gray[400]}>
              {content.trim().length} / {MAX_CONTENT}
            </ThemedText>
          }
        >
          <TextField
            value={content}
            onChangeText={setContent}
            placeholder={
              allowed
                ? "사장님이 물그릇을 챙겨주셨어요"
                : "거절 사유를 적어주세요"
            }
            multiline
            maxLength={MAX_CONTENT}
            focusColor={allowed ? Palette.black : Palette.main[500]}
            style={styles.textarea}
          />
        </Field>

        {!allowed ? (
          <View style={styles.warningBox}>
            <ThemedText type="subtitle04" color={Palette.error[300]}>
              허위 리뷰는 가게에 피해가 될 수 있어요 ㅜㅜ
            </ThemedText>
            <ThemedText type="label05" color={Palette.error[300]}>
              악의적인 허위 리뷰 도배가 확인되면 계정이 정지될 수 있어요.
            </ThemedText>
          </View>
        ) : null}
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.two }]}
      >
        <Button
          label={createReviewMutation.isPending ? "등록 중…" : "리뷰 등록하기"}
          variant="main"
          disabled={!canSubmit || createReviewMutation.isPending}
          onPress={submit}
        />
      </View>
    </View>
  );
}

function Field({
  title,
  required,
  caption,
  trailing,
  children,
}: {
  title: string;
  required?: boolean;
  caption?: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <ThemedText type="subtitle03" color={Palette.gray[700]}>
          {title}
          {required ? (
            <ThemedText type="subtitle03" color={Palette.main[500]}>
              {" *"}
            </ThemedText>
          ) : null}
        </ThemedText>
        {caption ? (
          <ThemedText type="label05" color={Palette.gray[400]}>
            {caption}
          </ThemedText>
        ) : null}
        <View style={styles.fieldSpacer} />
        {trailing}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    gap: Spacing.four,
    padding: Spacing.four,
  },
  field: {
    gap: Spacing.three,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  fieldSpacer: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: "row",
  },
  photoWrap: {
    height: 220,
    borderRadius: Radius.large,
    overflow: "hidden",
    backgroundColor: Palette.gray[100],
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  retakeButton: {
    position: "absolute",
    top: Spacing.two,
    right: Spacing.two,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.half,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    borderRadius: Radius.pill,
    backgroundColor: "rgba(34, 34, 34, 0.6)",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: Spacing.two,
  },
  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Palette.border.disabled,
    backgroundColor: Palette.background.base,
  },
  warningBox: {
    marginTop: -Spacing.two,
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Palette.error[200],
    backgroundColor: Palette.error[100],
  },
});
