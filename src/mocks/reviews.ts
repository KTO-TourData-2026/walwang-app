import type { SizeKey } from "@/types/place";
import type { Review } from "@/types/review";

/**
 * 백엔드 API가 나오기 전까지 화면 개발용으로 쓰는 목 리뷰 데이터.
 * MOCK_PLACES(src/mocks/places.ts)의 id·sizeStatus와 최대한 일관되게 맞췄다.
 *
 * - 들어갔어요(dogAllowed:true) → 사진 있음, 거절(false) → 사진 null·텍스트만.
 * - p-008은 리뷰 0건으로 비워 빈 상태(첫 리뷰 남기기)를 확인할 수 있게 했다.
 * - 사진 URL은 임시 원격 플레이스홀더다(실연동 시 교체).
 *
 * 실제 API로 갈아탈 때 이 파일만 지우면 되도록, 여기서 Review 외의 타입을 만들지 말 것.
 */

const photo = (seed: string) =>
  `https://picsum.photos/seed/walwang-${seed}/600/400`;
const thumb = (seed: string) =>
  `https://picsum.photos/seed/walwang-${seed}/300/200`;

export const MOCK_REVIEWS: Review[] = [
  // p-001 서울숲 반려견 놀이터 (소·중형 가능 / 대형 가능)
  {
    id: "r-001",
    placeId: "p-001",
    nickname: "댕댕이대장",
    dogAllowed: true,
    dogSize: "large",
    photoUrl: photo("r-001"),
    thumbnailUrl: thumb("r-001"),
    content: "대형견도 마음껏 뛰어놀 수 있어요. 잔디밭이 넓고 그늘도 많아요.",
    tags: [
      "넓은마당",
      "잔디밭",
      "뛰놀기좋아요",
      "펜스완비",
      "반려견전용공간",
      "급수대있음",
      "친구들많아요",
      "첫나들이추천",
      "오래머물기좋아요",
    ],
    createdAt: "2026-08-24T05:10:00Z",
  },
  {
    id: "r-002",
    placeId: "p-001",
    nickname: "몽이엄마",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-002"),
    thumbnailUrl: thumb("r-002"),
    content: "펜스가 잘 돼 있어서 소심한 우리 강아지도 안심했어요.",
    tags: ["펜스완비", "소심견도편해요"],
    createdAt: "2026-08-20T02:30:00Z",
  },
  {
    id: "r-003",
    placeId: "p-001",
    nickname: "산책러버",
    dogAllowed: true,
    dogSize: "large",
    photoUrl: photo("r-003"),
    thumbnailUrl: thumb("r-003"),
    content:
      "대형견 전용 공간이 따로 있어서 다른 친구들이랑 신나게 뛰어놀았어요.",
    tags: ["반려견전용공간", "친구들많아요"],
    createdAt: "2026-08-12T08:00:00Z",
  },
  {
    id: "r-004",
    placeId: "p-001",
    nickname: "초코보호자",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-004"),
    thumbnailUrl: thumb("r-004"),
    content: "첫 나들이로 딱 좋아요. 주차도 편했습니다.",
    tags: ["첫나들이추천", "주차편해요"],
    createdAt: "2026-08-03T06:45:00Z",
  },
  {
    id: "r-023",
    placeId: "p-001",
    nickname: "리트리버아빠",
    dogAllowed: false,
    dogSize: "large",
    photoUrl: null,
    thumbnailUrl: null,
    content:
      "이 날은 공사 중이라 대형견은 입장이 안 됐어요. 다음에 다시 가보려고요.",
    tags: [],
    createdAt: "2026-08-18T04:00:00Z",
  },

  // p-002 숲속의 작은 카페 (소·중형 가능 / 대형 거절)
  {
    id: "r-005",
    placeId: "p-002",
    nickname: "라떼한잔",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-005"),
    thumbnailUrl: thumb("r-005"),
    content: "테라스가 넓어서 소형견이랑 편하게 앉았어요.",
    tags: ["테라스넓음", "급수대있음"],
    createdAt: "2026-08-22T07:15:00Z",
  },
  {
    id: "r-006",
    placeId: "p-002",
    nickname: "왕만두",
    dogAllowed: false,
    dogSize: "large",
    photoUrl: null,
    thumbnailUrl: null,
    content: "대형견은 실내 입장이 안 된다고 하셨어요. 테라스만 가능.",
    tags: [],
    createdAt: "2026-08-18T09:40:00Z",
  },
  {
    id: "r-007",
    placeId: "p-002",
    nickname: "구름이집사",
    dogAllowed: false,
    dogSize: "large",
    photoUrl: null,
    thumbnailUrl: null,
    content: "우리 리트리버는 아쉽게 거절당했습니다ㅜㅜ",
    tags: [],
    createdAt: "2026-08-05T03:20:00Z",
  },

  // p-004 뚝섬 한강공원 잔디마당 (소·중형 가능 / 대형 미확인)
  {
    id: "r-008",
    placeId: "p-004",
    nickname: "한강러너",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-008"),
    thumbnailUrl: thumb("r-008"),
    content: "탁 트인 잔디밭에서 원반놀이 했어요.",
    tags: ["넓은마당", "잔디밭"],
    createdAt: "2026-08-23T01:05:00Z",
  },
  {
    id: "r-009",
    placeId: "p-004",
    nickname: "바람이",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-009"),
    thumbnailUrl: thumb("r-009"),
    content:
      "목줄만 잘 하면 편하게 산책하기 좋아요. 사람도 많지 않아 한산했어요.",
    tags: ["목줄필요해요"],
    createdAt: "2026-08-09T10:30:00Z",
  },
  {
    id: "r-010",
    placeId: "p-004",
    nickname: "대형견아빠",
    dogAllowed: true,
    dogSize: "large",
    photoUrl: photo("r-010"),
    thumbnailUrl: thumb("r-010"),
    content: "대형견도 목줄만 하면 괜찮았어요. 아직 후기가 적네요.",
    tags: ["뛰놀기좋아요"],
    createdAt: "2026-07-30T07:50:00Z",
  },

  // p-005 커피볶는 성수 (소·중형 거절 / 대형 미확인)
  {
    id: "r-011",
    placeId: "p-005",
    nickname: "에스프레소",
    dogAllowed: false,
    dogSize: "smallMedium",
    photoUrl: null,
    thumbnailUrl: null,
    content: "반려견 동반은 안 된다고 안내받았어요.",
    tags: [],
    createdAt: "2026-08-19T04:25:00Z",
  },
  {
    id: "r-012",
    placeId: "p-005",
    nickname: "콩이맘",
    dogAllowed: false,
    dogSize: "smallMedium",
    photoUrl: null,
    thumbnailUrl: null,
    content: "입구에서 거절당했습니다. 참고하세요.",
    tags: [],
    createdAt: "2026-08-01T08:10:00Z",
  },

  // p-006 왈왈 수제버거 (소·중형 가능 / 대형 거절) — 전체보기·최근3건 확인용
  {
    id: "r-013",
    placeId: "p-006",
    nickname: "버거러버",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-013"),
    thumbnailUrl: thumb("r-013"),
    content: "강아지 방석이랑 식기까지 챙겨주셔서 감동이었어요.",
    tags: ["강아지방석", "강아지식기제공", "반려견메뉴"],
    createdAt: "2026-08-26T06:00:00Z",
  },
  {
    id: "r-014",
    placeId: "p-006",
    nickname: "치즈스틱",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-014"),
    thumbnailUrl: thumb("r-014"),
    content: "소형견 손님이 많아서 편했어요. 배변봉투도 주셔요.",
    tags: ["친구들많아요", "배변봉투제공"],
    createdAt: "2026-08-25T09:30:00Z",
  },
  {
    id: "r-015",
    placeId: "p-006",
    nickname: "감자탕",
    dogAllowed: false,
    dogSize: "large",
    photoUrl: null,
    thumbnailUrl: null,
    content: "대형견은 자리가 좁아 어렵다고 하셨어요.",
    tags: [],
    createdAt: "2026-08-21T05:45:00Z",
  },
  {
    id: "r-016",
    placeId: "p-006",
    nickname: "말티즈사랑",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-016"),
    thumbnailUrl: thumb("r-016"),
    content:
      "자리가 편해서 커피 한 잔 하며 오래 앉아 있었어요. 강아지도 얌전히 잘 있었네요.",
    tags: ["오래머물기좋아요"],
    createdAt: "2026-08-14T07:20:00Z",
  },
  {
    id: "r-017",
    placeId: "p-006",
    nickname: "뭉치형",
    dogAllowed: false,
    dogSize: "large",
    photoUrl: null,
    thumbnailUrl: null,
    content: "대형견 거절. 소형견은 환영이래요.",
    tags: [],
    createdAt: "2026-08-02T02:15:00Z",
  },
  {
    id: "r-018",
    placeId: "p-006",
    nickname: "포메언니",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-018"),
    thumbnailUrl: thumb("r-018"),
    content: "조용하고 한적해서 오래 앉아 있기 좋았어요.",
    tags: ["조용해요", "한적해요"],
    createdAt: "2026-07-25T08:35:00Z",
  },

  // p-011 한적한 오후 커피 (소·중형 가능 / 대형 가능)
  {
    id: "r-019",
    placeId: "p-011",
    nickname: "오후세시",
    dogAllowed: true,
    dogSize: "large",
    photoUrl: photo("r-019"),
    thumbnailUrl: thumb("r-019"),
    content: "대형견도 편하게 들어갔어요. 사장님이 반겨주셨습니다.",
    tags: ["반려견전용공간", "급수대있음"],
    createdAt: "2026-08-27T06:10:00Z",
  },
  {
    id: "r-020",
    placeId: "p-011",
    nickname: "빈이보호자",
    dogAllowed: true,
    dogSize: "smallMedium",
    photoUrl: photo("r-020"),
    thumbnailUrl: thumb("r-020"),
    content: "조용하고 아늑해서 소형견이랑 쉬어가기 딱 좋았어요.",
    tags: ["조용해요"],
    createdAt: "2026-08-15T03:55:00Z",
  },

  // p-012 마당있는 고깃집 (소·중형 거절 / 대형 가능)
  {
    id: "r-021",
    placeId: "p-012",
    nickname: "고기굽는날",
    dogAllowed: true,
    dogSize: "large",
    photoUrl: photo("r-021"),
    thumbnailUrl: thumb("r-021"),
    content: "마당이 넓어서 대형견이랑 오기 좋아요.",
    tags: ["넓은마당", "주차편해요"],
    createdAt: "2026-08-16T10:00:00Z",
  },
  {
    id: "r-022",
    placeId: "p-012",
    nickname: "삼겹살",
    dogAllowed: false,
    dogSize: "smallMedium",
    photoUrl: null,
    thumbnailUrl: null,
    content: "실내는 소형견도 안 된다고 하셨어요. 마당만 이용 가능.",
    tags: [],
    createdAt: "2026-07-28T09:05:00Z",
  },
];

