import { useState } from "react";

import { X } from "lucide-react-native";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useDemoMode } from "@/stores/demo-mode";

/**
 * 실사용/데모 전체 안내 모달(docs/demo-mode.md §6-1).
 * 모드별 문구가 아니라 두 모드의 차이를 한 번에 설명하는 전체 안내문이다.
 * - 로그인·회원가입 최초 진입 시 1회 자동 노출(주최측 자문 §5-3 "명시" 기준 충족).
 * - 상단 토글 옆 ⓘ로 언제든 재열람.
 * 표시 상태·닫기는 demo-mode 스토어가 관리한다(map 등에서 한 번만 렌더).
 */
export function DemoModeNoticeModal() {
  const visible = useDemoMode((state) => state.noticeVisible);
  const closeNotice = useDemoMode((state) => state.closeNotice);
  const [dontShowToday, setDontShowToday] = useState(false);

  const handleClose = () => {
    closeNotice(dontShowToday);
    setDontShowToday(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <Pressable style={styles.backdrop} onPress={handleClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.header}>
            <ThemedText type="subtitle02" color={Palette.gray[700]}>
              실사용 · 데모 모드 안내
            </ThemedText>
            <Pressable
              onPress={handleClose}
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
              이 앱은 하단 토글로 실사용과 데모 두 모드를 오갈 수 있습니다.
              모드를 바꾸면 보이는 장소·리뷰 데이터가 통째로 바뀝니다.
            </ThemedText>

            <View style={styles.block}>
              <ThemedText type="subtitle04" color={Palette.gray[700]}>
                실사용 모드
              </ThemedText>
              <ThemedText type="label04" color={Palette.gray[600]}>
                실제 상호명과 실사용자가 영수증 인증으로 등록한 리뷰가 그대로
                표시됩니다. 모든 기능을 정상적으로 사용할 수 있습니다.
              </ThemedText>
            </View>

            <View style={styles.block}>
              <ThemedText type="subtitle04" color={Palette.gray[700]}>
                데모 모드
              </ThemedText>
              <ThemedText type="label04" color={Palette.gray[600]}>
                본 앱은 시연용 데모 버전입니다. 위치 및 장소 API 기능 시연을
                위해 실제 매장 정보를 가상의 상호명으로 치환하여 표시하고
                있으며, 노출되는 리뷰는 모두 가상의 목(Mock) 데이터입니다.
                영수증 OCR 기능 제외 모든 기능을 사용할 수 있습니다.
              </ThemedText>
            </View>
          </ScrollView>

          <Checkbox
            label="오늘 하루 다시 보지 않기"
            checked={dontShowToday}
            onChange={setDontShowToday}
          />

          <Button label="확인" variant="main" onPress={handleClose} />
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
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  block: {
    gap: Spacing.one,
  },
});
