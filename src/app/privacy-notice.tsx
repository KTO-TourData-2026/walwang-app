import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  PRIVACY_POLICY_NEXT,
  PRIVACY_REVISION_DIFF,
  PRIVACY_REVISION_EFFECTIVE_DATE,
  PRIVACY_REVISION_NOTICE,
  PRIVACY_REVISION_POSTED_DATE,
} from "@/constants/privacy-policy-revision";
import { MaxContentWidth, Palette, Spacing } from "@/constants/theme";

type NoticeSection = "diff" | "full";

/**
 * 개인정보 처리방침 개정 안내.
 * 로그인 전(로그인·회원가입)에서도 진입하므로 my/ 하위가 아닌 최상위 라우트에 둔다.
 */
export default function PrivacyNoticeScreen() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<Record<NoticeSection, boolean>>({
    diff: false,
    full: false,
  });

  const toggle = (key: NoticeSection) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  const sections: { key: NoticeSection; label: string }[] = [
    { key: "diff", label: "변경 전후 비교 보기" },
    { key: "full", label: "개정 전문 보기" },
  ];

  return (
    <View style={styles.root}>
      <ScreenHeader />

      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + Spacing.four },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heading}>
          <ThemedText type="subtitle02" color={Palette.gray[700]}>
            {PRIVACY_REVISION_NOTICE.title}
          </ThemedText>
          <ThemedText type="label05" color={Palette.gray[500]}>
            시행일: {PRIVACY_REVISION_EFFECTIVE_DATE}
            {"\n"}
            게시일: {PRIVACY_REVISION_POSTED_DATE}
          </ThemedText>
        </View>

        <ThemedText type="label04" color={Palette.gray[600]}>
          {PRIVACY_REVISION_NOTICE.body}
        </ThemedText>

        <View style={styles.sections}>
          {sections.map((section) => {
            const expanded = open[section.key];
            const Chevron = expanded ? ChevronUp : ChevronDown;

            return (
              <View key={section.key} style={styles.section}>
                <Pressable
                  onPress={() => toggle(section.key)}
                  accessibilityRole="button"
                  accessibilityLabel={section.label}
                  accessibilityState={{ expanded }}
                  style={({ pressed }) => [
                    styles.row,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <ThemedText type="subtitle05" color={Palette.gray[700]}>
                    {section.label}
                  </ThemedText>
                  <Chevron
                    size={18}
                    color={Palette.gray[400]}
                    strokeWidth={2}
                  />
                </Pressable>

                {expanded && section.key === "diff" && (
                  <View style={styles.diffList}>
                    {PRIVACY_REVISION_DIFF.map((item) => (
                      <View key={item.article} style={styles.diffItem}>
                        <ThemedText type="subtitle05" color={Palette.gray[700]}>
                          {item.article}
                        </ThemedText>
                        <View style={styles.diffRow}>
                          <ThemedText type="label06" color={Palette.gray[400]}>
                            개정 전 (2026-09-13)
                          </ThemedText>
                          <ThemedText type="label04" color={Palette.gray[600]}>
                            {item.before}
                          </ThemedText>
                        </View>
                        <View style={styles.diffRow}>
                          <ThemedText type="label06" color={Palette.gray[400]}>
                            개정 후 (2026-11-02)
                          </ThemedText>
                          <ThemedText type="label04" color={Palette.gray[600]}>
                            {item.after}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {expanded && section.key === "full" && (
                  <ThemedText
                    type="label04"
                    color={Palette.gray[600]}
                    style={styles.fullText}
                  >
                    {PRIVACY_POLICY_NEXT.body}
                  </ThemedText>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  heading: {
    gap: Spacing.two,
  },
  sections: {
    borderTopWidth: 1,
    borderTopColor: Palette.border.disabled,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border.disabled,
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
  diffList: {
    gap: Spacing.four,
    paddingBottom: Spacing.four,
  },
  fullText: {
    paddingBottom: Spacing.three,
  },
  diffItem: {
    gap: Spacing.two,
  },
  diffRow: {
    gap: Spacing.half,
  },
});
