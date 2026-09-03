import { useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { Controller, useForm, useWatch } from "react-hook-form";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  ToastAndroid,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { ApiHttpError } from "@/api/http-error";
import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TermsModal } from "@/components/ui/terms-modal";
import { TextField } from "@/components/ui/text-field";
import { TERMS, type TermContentCode } from "@/constants/terms";
import { MaxContentWidth, Palette, Radius, Spacing } from "@/constants/theme";
import { useCheckEmailMutation } from "@/hooks/use-check-email-mutation";
import { useCheckNicknameMutation } from "@/hooks/use-check-nickname-mutation";
import { useSignupMutation } from "@/hooks/use-signup-mutation";

const AGREEMENTS = [
  { code: "TERMS_OF_SERVICE", label: "(필수) 이용약관 동의", more: true },
  { code: "PRIVACY", label: "(필수) 개인정보 수집·이용 동의", more: true },
  { code: "AGE_14", label: "(필수) 만 14세 이상입니다", more: false },
] as const;

type AgreementCode = (typeof AGREEMENTS)[number]["code"];

const signupSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, "이메일을 입력해주세요.")
      .pipe(z.email("이메일 형식이 올바르지 않아요.")),
    nickname: z
      .string()
      .trim()
      .min(2, "닉네임은 2~10자로 입력해주세요.")
      .max(10, "닉네임은 2~10자로 입력해주세요."),
    password: z.string().min(8, "비밀번호는 8자 이상이어야 해요."),
    passwordConfirm: z.string().min(1, "비밀번호를 한 번 더 입력해주세요."),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않아요.",
  });

type SignupForm = z.infer<typeof signupSchema>;

const LOGO = require("@/assets/images/logo.png");

function errorMessage(error: unknown): string {
  return error instanceof ApiHttpError
    ? error.message
    : "네트워크 상태를 확인한 뒤 다시 시도해주세요.";
}

