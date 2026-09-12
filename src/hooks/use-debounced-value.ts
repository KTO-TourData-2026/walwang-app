import { useEffect, useState } from "react";

// 값이 delay(ms) 동안 안 바뀌면 그때 반영한다. 검색 입력 → 네트워크 호출 사이 완충용.
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
