import { X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Palette, Radius, Spacing } from "@/constants/theme";

/**
 * 약관 전문 모달 — 제목 + 스크롤 본문 + [닫기].
 * 회원가입의 이용약관·개인정보 '보기'에서 재사용한다.
 */
export function TermsModal({
  visible,
  title,
  body,
  onClose,
}: {
  visible: boolean;
  title: string;
  body: string;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <ThemedText type="subtitle02" color={Palette.gray[700]}>
              {title}
            </ThemedText>
            <Pressable
              onPress={onClose}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="닫기"
            >
              <X size={22} color={Palette.gray[500]} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.bodyScroll}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            <ThemedText type="label04" color={Palette.gray[600]}>
              {body}
            </ThemedText>
          </ScrollView>

          <Button label="닫기" variant="main" onPress={onClose} />
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
    maxHeight: "80%",
    gap: Spacing.three,
    padding: Spacing.four,
    borderRadius: Radius.large,
    backgroundColor: Palette.background.base,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bodyScroll: {
    flexGrow: 0,
  },
  bodyContent: {
    paddingBottom: Spacing.two,
  },
});
