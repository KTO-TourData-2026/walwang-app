import { useState } from "react";

import { TermsModal } from "@/components/ui/terms-modal";
import { PRIVACY_POLICY_PREVIOUS } from "@/constants/privacy-policy-previous";
import { TERMS, type TermContentCode } from "@/constants/terms";

/**
 * 약관·처리방침 전문 모달. 개인정보 처리방침은 하단 링크로 이전 버전을 오갈 수 있다(처리방침 15조 ④).
 */
export function TermContentModal({
  code,
  onClose,
}: {
  code: TermContentCode | null;
  onClose: () => void;
}) {
  const [showPrevious, setShowPrevious] = useState(false);

  const isPolicy = code === "PRIVACY_POLICY";
  const content =
    isPolicy && showPrevious ? PRIVACY_POLICY_PREVIOUS : code && TERMS[code];

  const close = () => {
    setShowPrevious(false);
    onClose();
  };

  return (
    <TermsModal
      visible={code !== null}
      title={content ? content.title : ""}
      body={content ? content.body : ""}
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
