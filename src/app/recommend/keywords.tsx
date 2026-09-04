import { useState, type ReactNode } from "react";

import { useRouter } from "expo-router";
import { HelpCircle } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StartPointField } from "@/components/recommend/start-point-field";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ScreenHeader } from "@/components/ui/screen-header";
import { SelectChip } from "@/components/ui/select-chip";
import {
  DURATION_LABEL,
  DURATION_ORDER,
  DURATION_POINT_HINT,
  PURPOSE_LABEL,
  PURPOSE_ORDER,
} from "@/constants/course";
import { HASHTAGS } from "@/constants/hashtags";
import { SIZE_LABEL } from "@/constants/status";
import { Palette, Radius, Spacing } from "@/constants/theme";
import type { CourseDuration, CoursePurpose, StartPoint } from "@/types/course";
import type { SizeKey } from "@/types/place";

const SIZE_ORDER: SizeKey[] = ["smallMedium", "large"];

const KEYWORD_HASHTAGS: readonly string[] = HASHTAGS;

const MAX_TAGS = 5;

export default function KeywordsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [start, setStart] = useState<StartPoint | null>(null);
  const [size, setSize] = useState<SizeKey | null>(null);
  const [purposes, setPurposes] = useState<CoursePurpose[]>([]);
  const [duration, setDuration] = useState<CourseDuration | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [hintOpen, setHintOpen] = useState(false);

  const togglePurpose = (value: CoursePurpose) =>
    setPurposes((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value],
    );

  const toggleTag = (value: string) =>
    setTags((prev) => {
      if (prev.includes(value)) {
        return prev.filter((item) => item !== value);
      }
      return prev.length >= MAX_TAGS ? prev : [...prev, value];
    });

  // 출발지·크기는 필수. 지정 전에는 [코스 만들기] 비활성(위치정보 미사용 규칙).
  const canSubmit = start !== null && size !== null;

  const submit = () => {
    if (!canSubmit || !start || !size) {
      return;
    }
    router.push({
      pathname: "/recommend/result",
      params: {
        size,
        purposes: purposes.join(","),
        ...(duration ? { duration } : {}),
        ...(tags.length > 0 ? { tags: tags.join(",") } : {}),
        startLat: String(start.latitude),
        startLng: String(start.longitude),
        startLabel: start.label,
      },
    });
  };

  return (
    <View style={styles.root}>
      <ScreenHeader />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Field title="출발 위치" required>
          <StartPointField
            value={start}
            onChange={setStart}
            onClear={() => setStart(null)}
          />
        </Field>

        <Field title="크기" required>
          <View style={styles.chipRow}>
            {SIZE_ORDER.map((value) => (
              <SelectChip
                key={value}
                label={SIZE_LABEL[value]}
                selected={size === value}
                onPress={() => setSize(value)}
              />
            ))}
          </View>
        </Field>

        <Field title="목적" caption="복수 선택">
          <View style={styles.chipRow}>
            {PURPOSE_ORDER.map((value) => (
              <SelectChip
                key={value}
                label={PURPOSE_LABEL[value]}
                selected={purposes.includes(value)}
                onPress={() => togglePurpose(value)}
              />
            ))}
          </View>
        </Field>

        <Field
          title="시간"
          trailing={
            <Pressable
              onPress={() => setHintOpen((prev) => !prev)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="시간별 추천 지점 수 보기"
            >
              <HelpCircle size={16} color={Palette.gray[400]} />
            </Pressable>
          }
        >
          <View style={styles.chipRow}>
            {DURATION_ORDER.map((value) => (
              <SelectChip
                key={value}
                label={DURATION_LABEL[value]}
                selected={duration === value}
                onPress={() => setDuration(value)}
              />
            ))}
          </View>

          {hintOpen ? (
            <View style={styles.hintCard}>
              <ThemedText type="subtitle05" color={Palette.gray[600]}>
                {DURATION_ORDER.map((value, index) => (
                  <ThemedText
                    key={value}
                    type="subtitle05"
                    color={Palette.gray[600]}
                  >
                    {index > 0 ? " · " : ""}
                    {`${DURATION_LABEL[value]}: `}
                    {renderWithMainNumbers(DURATION_POINT_HINT[value])}
                  </ThemedText>
                ))}
              </ThemedText>

              <ThemedText type="label06" color={Palette.gray[500]}>
                시간에 따라 추천 장소의 개수가 달라져요
              </ThemedText>
            </View>
          ) : null}
        </Field>

        <Field
          title="해시태그"
          caption={`복수 선택 · 최대 ${MAX_TAGS}개까지 선택 가능해요`}
        >
          <View style={styles.chipWrap}>
            {KEYWORD_HASHTAGS.map((tag) => {
              const selected = tags.includes(tag);
              const blocked = !selected && tags.length >= MAX_TAGS;
              return (
                <SelectChip
                  key={tag}
                  label={`#${tag}`}
                  selected={selected}
                  onPress={() => toggleTag(tag)}
                  disabled={blocked}
                />
              );
            })}
          </View>
        </Field>
      </ScrollView>

      <View
        style={[styles.footer, { paddingBottom: insets.bottom + Spacing.two }]}
      >
        <Button
          label="맞춤 코스 추천받기"
          variant="main"
          disabled={!canSubmit}
          onPress={submit}
        />
      </View>
    </View>
  );
}

/** 문자열에서 숫자(및 3~4 같은 범위)만 메인 색으로 강조해 렌더한다. */
function renderWithMainNumbers(text: string): ReactNode[] {
  return text.split(/(\d[\d~]*)/).map((part, index) =>
    /\d/.test(part) ? (
      <ThemedText key={index} type="subtitle05" color={Palette.main[500]}>
        {part}
      </ThemedText>
    ) : (
      part
    ),
  );
}

function Field({
  title,
  required,
  caption,
  trailing,
  children,
}: {
  title: string;
  required?: boolean;
  caption?: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      <View style={styles.fieldHeader}>
        <ThemedText type="subtitle03" color={Palette.gray[700]}>
          {title}
          {required ? (
            <ThemedText type="subtitle03" color={Palette.main[500]}>
              {" *"}
            </ThemedText>
          ) : null}
        </ThemedText>
        {caption ? (
          <ThemedText type="label05" color={Palette.gray[400]}>
            {caption}
          </ThemedText>
        ) : null}
        {trailing}
      </View>
      {children}
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
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  field: {
    gap: Spacing.three,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: Spacing.two,
  },
  hintCard: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.medium,
    backgroundColor: "rgba(255, 154, 134, 0.06)",
    borderWidth: 1,
    borderColor: "rgba(255, 154, 134, 0.40)",
  },
  footer: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    borderTopWidth: 1,
    borderTopColor: Palette.border.disabled,
    backgroundColor: Palette.background.base,
  },
});
