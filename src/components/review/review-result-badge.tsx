import { Check, X } from "lucide-react-native";

import { StatusPill, type StatusPillProps } from "@/components/ui/status-pill";

type ReviewResultBadgeProps = {
  allowed: boolean;
} & Pick<
  StatusPillProps,
  "textType" | "paddingVertical" | "paddingHorizontal" | "iconSize"
>;

/**
 * 리뷰 결과 배지: 들어갔어요(가능색) / 거절당했어요(불가색).
 * 크기·패딩 등은 StatusPill prop을 그대로 전달해 호출부마다 조절한다.
 */
export function ReviewResultBadge({
  allowed,
  ...rest
}: ReviewResultBadgeProps) {
  return allowed ? (
    <StatusPill tone="allowed" label="들어갔어요" Icon={Check} {...rest} />
  ) : (
    <StatusPill tone="denied" label="거절당했어요" Icon={X} {...rest} />
  );
}
