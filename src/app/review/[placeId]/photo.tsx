import { useLocalSearchParams } from "expo-router";

import { ScreenStub } from "@/components/screen-stub";

export default function PhotoScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();

  return <ScreenStub name="사진 첨부" detail={`placeId: ${placeId}`} />;
}
