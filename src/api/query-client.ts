import { QueryClient } from "@tanstack/react-query";

// 전역 React Query 설정. Provider는 app/_layout.tsx에서 이 인스턴스를 주입한다.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});
