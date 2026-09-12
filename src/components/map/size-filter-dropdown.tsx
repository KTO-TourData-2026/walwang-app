import { useRef, useState } from "react";

import { Check, ChevronDown } from "lucide-react-native";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  type LayoutRectangle,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { Place, SizeKey } from "@/types/place";

/**
 * 지도 크기 필터의 값.
 *
 * UI 필터 개념이라 백엔드 스펙(types/place.ts)이 아닌 여기서 소유한다.
 * - all: 기본값(전체). 미확인·불가 포함 전부 표시
 * - smallMedium / large: 해당 크기 관점으로 좁힘
 */
export type SizeFilter = "all" | "smallMedium" | "large";

const OPTIONS: { value: SizeFilter; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "smallMedium", label: "소·중형견" },
  { value: "large", label: "대형견" },
];

const TRIGGER_LABEL: Record<SizeFilter, string> = {
  all: "전체",
  smallMedium: "소·중형견",
  large: "대형견",
};

const MENU_WIDTH = 132;

const SIZE_KEY: Partial<Record<SizeFilter, SizeKey>> = {
  smallMedium: "smallMedium",
  large: "large",
};

/**
 * 크기 필터로 지도에 표시할 장소를 거른다.
 *
 * 전체는 전부 표시(미확인·불가 포함). 특정 크기를 고르면 그 크기가
 * 확정 `불가`인 곳만 숨긴다(미확인은 리뷰 축적 대상이라 남긴다).
 * 정확한 규칙은 제품 확정 후 조정 — 필터 로직은 이 함수 한 곳만 고치면 된다.
 */
export function filterPlacesBySize(
  places: Place[],
  filter: SizeFilter,
): Place[] {
  const key = SIZE_KEY[filter];
  if (!key) {
    return places;
  }
  return places.filter((place) => place.sizeStatus[key] !== "denied");
}

export type SizeFilterDropdownProps = {
  value: SizeFilter;
  onChange: (next: SizeFilter) => void;
};

export function SizeFilterDropdown({
  value,
  onChange,
}: SizeFilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState<LayoutRectangle | null>(null);
  const triggerRef = useRef<View>(null);

  const openMenu = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const select = (next: SizeFilter) => {
    onChange(next);
    setOpen(false);
  };

  return (
    <>
      <Pressable
        ref={triggerRef}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel={`크기 필터, 현재 ${TRIGGER_LABEL[value]}`}
        style={styles.trigger}
      >
        <ThemedText type="subtitle04" color={Palette.gray[600]}>
          {TRIGGER_LABEL[value]}
        </ThemedText>
        <ChevronDown size={16} color={Palette.gray[500]} strokeWidth={2} />
      </Pressable>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {anchor ? (
            <View
              style={[
                styles.menu,
                { top: anchor.y + anchor.height + Spacing.one, left: anchor.x },
              ]}
            >
              {OPTIONS.map((option) => {
                const selected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => select(option.value)}
                    accessibilityRole="menuitem"
                    accessibilityState={{ selected }}
                    style={({ pressed }) => [
                      styles.item,
                      pressed && styles.itemPressed,
                    ]}
                  >
                    <ThemedText
                      type={selected ? "subtitle04" : "label04"}
                      color={selected ? Palette.gray[700] : Palette.gray[500]}
                    >
                      {option.label}
                    </ThemedText>
                    {selected ? (
                      <Check
                        size={18}
                        color={Palette.main[500]}
                        strokeWidth={2.4}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          ) : null}
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    alignSelf: "flex-start",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Palette.border.default,
    backgroundColor: Palette.white,
  },
  backdrop: {
    flex: 1,
  },
  menu: {
    position: "absolute",
    width: MENU_WIDTH,
    borderRadius: Radius.medium,
    overflow: "hidden",
    backgroundColor: Palette.white,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  itemPressed: {
    backgroundColor: Palette.background.subtle,
  },
});
