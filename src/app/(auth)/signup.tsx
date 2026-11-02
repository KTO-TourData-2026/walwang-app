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
import { TermContentModal } from "@/components/ui/term-content-modal";
import { TextField } from "@/components/ui/text-field";
import type { TermContentCode } from "@/constants/terms";
import { MaxContentWidth, Palette, Radius, Spacing } from "@/constants/theme";
import { useCheckNicknameMutation } from "@/hooks/use-check-nickname-mutation";
import { useConfirmEmailVerificationMutation } from "@/hooks/use-confirm-email-verification-mutation";
import { useSendEmailVerificationMutation } from "@/hooks/use-send-email-verification-mutation";
import { useSignupMutation } from "@/hooks/use-signup-mutation";

const AGREEMENTS = [
  { code: "TERMS_OF_SERVICE", label: "(필수) 이용약관 동의", more: true },
  { code: "PRIVACY", label: "(필수) 개인정보 수집·이용 동의", more: true },
  { code: "AGE_14", label: "(필수) 만 14세 이상입니다", more: false },
] as const;

type AgreementCode = (typeof AGREEMENTS)[number]["code"];

// 서버 스펙(EmailVerificationConfirmRequest.code = `\d{6}`)과 동일.
const VERIFICATION_CODE_LENGTH = 6;
const VERIFICATION_CODE_PATTERN = /^\d{6}$/;

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
    password: z
      .string()
      .min(8, "비밀번호는 8~64자로 입력해주세요.")
      .max(64, "비밀번호는 8~64자로 입력해주세요."),
    passwordConfirm: z.string().min(1, "비밀번호를 한 번 더 입력해주세요."),
  })
  .refine((values) => values.password === values.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "비밀번호가 일치하지 않아요.",
  });

type SignupForm = z.infer<typeof signupSchema>;

// 인증 확인을 통과한 이메일과 그때 받은 토큰. 이메일을 바꾸면 현재 값과 달라져 다시 인증해야 한다.
type EmailVerification = { email: string; token: string };

const LOGO = require("@/assets/images/logo.png");

function errorMessage(error: unknown): string {
  return error instanceof ApiHttpError
    ? error.message
    : "네트워크 상태를 확인한 뒤 다시 시도해주세요.";
}

