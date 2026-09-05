import { useRef, useState } from "react";

import { ChevronLeft, ChevronRight, Dog } from "lucide-react-native";
import {
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { PassportSummary } from "@/types/user";

import { PassportBook, WINDOWS } from "./passport-book";
import { slotsFor, STAMPS_PER_PAGE, stampJitter } from "./passport-slots";
import { PassportStampView } from "./passport-stamp";

/** 스파인 쪽을 제외한 3면 안쪽 패딩(px). */
const PAD = 12;

function chunk(stamps: PassportSummary[]): PassportSummary[][] {
  const pages: PassportSummary[][] = [];
  for (let i = 0; i < stamps.length; i += STAMPS_PER_PAGE) {
    pages.push(stamps.slice(i, i + STAMPS_PER_PAGE));
  }
  return pages;
}

export function Passport({
  stamps,
  onSelectStamp,
}: {
  stamps: PassportSummary[];
  onSelectStamp: (stamp: PassportSummary) => void;
}) {
  const scrollRef = useRef<ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [page, setPage] = useState(0);

  // 책은 바깥/위/아래 3면에만 PAD만큼 줄이고, 스파인 쪽은 프레임에 붙인다.
  const bookW = width > 0 ? width - PAD : 0;
  const bookScale = bookW / WINDOWS.left.w;
  const bookH = Math.round(WINDOWS.left.h * bookScale);
  const boardHeight = bookH + PAD * 2;
  // 위(첫 슬롯)부터 아래로 누적되도록 생성일 오름차순(오래된 것 먼저)으로 정렬한 뒤 채운다.
  const ordered = [...stamps].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt),
  );
  const pages = chunk(ordered);

  const onLayout = (event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  };

  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (width > 0) {
      setPage(Math.round(event.nativeEvent.contentOffset.x / width));
    }
  };

  const goToPage = (next: number) => {
    const clamped = Math.max(0, Math.min(pages.length - 1, next));
    setPage(clamped);
    scrollRef.current?.scrollTo({ x: clamped * width, animated: true });
  };

  const isEmpty = stamps.length === 0;

  const renderPage = (
    pageStamps: PassportSummary[],
    side: "left" | "right",
  ) => {
    const win = WINDOWS[side];
    const slots = slotsFor(side);
    // 왼쪽 페이지: 스파인이 오른쪽 → 왼쪽에 PAD, 오른쪽 flush. 오른쪽 페이지는 반대.
    const bookLeft = side === "left" ? PAD : 0;
    return (
      <View
        style={{
          position: "absolute",
          left: bookLeft,
          top: PAD,
          width: bookW,
          height: bookH,
        }}
      >
        <PassportBook width={bookW} height={bookH} side={side} />
        {pageStamps.map((stamp, index) => {
          const slot = slots[index];
          const { size, angle } = stampJitter(stamp.id);
          const px = size * bookScale;
          return (
            <View
              key={stamp.id}
              style={{
                position: "absolute",
                left: (slot.x - win.x) * bookScale - px / 2,
                top: (slot.y - win.y) * bookScale - px / 2,
              }}
            >
              <PassportStampView
                stamp={stamp}
                size={px}
                angle={angle}
                onPress={onSelectStamp}
              />
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.frame} onLayout={onLayout}>
        {width === 0 ? (
          <View style={{ height: 260 }} />
        ) : isEmpty ? (
          <View style={{ width, height: boardHeight }}>
            {renderPage([], "left")}
            <View style={styles.emptyOverlay} pointerEvents="none">
              <Dog size={28} color={Palette.gray[300]} />
              <ThemedText type="label04" color={Palette.gray[400]}>
                아직 모은 도장이 없어요
              </ThemedText>
            </View>
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onScrollEnd}
          >
            {pages.map((pageStamps, pageIndex) => (
              <View key={pageIndex} style={{ width, height: boardHeight }}>
                {renderPage(pageStamps, pageIndex % 2 === 0 ? "left" : "right")}
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {!isEmpty && pages.length > 1 ? (
        <View style={styles.nav}>
          <NavArrow
            Icon={ChevronLeft}
            disabled={page === 0}
            onPress={() => goToPage(page - 1)}
            label="이전 페이지"
          />
          <ThemedText type="subtitle05" color={Palette.gray[500]}>
            {page + 1} / {pages.length}
          </ThemedText>
          <NavArrow
            Icon={ChevronRight}
            disabled={page === pages.length - 1}
            onPress={() => goToPage(page + 1)}
            label="다음 페이지"
          />
        </View>
      ) : null}
    </View>
  );
}

function NavArrow({
  Icon,
  disabled,
  onPress,
  label,
}: {
  Icon: typeof ChevronLeft;
  disabled: boolean;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        styles.arrow,
        pressed && !disabled && styles.arrowPressed,
      ]}
    >
      <Icon
        size={20}
        color={disabled ? Palette.gray[300] : Palette.gray[600]}
        strokeWidth={2.2}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.three,
  },
  frame: {
    borderRadius: Radius.large,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    backgroundColor: Palette.background.base,
    overflow: "hidden",
  },
  emptyOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.two,
  },
  nav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
  },
  arrow: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: Palette.gray[100],
  },
  arrowPressed: {
    backgroundColor: Palette.gray[200],
  },
});