/** 특정 가게의 리뷰를 최신순으로 반환한다. */
export function getPlaceReviews(placeId: string): Review[] {
  return MOCK_REVIEWS.filter((r) => r.placeId === placeId).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

/** 특정 가게의 최근 리뷰 n건(기본 3건)을 최신순으로 반환한다. */
export function getRecentReviews(placeId: string, count = 3): Review[] {
  return getPlaceReviews(placeId).slice(0, count);
}

/**
 * 크기별 "동반 확인(dogAllowed)" 리뷰 건수.
 * 상세의 (?) 팝오버가 "소·중형견 확인 N건 / 대형견 확인 N건"을 보여줄 때 쓴다.
 */
export function getConfirmedCounts(placeId: string): Record<SizeKey, number> {
  const counts: Record<SizeKey, number> = { smallMedium: 0, large: 0 };
  for (const review of MOCK_REVIEWS) {
    if (review.placeId === placeId && review.dogAllowed) {
      counts[review.dogSize] += 1;
    }
  }
  return counts;
}

/**
 * 가게 대표 해시태그 — 그 가게 리뷰들의 태그를 빈도순으로 모은다.
 * (백엔드가 대표 태그를 내려주기 전까지 리뷰 태그로 파생)
 */
export function getPlaceTags(placeId: string, limit = 6): string[] {
  const frequency = new Map<string, number>();
  for (const review of MOCK_REVIEWS) {
    if (review.placeId !== placeId) {
      continue;
    }
    for (const tag of review.tags) {
      frequency.set(tag, (frequency.get(tag) ?? 0) + 1);
    }
  }
  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}
