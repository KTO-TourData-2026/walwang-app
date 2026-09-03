import { type LucideIcon } from "lucide-react-native";
import { Dimensions, Modal, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";

/** 앵커 버튼의 화면 좌표(measureInWindow 결과). 팝오버 위치 계산에 쓴다. */
export type MenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type PopoverMenuItem = {
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  /** 삭제·신고 같은 위험 액션은 강조색으로. */
  destructive?: boolean;
};

const SCREEN_WIDTH = Dimensions.get("window").width;
const SCREEN_HEIGHT = Dimensions.get("window").height;
const ITEM_HEIGHT = 44; // 팝오버 항목 1개의 대략 높이(px)

// 앵커 기준 메뉴 위치. 아래 공간이 부족하면 앵커 위로 뒤집는다.
function getMenuPosition(anchor: MenuAnchor, itemCount: number) {
  const height = itemCount * ITEM_HEIGHT;
  const below = anchor.y + anchor.height + Spacing.one;
  const openUpward = below + height > SCREEN_HEIGHT - Spacing.two;
  return {
    top: openUpward
      ? Math.max(Spacing.two, anchor.y - height - Spacing.one)
      : below,
    right: Math.max(Spacing.two, SCREEN_WIDTH - (anchor.x + anchor.width)),
  };
}

/**
 * ⋯ 버튼 앵커에 붙는 공용 팝오버 메뉴(저장·마이리뷰 공용).
 * anchor가 있으면 열리고, 배경/항목 탭 시 onClose를 부른다.
 */
export function PopoverMenu({
  anchor,
  items,
  onClose,
}: {
  anchor: MenuAnchor | null;
  items: PopoverMenuItem[];
  onClose: () => void;
}) {
  return (
    <Modal
      visible={anchor !== null}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        {anchor ? (
          <View style={[styles.menu, getMenuPosition(anchor, items.length)]}>
            {items.map((item) => {
              const color = item.destructive
                ? Palette.error[300]
                : Palette.gray[700];
              return (
                <Pressable
                  key={item.label}
                  style={({ pressed }) => [
                    styles.item,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={item.onPress}
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                >
                  <item.Icon size={16} color={color} />
                  <ThemedText type="subtitle04" color={color}>
                    {item.label}
                  </ThemedText>
                </Pressable>
              );
            })}
          </View>
        ) : null}
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    alignSelf: "flex-start",
    borderRadius: Radius.medium,
    backgroundColor: Palette.background.base,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: Radius.medium,
  },
  itemPressed: {
    backgroundColor: Palette.background.subtle,
  },
});
