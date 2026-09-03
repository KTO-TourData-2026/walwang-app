import { useState } from "react";

import { Modal, Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";

const MAX_LENGTH = 50;

/**
 * 리뷰 신고 입력 모달 — 50자 이내 사유 + [닫기]/[제출].
 * (신고 API 미구현: onSubmit은 화면단에서 접수 안내만 처리한다.)
 */
export function ReportModal({
  visible,
  onClose,
  onSubmit,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");

  const close = () => {
    setReason("");
    onClose();
  };

  const submit = () => {
    onSubmit(reason.trim());
    setReason("");
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={close}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <ThemedText type="subtitle02" color={Palette.gray[700]}>
            리뷰 신고
          </ThemedText>
          <ThemedText type="label04" color={Palette.gray[500]}>
            부적절한 리뷰인가요? 신고 사유를 남겨주세요.
          </ThemedText>

          <View style={styles.inputWrap}>
            <TextInput
              value={reason}
              onChangeText={(text) => setReason(text.slice(0, MAX_LENGTH))}
              maxLength={MAX_LENGTH}
              multiline
              placeholder="신고 사유 (50자 이내)"
              placeholderTextColor={Palette.gray[300]}
              style={styles.input}
              textAlignVertical="top"
            />
            <ThemedText
              type="label06"
              color={Palette.gray[400]}
              style={styles.counter}
            >
              {reason.length}/{MAX_LENGTH}
            </ThemedText>
          </View>

          <View style={styles.actions}>
            <Button
              label="닫기"
              variant="secondary"
              onPress={close}
              style={styles.action}
            />
            <Button
              label="제출"
              variant="main"
              onPress={submit}
              disabled={reason.trim().length === 0}
              style={styles.action}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    padding: Spacing.four,
    backgroundColor: "rgba(0, 0, 0, 0.35)",
  },
  sheet: {
    gap: Spacing.two,
    padding: Spacing.four,
    borderRadius: Radius.large,
    backgroundColor: Palette.background.base,
  },
  inputWrap: {
    marginTop: Spacing.one,
    gap: Spacing.one,
  },
  input: {
    minHeight: 96,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Palette.border.default,
    color: Palette.gray[700],
    backgroundColor: Palette.background.subtle,
  },
  counter: {
    alignSelf: "flex-end",
  },
  actions: {
    flexDirection: "row",
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  action: {
    flex: 1,
  },
});
