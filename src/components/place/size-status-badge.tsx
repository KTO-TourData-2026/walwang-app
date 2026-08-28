import { Check, Minus, X, type LucideIcon } from "lucide-react-native";

import { StatusPill } from "@/components/ui/status-pill";
import { STATUS_LABEL } from "@/constants/status";
import type { PlaceStatus } from "@/types/place";

const STATUS_ICON: Record<PlaceStatus, LucideIcon> = {
  allowed: Check,
  denied: X,
  unknown: Minus,
};

export function SizeStatusBadge({ status }: { status: PlaceStatus }) {
  return (
    <StatusPill
      tone={status}
      label={STATUS_LABEL[status]}
      Icon={STATUS_ICON[status]}
    />
  );
}
