import { ScreenStub } from "@/components/screen-stub";
import type { Place } from "@/types/place";

export type PlaceMapProps = {
  places: Place[];
  onSelectPlace: (place: Place) => void;
};

// 지도는 네이티브 전용 모듈이라 웹에서는 자리표시자만 보여준다.
export default function PlaceMap(_props: PlaceMapProps) {
  return (
    <ScreenStub
      name="지도"
      detail="지도는 네이티브 전용이라 웹에서는 안 보여요"
    />
  );
}
