// 도메인별 API 엔드포인트. path 파라미터가 있으면 함수로 둔다.
// 명세(08.28판) 기준. baseURL은 apiClient에서 붙으므로 여기선 경로만.
export const API_ENDPOINTS = {
  user: {
    signUp: "/user/signUp",
    login: "/user/login",
    logout: "/user/logout",
    reissue: "/user/reissue", // refreshToken으로 access 재발급(14일 슬라이딩)
    me: "/user/me", // GET(내 정보) · PATCH(수정) · DELETE(탈퇴)
    myReviews: "/user/me/reviews", // 본인 리뷰 목록(page,size)
    checkEmail: "/user/check-email",
    checkNickname: "/user/check-nickname",
    savedStores: "/user/store",
    savedCourses: "/user/me/saved-courses",
    savedCourseDetail: (courseId: string) =>
      `/user/me/saved-courses/${courseId}`, // PATCH 이름 변경

    passport: "/user/me/passport",
    passportDetail: (passportId: string) => `/user/me/passport/${passportId}`,
  },
  store: {
    list: "/stores",
    search: "/stores/search",
    detail: (storeId: string) => `/stores/${storeId}`,
    reviews: (storeId: string) => `/stores/${storeId}/reviews`,
    save: (storeId: string) => `/stores/${storeId}/save`, // POST 저장 · DELETE 해제
    alternatives: (storeId: string) => `/stores/${storeId}/alternatives`, // 거절 대체 장소(size 필수)
  },
  review: {
    base: "/reviews", // POST 등록
    receiptVerify: "/reviews/receipt-verify",
    detail: (reviewId: string) => `/reviews/${reviewId}`, // DELETE
    reports: (reviewId: string) => `/reviews/${reviewId}/reports`, // POST 신고
    tags: "/tags",
  },
  course: {
    recommend: "/courses/recommend",
    base: "/courses", // POST 저장
    detail: (courseId: string) => `/courses/${courseId}`,
    // 삭제만 /course/{id}(단수) — 다른 경로는 복수. #19에서 단수 경로 실재 확인 완료.
    remove: (courseId: string) => `/course/${courseId}`,
  },
} as const;
