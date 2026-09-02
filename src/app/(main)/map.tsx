import { useMemo, useState } from "react";

import { useRouter } from "expo-router";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import PlaceMap from "@/components/map/place-map";
import { RecommendFab } from "@/components/map/recommend-fab";
import { SearchResultList } from "@/components/map/search-result-list";
import {
  SizeFilterDropdown,
  filterPlacesBySize,
  type SizeFilter,
} from "@/components/map/size-filter-dropdown";
import { SearchBar } from "@/components/ui/search-bar";
import { Palette, Radius, Spacing } from "@/constants/theme";
import { useStoreSearchQuery } from "@/hooks/use-store-search-query";
import { useStoresQuery } from "@/hooks/use-stores-query";
import type { Place } from "@/types/place";

// 핀 조회 중심점(서울숲) — place-map 초기 카메라와 맞춘다. 반경으로 핀 밀도 조절(MVP 고정).
const MAP_CENTER = { lat: 37.5445, lng: 127.0374 };
const MAP_RADIUS = 1000;

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");

  const keyword = query.trim();
  const isSearching = keyword.length > 0;

  const storesQuery = useStoresQuery({ ...MAP_CENTER, radius: MAP_RADIUS });
  const searchQuery = useStoreSearchQuery(query);

  // 크기 필터는 클라에서 건다(서버 size 미사용) — 필터 규칙은 filterPlacesBySize 한 곳.
  const pins = useMemo(
    () => filterPlacesBySize(storesQuery.data ?? [], sizeFilter),
    [storesQuery.data, sizeFilter],
  );

  const results = isSearching ? (searchQuery.data ?? []) : [];

  const selectPlace = (place: Place) => {
    Keyboard.dismiss();
    router.push({
      pathname: "/store/[placeId]",
      params: { placeId: place.id },
    });
  };

  const closeSearch = () => {
    setQuery("");
    Keyboard.dismiss();
  };

  return (
    <View style={styles.root}>
      <PlaceMap places={pins} onSelectPlace={selectPlace} />

      <View style={styles.overlay} pointerEvents="box-none">
        <View
          style={[
            styles.topBlock,
            { paddingTop: insets.top + Spacing.two },
            isSearching && styles.topBlockSearching,
          ]}
        >
          <View style={styles.controls} pointerEvents="box-none">
            <SearchBar
              value={query}
              onChangeText={setQuery}
              placeholder="가게명으로 검색"
              autoCorrect={false}
            />
            {!isSearching ? (
              <SizeFilterDropdown value={sizeFilter} onChange={setSizeFilter} />
            ) : null}
          </View>

          {isSearching ? (
            <View style={styles.searchArea}>
              <SearchResultList results={results} onSelectPlace={selectPlace} />
              <View style={styles.grabber} />
            </View>
          ) : null}
        </View>

        {isSearching ? (
          <Pressable style={styles.backdrop} onPress={closeSearch} />
        ) : (
          <View
            style={[styles.fabWrap, { paddingBottom: insets.bottom }]}
            pointerEvents="box-none"
          >
            <RecommendFab onPress={() => router.push("/recommend/keywords")} />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBlock: {
    paddingBottom: Spacing.two,
  },
  searchArea: {
    marginTop: 12,
    gap: Spacing.two,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    backgroundColor: Palette.border.default,
  },
  topBlockSearching: {
    backgroundColor: Palette.background.base,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border.disabled,
    borderBottomLeftRadius: Radius.medium,
    borderBottomRightRadius: Radius.medium,
  },
  controls: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.four,
  },
  backdrop: {
    flex: 1,
  },
  fabWrap: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.four,
  },
});
