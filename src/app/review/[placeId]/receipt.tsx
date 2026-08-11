import { useLocalSearchParams } from 'expo-router';

import { ScreenStub } from '@/components/screen-stub';

export default function ReceiptScreen() {
  // [주의] useLocalSearchParams의 값은 항상 string | string[] 이다.
  // 숫자로 쓸 거면 반드시 Number()로 변환할 것.
  const { placeId } = useLocalSearchParams<{ placeId: string }>();

  return <ScreenStub name="영수증 인증" detail={`placeId: ${placeId}`} />;
}
