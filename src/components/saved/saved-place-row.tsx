import { useRef } from "react";

import { MoreVertical } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { CATEGORY_LABEL } from "@/constants/category";
import { STATUS_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { Place, PlaceStatus } from "@/types/place";

export type MenuAnchor = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const statusColor = (status: PlaceStatus) => Palette.status[status][300];

export function SavedPlaceRow({
  place,
  onPress,
  onMenu,
}: {
  place: Place;
  onPress: (place: Place) => void;
  onMenu: (place: Place, anchor: MenuAnchor) => void;
}) {
  const menuRef = useRef<View>(null);

  const openMenu = () => {
    menuRef.current?.measureInWindow((x, y, width, height) =>
      onMenu(place, { x, y, width, height }),
    );
  };

  return (
    <Pressable
      onPress={() => onPress(place)}
      onLongPress={openMenu}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.body}>
        <ThemedText type="subtitle03" color={Palette.gray[700]}>
          {place.name}
        </ThemedText>
        <ThemedText type="label05" color={Palette.gray[400]}>
          {CATEGORY_LABEL[place.category]} · {place.location}
        </ThemedText>

        <View style={styles.statusLine}>
          <ThemedText type="label05" color={Palette.gray[500]}>
            소·중형{" "}
            <ThemedText
              type="label05"
              color={statusColor(place.sizeStatus.smallMedium)}
            >
              {STATUS_LABEL[place.sizeStatus.smallMedium]}
            </ThemedText>
            {"   ·   "}
            대형{" "}
            <ThemedText
              type="label05"
              color={statusColor(place.sizeStatus.large)}
            >
              {STATUS_LABEL[place.sizeStatus.large]}
            </ThemedText>
          </ThemedText>
        </View>
      </View>

      <Pressable
        ref={menuRef}
        onPress={openMenu}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`${place.name} 더보기`}
        style={styles.menuButton}
      >
        <MoreVertical size={20} color={Palette.gray[300]} strokeWidth={1.75} />
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Radius.medium,
    borderWidth: 1,
    borderColor: Palette.border.disabled,
    backgroundColor: Palette.background.base,
  },
  pressed: {
    backgroundColor: Palette.background.subtle,
  },
  body: {
    flex: 1,
    gap: 6,
  },
  statusLine: {
    marginTop: Spacing.half,
  },
  menuButton: {
    marginTop: -Spacing.one,
    marginRight: -Spacing.two,
    padding: Spacing.one,
  },
});
