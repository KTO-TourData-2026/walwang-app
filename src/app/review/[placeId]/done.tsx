import { useLocalSearchParams } from 'expo-router';

import { ScreenStub } from '@/components/screen-stub';

export default function ReviewDoneScreen() {
  const { placeId } = useLocalSearchParams<{ placeId: string }>();

  return <ScreenStub name="작성 완료" detail={`placeId: ${placeId}`} />;
}
