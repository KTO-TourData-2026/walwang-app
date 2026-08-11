import AppTabs from '@/components/app-tabs';

/**
 * 탭 네비게이터.
 *
 * 실제 탭 정의는 src/components/app-tabs.tsx (네이티브) 와
 * src/components/app-tabs.web.tsx (웹) 로 갈라져 있다.
 * Metro가 플랫폼별 확장자를 보고 알아서 골라 번들한다 — import 경로는 하나뿐이다.
 */
export default function TabLayout() {
  return <AppTabs />;
}
