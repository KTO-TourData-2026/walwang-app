import { useState } from "react";

import { ChevronRight } from "lucide-react-native";
import { FlatList, Pressable, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TermsModal } from "@/components/ui/terms-modal";
import {
  OSS_LICENSES,
  type OssLicense,
} from "@/constants/oss-licenses.generated";
import { MaxContentWidth, Palette, Spacing } from "@/constants/theme";

/**
 * 오픈소스 라이선스 고지(마이 > 오픈소스 라이선스).
 *
 * 목록은 scripts/generate-licenses.mjs 가 자동 생성한 데이터를 그대로 렌더한다.
 * 항목을 탭하면 라이선스 전문을 기존 TermsModal로 띄운다.
 * 지도 SDK(네이버) 자체의 법적 공지·라이선스는 지도 내 로고 탭으로 접근하므로 안내만 둔다.
 */
export default function LicensesScreen() {
  const [selected, setSelected] = useState<OssLicense | null>(null);

  const modalBody = selected
    ? (selected.licenseText ??
      `${selected.name} ${selected.version}\n\n라이선스: ${selected.license}\n\n` +
        "이 패키지에는 라이선스 전문 파일이 포함되어 있지 않습니다. " +
        "라이선스 종류는 위와 같습니다.")
    : "";

  return (
    <View style={styles.root}>
      <ScreenHeader title="오픈소스 라이선스" />

      <FlatList
        data={OSS_LICENSES}
        keyExtractor={(item) => item.name}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.notice}>
            <ThemedText type="label05" color={Palette.gray[500]}>
              이 앱은 아래 오픈소스 소프트웨어를 사용합니다. 지도는 네이버 지도
              SDK를 사용하며, 지도 화면에서 네이버 로고를 탭하면 지도 SDK의 법적
              공지와 오픈소스 라이선스를 확인할 수 있습니다.
            </ThemedText>
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelected(item)}
            accessibilityRole="button"
            accessibilityLabel={`${item.name} 라이선스 보기`}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          >
            <View style={styles.rowText}>
              <ThemedText type="subtitle05" color={Palette.gray[700]}>
                {item.name}
              </ThemedText>
              <ThemedText type="label06" color={Palette.gray[400]}>
                {item.version} · {item.license}
              </ThemedText>
            </View>
            <ChevronRight size={18} color={Palette.gray[400]} strokeWidth={2} />
          </Pressable>
        )}
      />

      <TermsModal
        visible={selected !== null}
        title={selected ? `${selected.name} ${selected.version}` : ""}
        body={modalBody}
        onClose={() => setSelected(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  notice: {
    paddingVertical: Spacing.four,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  rowPressed: {
    opacity: 0.6,
  },
  rowText: {
    flex: 1,
    gap: Spacing.half,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border.disabled,
  },
});
