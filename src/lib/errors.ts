export type ApiErrorCode = 'SEOUL_API' | 'KAKAO_API' | 'NETWORK' | 'UNKNOWN';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: ApiErrorCode,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
