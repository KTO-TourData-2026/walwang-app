import { useState } from "react";

import { useRouter } from "expo-router";

import { TermsModal } from "@/components/ui/terms-modal";
import { REVISION_BANNER } from "@/constants/policy-revision";
import { PRIVACY_POLICY_PREVIOUS } from "@/constants/privacy-policy-previous";
import { TERMS, type TermContentCode } from "@/constants/terms";

/**
 * 약관·처리방침 전문 모달. 개인정보 처리방침은 하단 링크로 이전 버전을 오갈 수 있다(처리방침 15조 ④).
 * 이용약관·개인정보 처리방침에는 개정 안내 배너가 붙는다.
 */
export function TermContentModal({
  code,
  onClose,
}: {
  code: TermContentCode | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [showPrevious, setShowPrevious] = useState(false);

  const isPolicy = code === "PRIVACY_POLICY";
  const content =
    isPolicy && showPrevious ? PRIVACY_POLICY_PREVIOUS : code && TERMS[code];

  const close = () => {
    setShowPrevious(false);
    onClose();
  };

  const banner =
    code === "TERMS_OF_SERVICE" || code === "PRIVACY_POLICY"
      ? {
          ...REVISION_BANNER,
          onPress: () => {
            close();
            router.push("/policy-notice");
          },
        }
      : undefined;

  return (
    <TermsModal
      visible={code !== null}
      title={content ? content.title : ""}
      body={content ? content.body : ""}
      banner={banner}
      footerLink={
        isPolicy
          ? {
              label: showPrevious
                ? "현재 버전 보기"
                : `이전 버전 보기 (${PRIVACY_POLICY_PREVIOUS.caption})`,
              onPress: () => setShowPrevious((prev) => !prev),
            }
          : undefined
      }
      onClose={close}
    />
  );
}
