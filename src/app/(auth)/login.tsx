import { useRef, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
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
import { TextField } from "@/components/ui/text-field";
import { MaxContentWidth, Palette, Radius, Spacing } from "@/constants/theme";
import { useLoginMutation } from "@/hooks/use-login-mutation";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "이메일을 입력해주세요.")
    .pipe(z.email("이메일 형식이 올바르지 않아요.")),
  password: z.string().min(1, "비밀번호를 입력해주세요."),
});

type LoginForm = z.infer<typeof loginSchema>;

const LOGO = require("@/assets/images/logo.png");

export default function LoginScreen() {
  const router = useRouter();
  const passwordRef = useRef<TextInput>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const loginMutation = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  // 로그인 성공 시 토큰이 저장되고 지도로 이동. 자격증명 오류(401)는 인라인, 그 외는 Alert(입력값 유지).
  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await loginMutation.mutateAsync(values);
      ToastAndroid.show("로그인됐어요!", ToastAndroid.SHORT);
      router.replace("/map");
    } catch (error) {
      if (error instanceof ApiHttpError && error.status === 401) {
        setSubmitError("이메일 또는 비밀번호가 올바르지 않아요.");
        return;
      }
      Alert.alert(
        "로그인 실패",
        error instanceof ApiHttpError
          ? error.message
          : "네트워크 상태를 확인한 뒤 다시 시도해주세요.",
      );
    }
  });

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Image source={LOGO} style={styles.logo} contentFit="cover" />
          <ThemedText type="head03">로그인</ThemedText>
        </View>

        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
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
                onSubmitEditing={() => passwordRef.current?.focus()}
                submitBehavior="submit"
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
                focusColor={Palette.border.default}
                placeholder="비밀번호를 입력해주세요"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="current-password"
                returnKeyType="done"
                onSubmitEditing={onSubmit}
              />
            )}
          />
        </View>

        {submitError ? (
          <ThemedText type="label05" color={Palette.error[300]}>
            {submitError}
          </ThemedText>
        ) : null}

        <Button
          label="로그인"
          onPress={onSubmit}
          loading={loginMutation.isPending}
        />

        <View style={styles.signupRow}>
          <ThemedText type="label04" color={Palette.gray[500]}>
            계정이 없으신가요?
          </ThemedText>
          <Link href="/signup" asChild>
            <ThemedText
              type="label03"
              color={Palette.main[500]}
              style={styles.signupLink}
            >
              회원가입
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
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.two,
  },
  signupLink: {
    textDecorationLine: "underline",
  },
});
