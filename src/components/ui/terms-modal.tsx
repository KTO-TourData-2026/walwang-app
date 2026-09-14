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
      {/*
        backdrop 탭(닫기) 타겟을 sheet 뒤 형제 레이어로 둔다. sheet를 Pressable로
        감싸면 그 조상 터치러블이 Android에서 ScrollView의 드래그 responder를 가끔
        가로채 스크롤이 "됐다 안 됐다" 한다. sheet는 일반 View라 스크롤 제스처를 방해
        하지 않고, sheet 밖(=뒤 Pressable 노출 영역)을 탭할 때만 닫힌다.
      */}
      <View style={styles.backdrop}>
        <Pressable
          style={StyleSheet.absoluteFill}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="닫기"
        />
        <View style={styles.sheet}>
          <View style={styles.header}>
            <ThemedText
              type="subtitle02"
              color={Palette.gray[700]}
              style={styles.headerTitle}
            >
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
        </View>
      </View>
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
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  // 제목이 길어 줄바꿈돼도 X 아이콘을 밀지 않도록 가용 폭 안에서 접히게 한다.
  headerTitle: {
    flex: 1,
  },
  bodyScroll: {
    // 본문이 짧을 땐 콘텐츠만큼만 차지하고(hug), 길 땐 sheet의 maxHeight(80%)
    // 안에서 줄어들어 스크롤 영역이 생기도록 flexShrink를 켠다. RN은 flex 자식의
    // flexShrink 기본값이 0이라 이게 없으면 ScrollView가 콘텐츠 전체 높이로 커져
    // 스크롤이 안 잡힌다.
    flexGrow: 0,
    flexShrink: 1,
  },
  bodyContent: {
    paddingBottom: Spacing.two,
  },
});
