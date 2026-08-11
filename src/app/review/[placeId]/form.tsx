import { useLocalSearchParams } from 'expo-router';

import { ScreenStub } from '@/components/screen-stub';

export default function ReviewFormScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();

  return <ScreenStub name="리뷰 작성" detail={`placeId: ${placeId}`} />;
}
