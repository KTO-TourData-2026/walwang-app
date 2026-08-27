import { useMemo, useState } from "react";

import { useRouter } from "expo-router";
import { Keyboard, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PlaceDetailSheetStub } from "@/components/map/place-detail-sheet-stub";
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
import { MOCK_PLACES, MOCK_PLACE_KEYWORDS } from "@/mocks/places";
import type { Place } from "@/types/place";

export default function MapScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [query, setQuery] = useState("");
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>("all");
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  const keyword = query.trim();
  const isSearching = keyword.length > 0;

  const pins = useMemo(
    () => filterPlacesBySize(MOCK_PLACES, sizeFilter),
    [sizeFilter],
  );

  const results = useMemo(() => {
    if (!isSearching) {
      return [];
    }
    const lowered = keyword.toLowerCase();
    return MOCK_PLACES.filter(
      (place) =>
        place.name.toLowerCase().includes(lowered) ||
        // [DEV] 한글 자판 없이 영어로도 검색되게 하는 임시 매칭
        (MOCK_PLACE_KEYWORDS[place.id] ?? "").includes(lowered),
    );
  }, [isSearching, keyword]);

  const selectPlace = (place: Place) => {
    Keyboard.dismiss();
    setSelectedPlace(place);
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

      <PlaceDetailSheetStub
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
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
