import { useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { z } from "zod";

import { ThemedText } from "@/components/themed-text";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { TextField } from "@/components/ui/text-field";
import { MaxContentWidth, Palette, Radius, Spacing } from "@/constants/theme";

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

export default function SignupScreen() {
  const nicknameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const passwordConfirmRef = useRef<TextInput>(null);

  const [agreements, setAgreements] = useState<Record<AgreementCode, boolean>>({
    TERMS_OF_SERVICE: false,
    PRIVACY: false,
    AGE_14: false,
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
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

  const onSubmit = handleSubmit(async () => {});

  const allAgreed = Object.values(agreements).every(Boolean);
  const canSubmit = isValid && allAgreed;

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
              <TextField
                label="이메일"
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
                    variant="secondary"
                    onPress={() => {}}
                    style={styles.checkButton}
                  />
                }
              />
            )}
          />

          <Controller
            control={control}
            name="nickname"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                ref={nicknameRef}
                label="닉네임"
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
                    variant="secondary"
                    onPress={() => {}}
                    style={styles.checkButton}
                  />
                }
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextField
                ref={passwordRef}
                label="비밀번호"
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
                <Pressable onPress={() => {}} hitSlop={8}>
                  <ThemedText type="label05" color={Palette.gray[500]}>
                    더보기 ›
                  </ThemedText>
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>

        <Button
          label="가입하기"
          onPress={onSubmit}
          loading={isSubmitting}
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
    justifyContent: "center",
    gap: Spacing.four,
    padding: Spacing.four,
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
    paddingHorizontal: Spacing.three,
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
