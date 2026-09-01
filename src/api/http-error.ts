import axios from "axios";

/**
 * 앱 전역 공통 API 에러. 화면/훅은 이 타입만 보고 상태코드·메시지로 분기한다.
 * 서버는 body에 정확한 에러 메시지를 담아준다(명세 공통 규약).
 */
export class ApiHttpError extends Error {
  readonly status: number;
  readonly data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = "ApiHttpError";
    this.status = status;
    this.data = data;
  }
}

/** axios 에러 → ApiHttpError로 정규화. 응답 인터셉터에서 사용한다. */
export function toApiHttpError(error: unknown): ApiHttpError {
  // eslint-disable-next-line import/no-named-as-default-member
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body = error.response?.data as { message?: string } | undefined;
    const message =
      body?.message ?? error.message ?? "요청을 처리하지 못했어요.";
    return new ApiHttpError(status, message, error.response?.data);
  }
  if (error instanceof Error) {
    return new ApiHttpError(0, error.message);
  }
  return new ApiHttpError(0, "알 수 없는 오류가 발생했어요.");
}
