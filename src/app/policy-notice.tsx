import { useState } from "react";

import { ChevronDown, ChevronUp } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ScreenHeader } from "@/components/ui/screen-header";
import {
  PRIVACY_POLICY_DIFF,
  PRIVACY_POLICY_NEXT,
  PRIVACY_POLICY_PREVIOUS_DATE,
  REVISION_EFFECTIVE_DATE,
  REVISION_NEXT_DATE,
  REVISION_NOTICE,
  REVISION_POSTED_DATE,
  type RevisionDiff,
  TERMS_OF_SERVICE_DIFF,
  TERMS_OF_SERVICE_NEXT,
  TERMS_OF_SERVICE_PREVIOUS_DATE,
} from "@/constants/policy-revision";
import { MaxContentWidth, Palette, Spacing } from "@/constants/theme";

type NoticeSection = "termsDiff" | "termsFull" | "privacyDiff" | "privacyFull";

type SectionContent =
  | { kind: "diff"; items: RevisionDiff[]; previousDate: string }
  | { kind: "full"; body: string };

const SECTIONS: {
  key: NoticeSection;
  label: string;
  content: SectionContent;
}[] = [
  {
    key: "termsDiff",
    label: "이용약관 변경 전후 비교 보기",
    content: {
      kind: "diff",
      items: TERMS_OF_SERVICE_DIFF,
      previousDate: TERMS_OF_SERVICE_PREVIOUS_DATE,
    },
  },
  {
    key: "termsFull",
    label: "이용약관 개정 전문 보기",
    content: { kind: "full", body: TERMS_OF_SERVICE_NEXT.body },
  },
  {
    key: "privacyDiff",
    label: "개인정보 처리방침 변경 전후 비교 보기",
    content: {
      kind: "diff",
      items: PRIVACY_POLICY_DIFF,
      previousDate: PRIVACY_POLICY_PREVIOUS_DATE,
    },
  },
  {
    key: "privacyFull",
    label: "개인정보 처리방침 개정 전문 보기",
    content: { kind: "full", body: PRIVACY_POLICY_NEXT.body },
  },
];

/**
 * 이용약관·개인정보 처리방침 개정 안내.
 * 로그인 전(로그인·회원가입)에서도 진입하므로 my/ 하위가 아닌 최상위 라우트에 둔다.
 */
export default function PolicyNoticeScreen() {
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState<Record<NoticeSection, boolean>>({
    termsDiff: false,
    termsFull: false,
    privacyDiff: false,
    privacyFull: false,
  });

  const toggle = (key: NoticeSection) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

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
            {REVISION_NOTICE.title}
          </ThemedText>
          <ThemedText type="label05" color={Palette.gray[500]}>
            시행일: {REVISION_EFFECTIVE_DATE}
            {"\n"}
            게시일: {REVISION_POSTED_DATE}
          </ThemedText>
        </View>

        <ThemedText type="label04" color={Palette.gray[600]}>
          {REVISION_NOTICE.body}
        </ThemedText>

        <View style={styles.sections}>
          {SECTIONS.map((section) => {
            const expanded = open[section.key];
            const Chevron = expanded ? ChevronUp : ChevronDown;
            const { content } = section;

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

                {expanded && content.kind === "diff" && (
                  <View style={styles.diffList}>
                    {content.items.map((item) => (
                      <View key={item.article} style={styles.diffItem}>
                        <ThemedText type="subtitle05" color={Palette.gray[700]}>
                          {item.article}
                        </ThemedText>
                        <View style={styles.diffRow}>
                          <ThemedText type="label06" color={Palette.gray[400]}>
                            개정 전 ({content.previousDate})
                          </ThemedText>
                          <ThemedText type="label04" color={Palette.gray[600]}>
                            {item.before}
                          </ThemedText>
                        </View>
                        <View style={styles.diffRow}>
                          <ThemedText type="label06" color={Palette.gray[400]}>
                            개정 후 ({REVISION_NEXT_DATE})
                          </ThemedText>
                          <ThemedText type="label04" color={Palette.gray[600]}>
                            {item.after}
                          </ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {expanded && content.kind === "full" && (
                  <ThemedText
                    type="label04"
                    color={Palette.gray[600]}
                    style={styles.fullText}
                  >
                    {content.body}
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