export default function SignupScreen() {
  const router = useRouter();
  const nicknameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const passwordConfirmRef = useRef<TextInput>(null);

  const [agreements, setAgreements] = useState<Record<AgreementCode, boolean>>({
    TERMS_OF_SERVICE: false,
    PRIVACY: false,
    AGE_14: false,
  });

  // 전문 보기 모달에 띄울 약관 코드(없으면 닫힘).
  const [termModal, setTermModal] = useState<TermContentCode | null>(null);

  // 마지막으로 "사용 가능"을 확인한 값. 입력을 바꾸면 현재 값과 달라져 재확인이 필요해진다.
  const [checkedEmail, setCheckedEmail] = useState<string | null>(null);
  const [checkedNickname, setCheckedNickname] = useState<string | null>(null);

  const checkEmailMutation = useCheckEmailMutation();
  const checkNicknameMutation = useCheckNicknameMutation();
  const signupMutation = useSignupMutation();

  const {
    control,
    handleSubmit,
    trigger,
    setError,
    clearErrors,
    formState: { errors, isValid },
  } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      nickname: "",
      password: "",
      passwordConfirm: "",
    },
    mode: "onTouched",
  });

  // useWatch는 watch()와 달리 메모이제이션에 안전(React Compiler 경고 없음).
  const emailValue = useWatch({ control, name: "email" }).trim();
  const nicknameValue = useWatch({ control, name: "nickname" }).trim();
  const emailChecked = checkedEmail !== null && checkedEmail === emailValue;
  const nicknameChecked =
    checkedNickname !== null && checkedNickname === nicknameValue;

  // [중복 확인] 이메일: 형식 검증 통과 후 조회. 409면 인라인 에러, 200이면 확인 상태로.
  const handleCheckEmail = async () => {
    if (!(await trigger("email"))) {
      return;
    }
    try {
      const available = await checkEmailMutation.mutateAsync(emailValue);
      if (available) {
        clearErrors("email");
        setCheckedEmail(emailValue);
      } else {
        setError("email", { message: "이미 사용 중인 이메일이에요." });
        setCheckedEmail(null);
      }
    } catch (error) {
      Alert.alert("확인 실패", errorMessage(error));
    }
  };

  const handleCheckNickname = async () => {
    if (!(await trigger("nickname"))) {
      return;
    }
    try {
      const available = await checkNicknameMutation.mutateAsync(nicknameValue);
      if (available) {
        clearErrors("nickname");
        setCheckedNickname(nicknameValue);
      } else {
        setError("nickname", { message: "이미 사용 중인 닉네임이에요." });
        setCheckedNickname(null);
      }
    } catch (error) {
      Alert.alert("확인 실패", errorMessage(error));
    }
  };

  const allAgreed = Object.values(agreements).every(Boolean);

  // 가입 → 자동 로그인 → 지도. 가입 직전 사이에 선점되면 409 → 이메일 재확인 유도.
  const onSubmit = handleSubmit(async (values) => {
    // 키보드 '완료'는 버튼 disabled를 거치지 않으므로, 약관·중복확인·진행중 상태를 여기서 재확인한다.
    if (!allAgreed || !emailChecked || !nicknameChecked) {
      return;
    }
    if (signupMutation.isPending) {
      return;
    }
    try {
      await signupMutation.mutateAsync({
        email: values.email,
        nickname: values.nickname,
        password: values.password,
        agreements: AGREEMENTS.map((item) => ({
          termCode: item.code,
          agreed: agreements[item.code],
        })),
      });
      ToastAndroid.show("회원가입이 완료됐어요!", ToastAndroid.SHORT);
      router.replace("/map");
    } catch (error) {
      if (error instanceof ApiHttpError && error.status === 409) {
        setError("email", { message: "이미 사용 중인 이메일이에요." });
        setCheckedEmail(null);
        return;
      }
      Alert.alert("회원가입 실패", errorMessage(error));
    }
  });

  const canSubmit = isValid && allAgreed && emailChecked && nicknameChecked;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image source={LOGO} style={styles.logo} contentFit="cover" />
          <ThemedText type="head03">회원가입</ThemedText>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextField
                  label="이메일"
                  focusColor={Palette.border.default}
                  placeholder="name@email.com"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  keyboardType="email-address"
                  returnKeyType="next"
                  onSubmitEditing={() => nicknameRef.current?.focus()}
                  submitBehavior="submit"
                  rightAccessory={
                    <Button
                      label="중복 확인"
                      variant="main"
                      onPress={handleCheckEmail}
                      loading={checkEmailMutation.isPending}
                      disabled={emailChecked}
                      style={styles.checkButton}
                    />
                  }
                />
                {emailChecked && !errors.email ? (
                  <ThemedText
                    type="label06"
                    color={Palette.success[300]}
                    style={styles.successText}
                  >
                    사용 가능한 이메일이에요.
                  </ThemedText>
                ) : null}
              </View>
            )}
          />

          <Controller
            control={control}
            name="nickname"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <TextField
                  ref={nicknameRef}
                  label="닉네임"
                  focusColor={Palette.border.default}
                  placeholder="2~10자"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.nickname?.message}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  submitBehavior="submit"
                  rightAccessory={
                    <Button
                      label="중복 확인"
                      variant="main"
                      onPress={handleCheckNickname}
                      loading={checkNicknameMutation.isPending}
                      disabled={nicknameChecked}
                      style={styles.checkButton}
                    />
                  }
                />
                {nicknameChecked && !errors.nickname ? (
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

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                ref={passwordRef}
                label="비밀번호"
                focusColor={Palette.border.default}
                placeholder="8자 이상"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                returnKeyType="next"
                onSubmitEditing={() => passwordConfirmRef.current?.focus()}
                submitBehavior="submit"
              />
            )}
          />

          <Controller
            control={control}
            name="passwordConfirm"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                ref={passwordConfirmRef}
                label="비밀번호 확인"
                focusColor={Palette.border.default}
                placeholder="비밀번호 확인"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.passwordConfirm?.message}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="new-password"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
            )}
          />
        </View>

        <View style={styles.agreements}>
          {AGREEMENTS.map((item) => (
            <View key={item.code} style={styles.agreementRow}>
              <Checkbox
                label={item.label}
                checked={agreements[item.code]}
                onChange={(next) =>
                  setAgreements((prev) => ({ ...prev, [item.code]: next }))
                }
                style={styles.agreementCheckbox}
              />
              {item.more ? (
                <Pressable
                  onPress={() => setTermModal(item.code as TermContentCode)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.label} 전문 보기`}
                >
                  <ThemedText type="label05" color={Palette.gray[500]}>
                    상세보기 ›
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>

        <Button
          label="가입하기"
          onPress={onSubmit}
          loading={signupMutation.isPending}
          disabled={!canSubmit}
        />

        <View style={styles.loginRow}>
          <ThemedText type="label04" color={Palette.gray[500]}>
            이미 계정이 있으신가요?
          </ThemedText>
          <Link href="/login" asChild>
            <ThemedText
              type="label03"
              color={Palette.main[500]}
              style={styles.loginLink}
            >
              로그인
            </ThemedText>
          </Link>
        </View>
      </ScrollView>

      <TermsModal
        visible={termModal !== null}
        title={termModal ? TERMS[termModal].title : ""}
        body={termModal ? TERMS[termModal].body : ""}
        onClose={() => setTermModal(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Palette.background.base,
  },
  content: {
    flexGrow: 1,
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
    width: "100%",
    maxWidth: MaxContentWidth,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    gap: Spacing.three,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: Radius.large,
  },
  form: {
    gap: Spacing.three,
  },
  checkButton: {
    minHeight: 0,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  successText: {
    marginTop: Spacing.one,
  },
  agreements: {
    gap: Spacing.three,
  },
  agreementRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  agreementCheckbox: {
    flex: 1,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
  },
  loginLink: {
    textDecorationLine: "underline",
  },
});
