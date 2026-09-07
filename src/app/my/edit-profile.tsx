import { useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  ScrollView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { z } from "zod";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { LoadingView } from "@/components/ui/loading-view";
import { ScreenHeader } from "@/components/ui/screen-header";
import { TextField } from "@/components/ui/text-field";
import {
  BottomTabInset,
  MaxContentWidth,
  Palette,
  Spacing,
} from "@/constants/theme";
import { useMyProfileQuery } from "@/hooks/use-my-profile-query";

// 비밀번호 3칸은 all-or-nothing — 하나라도 채우면 나머지도 검증한다(다 비면 비번 미변경).
// 새 비밀번호는 swagger 제약(8~64)에 맞추고, 확인 일치까지 본다.
const editProfileSchema = z
  .object({
    nickname: z
      .string()
      .trim()
      .min(2, "닉네임은 2~10자로 입력해주세요.")
      .max(10, "닉네임은 2~10자로 입력해주세요."),
    currentPassword: z.string(),
    newPassword: z.string(),
    newPasswordConfirm: z.string(),
  })
  .superRefine((values, ctx) => {
    const changingPassword = Boolean(
      values.currentPassword || values.newPassword || values.newPasswordConfirm,
    );
    if (!changingPassword) {
      return;
    }
    if (!values.currentPassword) {
      ctx.addIssue({
        code: "custom",
        path: ["currentPassword"],
        message: "현재 비밀번호를 입력해주세요.",
      });
    }
    if (values.newPassword.length < 8 || values.newPassword.length > 64) {
      ctx.addIssue({
        code: "custom",
        path: ["newPassword"],
        message: "비밀번호는 8~64자로 입력해주세요.",
      });
    }
    if (values.newPassword !== values.newPasswordConfirm) {
      ctx.addIssue({
        code: "custom",
        path: ["newPasswordConfirm"],
        message: "비밀번호가 일치하지 않아요.",
      });
    }
  });

type EditProfileForm = z.infer<typeof editProfileSchema>;

// 프로필 편집(닉네임·비밀번호) — 단일 화면에서 변경분만 골라 한 번의 PATCH로 보낸다(2단계 연동).
// 여기서는 현재 닉네임을 프리필하고, 로딩/에러는 마이 요약 쿼리에 맞춰 처리한다.
export default function EditProfileScreen() {
  const profileQuery = useMyProfileQuery();

  if (profileQuery.isLoading) {
    return (
      <View style={[styles.root, styles.loading]}>
        <ScreenHeader title="프로필 편집" />
        <LoadingView />
      </View>
    );
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <View style={styles.root}>
        <ScreenHeader title="프로필 편집" />
        <ErrorState
          message="프로필을 불러오지 못했어요"
          onRetry={() => profileQuery.refetch()}
          style={styles.errorState}
        />
      </View>
    );
  }

  // 닉네임 프리필을 위해 데이터가 준비된 뒤에만 폼을 마운트한다(defaultValues 확정).
  return <EditProfileFormView initialNickname={profileQuery.data.nickname} />;
}

