import { useEffect, useState } from "react";

import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    // 웹 정적 렌더링(SSR) 후 클라이언트에서 한 번만 하이드레이션 플래그를 켜는
    // 의도된 패턴. 마운트 시 1회뿐이라 캐스케이드 렌더 문제가 없어 규칙을 끈다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasHydrated(true);
  }, []);

  const colorScheme = useRNColorScheme();

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
