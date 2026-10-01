import { useRouter } from "expo-router";

import { TermsModal } from "@/components/ui/terms-modal";
import { PRIVACY_REVISION_BANNER } from "@/constants/privacy-policy-revision";
import { TERMS, type TermContentCode } from "@/constants/terms";

/**
 * 약관·처리방침 전문 모달. 개인정보 처리방침에는 개정 안내 배너가 붙는다.
 */
export function TermContentModal({
  code,
  onClose,
}: {
  code: TermContentCode | null;
  onClose: () => void;
}) {
  const router = useRouter();

  const banner =
    code === "PRIVACY_POLICY"
      ? {
          ...PRIVACY_REVISION_BANNER,
          onPress: () => {
            onClose();
            router.push("/privacy-notice");
          },
        }
      : undefined;

  return (
    <TermsModal
      visible={code !== null}
      title={code ? TERMS[code].title : ""}
      body={code ? TERMS[code].body : ""}
      banner={banner}
      onClose={onClose}
    />
  );
}