// 4xx는 서버가 사용자용 메시지를 담아준다(명세 공통 규약) → 인라인으로 보여줄 수 있다.
function isClientError(error: unknown): error is ApiHttpError {
  return (
    error instanceof ApiHttpError && error.status >= 400 && error.status < 500
  );
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

  // [이메일 인증] 인증번호를 보낸 이메일 → 그 이메일에 대해서만 코드 입력란을 보인다.
  const [codeSentEmail, setCodeSentEmail] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [verification, setVerification] = useState<EmailVerification | null>(
    null,
  );

  // 마지막으로 "사용 가능"을 확인한 닉네임. 입력을 바꾸면 현재 값과 달라져 재확인이 필요해진다.
  const [checkedNickname, setCheckedNickname] = useState<string | null>(null);

  const sendCodeMutation = useSendEmailVerificationMutation();
  const confirmCodeMutation = useConfirmEmailVerificationMutation();
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
  const codeSent = codeSentEmail !== null && codeSentEmail === emailValue;
  const emailVerified =
    verification !== null && verification.email === emailValue;
  const nicknameChecked =
    checkedNickname !== null && checkedNickname === nicknameValue;

  // 인증 상태 초기화. 이메일 중복(409) 등으로 다시 인증해야 할 때 쓴다.
  const resetEmailVerification = () => {
    setCodeSentEmail(null);
    setCode("");
    setCodeError(null);
    setVerification(null);
  };

  // [인증하기/재전송] 형식 검증 통과 후 발송. 200이면 코드 입력란을 열고, 4xx(중복 등)는 인라인 에러.
  const handleSendCode = async () => {
    if (!(await trigger("email"))) {
      return;
    }
    try {
      await sendCodeMutation.mutateAsync(emailValue);
      clearErrors("email");
      setCodeSentEmail(emailValue);
      setCode("");
      setCodeError(null);
      setVerification(null);
      ToastAndroid.show("인증번호를 보냈어요.", ToastAndroid.SHORT);
    } catch (error) {
      if (error instanceof ApiHttpError && error.status === 409) {
        setError("email", { message: "이미 사용 중인 이메일이에요." });
        return;
      }
      if (isClientError(error)) {
        setError("email", { message: error.message });
        return;
      }
      Alert.alert("인증번호 발송 실패", errorMessage(error));
    }
  };

  // [확인] 6자리 숫자인지 먼저 보고 서버 확인. 성공 시 토큰을 보관(가입 요청에 동봉), 실패는 인라인 에러 한 문장.
  const handleConfirmCode = async () => {
    if (!VERIFICATION_CODE_PATTERN.test(code)) {
      setCodeError("6자리 숫자 인증번호를 입력해주세요.");
      return;
    }
    try {
      const token = await confirmCodeMutation.mutateAsync({
        email: emailValue,
        code,
      });
      setCodeError(null);
      setVerification({ email: emailValue, token });
      nicknameRef.current?.focus();
    } catch (error) {
      if (isClientError(error)) {
        // 불일치·만료·소진(4xx)은 서버 메시지 대신 한 문장으로 통일한다(남은 횟수 등 노출 안 함).
        setCodeError("유효하지 않은 인증코드입니다.");
        return;
      }
      Alert.alert("인증 실패", errorMessage(error));
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

  // 가입 → 자동 로그인 → 지도. 가입 직전 사이에 선점되면 409, 인증 토큰이 만료·무효면 403 → 이메일 재인증 유도.
  const onSubmit = handleSubmit(async (values) => {
    // 키보드 '완료'는 버튼 disabled를 거치지 않으므로, 약관·인증·중복확인·진행중 상태를 여기서 재확인한다.
    if (!allAgreed || !emailVerified || !nicknameChecked) {
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
        verificationToken: verification.token,
      });
      ToastAndroid.show("회원가입이 완료됐어요!", ToastAndroid.SHORT);
      router.replace("/map");
    } catch (error) {
      if (error instanceof ApiHttpError && error.status === 409) {
        setError("email", { message: "이미 사용 중인 이메일이에요." });
        resetEmailVerification();
        return;
      }
      if (error instanceof ApiHttpError && error.status === 403) {
        setError("email", {
          message:
            error.message || "이메일 인증이 만료됐어요. 다시 인증해주세요.",
        });
        resetEmailVerification();
        return;
      }
      Alert.alert("회원가입 실패", errorMessage(error));
    }
  });

  const canSubmit = isValid && allAgreed && emailVerified && nicknameChecked;

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
                      label={codeSent && !emailVerified ? "재전송" : "인증하기"}
                      variant="main"
                      onPress={handleSendCode}
                      loading={sendCodeMutation.isPending}
                      disabled={emailVerified}
                      size="small"
                      style={[
                        styles.checkButton,
                        codeSent && !emailVerified && styles.checkButtonCompact,
                      ]}
                    />
                  }
                />
                {emailVerified && !errors.email ? (
                  <ThemedText
                    type="label06"
                    color={Palette.success[300]}
                    style={styles.successText}
                  >
                    이메일 인증이 완료됐어요.
                  </ThemedText>
                ) : null}
                {codeSent && !emailVerified ? (
                  <View style={styles.codeBlock}>
                    <TextField
                      label="인증번호"
                      focusColor={Palette.border.default}
                      placeholder="메일로 받은 6자리 숫자"
                      value={code}
                      onChangeText={(next) => {
                        // 숫자 외 문자를 여기서 지우면 controlled 값이 안 바뀌어 입력란과 어긋난다 → 버튼 활성화·확인 시 패턴으로 거른다.
                        setCode(next);
                        setCodeError(null);
                      }}
                      error={codeError ?? undefined}
                      autoFocus
                      keyboardType="number-pad"
                      maxLength={VERIFICATION_CODE_LENGTH}
                      autoComplete="one-time-code"
                      returnKeyType="done"
                      onSubmitEditing={handleConfirmCode}
                      submitBehavior="submit"
                      rightAccessory={
                        <Button
                          label="확인"
                          variant="main"
                          onPress={handleConfirmCode}
                          loading={confirmCodeMutation.isPending}
                          disabled={!VERIFICATION_CODE_PATTERN.test(code)}
                          size="small"
                          style={[
                            styles.checkButton,
                            styles.checkButtonCompact,
                          ]}
                        />
                      }
                    />
                    {!codeError ? (
                      <ThemedText
                        type="label06"
                        color={Palette.gray[500]}
                        style={styles.successText}
                      >
                        메일함에서 인증번호를 확인해주세요.
                      </ThemedText>
                    ) : null}
                  </View>
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
                      size="small"
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
                placeholder="8~64자"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureToggle
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
                secureToggle
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

        <Pressable
          onPress={() => setTermModal("PRIVACY_POLICY")}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="개인정보 처리방침 보기"
          style={styles.policyLink}
        >
          <ThemedText
            type="subtitle05"
            color={Palette.gray[500]}
            style={styles.policyLinkText}
          >
            개인정보 처리방침
          </ThemedText>
        </Pressable>
      </ScrollView>

      <TermContentModal code={termModal} onClose={() => setTermModal(null)} />
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
    borderRadius: 10, // medium(12)과 small(6) 사이값 — 입력란 옆 작은 버튼만
    // 라벨 길이가 달라도(인증하기·재전송·확인·중복 확인) 입력란 옆 버튼 너비를 같게 맞춘다.
    minWidth: 70,
    paddingVertical: 6,
    paddingHorizontal: Spacing.two,
  },
  // 재전송·확인은 글자가 짧아 인증하기·중복 확인보다 좁게 둔다(둘끼리는 같은 너비).
  checkButtonCompact: {
    minWidth: 58,
  },
  successText: {
    marginTop: Spacing.one,
  },
  codeBlock: {
    marginTop: Spacing.two,
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
  policyLink: {
    alignSelf: "center",
  },
  policyLinkText: {
    textDecorationLine: "underline",
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
