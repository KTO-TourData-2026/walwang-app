import { Modal, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { CATEGORY_LABEL } from "@/constants/category";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { Place } from "@/types/place";

export type PlaceDetailSheetStubProps = {
  place: Place | null;
  onClose: () => void;
};

/**
 * 가게 상세 시트(S-05) 진입점 stub.
 *
 * 핀 탭·검색 결과 탭이 실제로 상세로 이어지는지 확인하기 위한 자리표시자다.
 * 크기별 상태·(?)·[리뷰 쓰기]·[저장] 등 실제 내용은 별도 이슈에서 구현한다.
 * (그때 @gorhom/bottom-sheet로 교체 예정 — 지금은 가벼운 Modal로 둔다.)
 */
export function PlaceDetailSheetStub({
  place,
  onClose,
}: PlaceDetailSheetStubProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={place != null}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[
            styles.sheet,
            { paddingBottom: insets.bottom + Spacing.four },
          ]}
          onPress={() => {}}
        >
          <View style={styles.handle} />

          {place ? (
            <>
              <ThemedText type="head03" color={Palette.gray[700]}>
                {place.name}
              </ThemedText>
              <ThemedText type="label04" color={Palette.gray[400]}>
                {CATEGORY_LABEL[place.category]} · {place.location}
              </ThemedText>

              <View style={styles.notice}>
                <ThemedText type="label05" color={Palette.gray[500]}>
                  가게 상세(크기별 상태 · 리뷰 · 저장)는 별도 이슈(S-05)에서
                  구현됩니다.
                </ThemedText>
              </View>
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  sheet: {
    gap: Spacing.two,
    paddingTop: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    backgroundColor: Palette.background.base,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Palette.border.default,
    marginBottom: Spacing.two,
  },
  notice: {
    marginTop: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: Palette.background.subtle,
  },
});