function EditProfileFormView({ initialNickname }: { initialNickname: string }) {
  const router = useRouter();
  const currentPasswordRef = useRef<TextInput>(null);
  const newPasswordRef = useRef<TextInput>(null);
  const newPasswordConfirmRef = useRef<TextInput>(null);

  // 마지막으로 "사용 가능"을 확인한 닉네임. 입력을 바꾸면 재확인이 필요해진다.
  const [checkedNickname, setCheckedNickname] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    trigger,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<EditProfileForm>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      nickname: initialNickname,
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    },
    mode: "onTouched",
  });

  const nicknameValue = useWatch({ control, name: "nickname" }).trim();
  const currentPassword = useWatch({ control, name: "currentPassword" });
  const newPassword = useWatch({ control, name: "newPassword" });
  const newPasswordConfirm = useWatch({ control, name: "newPasswordConfirm" });

  // 닉네임을 안 바꿨으면 자기 자신이라 중복확인이 필요 없다 → 확인된 것으로 본다.
  const nicknameUnchanged = nicknameValue === initialNickname.trim();
  const nicknameChecked =
    nicknameUnchanged || checkedNickname === nicknameValue;

  const changingPassword = Boolean(
    currentPassword || newPassword || newPasswordConfirm,
  );
  const hasChanges = !nicknameUnchanged || changingPassword;

  // TODO(2단계): useCheckNicknameMutation 연동. 지금은 형식 검증만 통과하면
  // 확인됨으로 처리해 "사용 가능" 상태 UI를 눈으로 볼 수 있게 둔다(임시).
  const handleCheckNickname = async () => {
    if (!(await trigger("nickname"))) {
      return;
    }
    clearErrors("nickname");
    setCheckedNickname(nicknameValue);
  };

  // TODO(2단계): updateMyProfile(PATCH) 연동. 지금은 검증만 하고 토스트로 대체.
  const onSubmit = handleSubmit(async () => {
    if (!nicknameChecked || !hasChanges) {
      return;
    }
    ToastAndroid.show("(연동 예정) 저장", ToastAndroid.SHORT);
    router.back();
  });

  const canSubmit = isValid && nicknameChecked && hasChanges;

  return (
    <View style={styles.root}>
      <ScreenHeader title="프로필 편집" />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sectionHeading}>
          <ThemedText type="subtitle03" color={Palette.gray[700]}>
            닉네임 변경
          </ThemedText>
        </View>

        <Controller
          control={control}
          name="nickname"
          render={({ field: { onChange, onBlur, value } }) => (
            <View>
              <TextField
                label="닉네임"
                focusColor={Palette.border.default}
                placeholder="2~10자"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.nickname?.message}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                rightAccessory={
                  <Button
                    label="중복 확인"
                    variant="main"
                    onPress={handleCheckNickname}
                    disabled={nicknameUnchanged || nicknameChecked}
                    style={styles.checkButton}
                  />
                }
              />
              {nicknameChecked && !nicknameUnchanged && !errors.nickname ? (
                <ThemedText
                  type="label06"
                  color={Palette.success[300]}
                  style={styles.successText}
                >
                  사용 가능한 닉네임이에요.
                </ThemedText>
              ) : null}
            </View>
          )}
        />

        <View style={styles.divider} />

        <View style={styles.passwordSection}>
          <ThemedText type="subtitle03" color={Palette.gray[700]}>
            비밀번호 변경
          </ThemedText>
          <ThemedText type="label05" color={Palette.gray[400]}>
            바꾸지 않으려면 비워 두세요.
          </ThemedText>
        </View>

        <Controller
          control={control}
          name="currentPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              ref={currentPasswordRef}
              label="현재 비밀번호"
              focusColor={Palette.border.default}
              placeholder="현재 비밀번호"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.currentPassword?.message}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="current-password"
              returnKeyType="next"
              onSubmitEditing={() => newPasswordRef.current?.focus()}
              submitBehavior="submit"
            />
          )}
        />

        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              ref={newPasswordRef}
              label="새 비밀번호"
              focusColor={Palette.border.default}
              placeholder="8자 이상"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.newPassword?.message}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="next"
              onSubmitEditing={() => newPasswordConfirmRef.current?.focus()}
              submitBehavior="submit"
            />
          )}
        />

        <Controller
          control={control}
          name="newPasswordConfirm"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextField
              ref={newPasswordConfirmRef}
              label="새 비밀번호 확인"
              focusColor={Palette.border.default}
              placeholder="새 비밀번호 확인"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.newPasswordConfirm?.message}
              secureTextEntry
              autoCapitalize="none"
              autoComplete="new-password"
              returnKeyType="done"
              onSubmitEditing={onSubmit}
            />
          )}
        />

        <Button
          label="저장"
          onPress={onSubmit}
          disabled={!canSubmit}
          style={styles.submit}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  loading: {
    paddingBottom: BottomTabInset,
  },
  errorState: {
    flex: 1,
  },
  content: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.five,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  checkButton: {
    minHeight: 0,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  successText: {
    marginTop: Spacing.one,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border.disabled,
    marginVertical: Spacing.one,
  },
  sectionHeading: {
    marginBottom: Spacing.one,
  },
  passwordSection: {
    gap: Spacing.one,
  },
  submit: {
    marginTop: Spacing.two,
  },
});
