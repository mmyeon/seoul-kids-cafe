import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '../../src/lib/useGeolocation';

const mockGetCurrentPosition = jest.fn();

beforeAll(() => {
  Object.defineProperty(global.navigator, 'geolocation', {
    value: { getCurrentPosition: mockGetCurrentPosition },
    writable: true,
    configurable: true,
  });
});

beforeEach(() => {
  mockGetCurrentPosition.mockClear();
});

describe('useGeolocation', () => {
  it('초기 상태는 idle이다', () => {
    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('idle');
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('마운트 시 위치 권한을 자동 요청하지 않는다', () => {
    renderHook(() => useGeolocation());

    expect(mockGetCurrentPosition).not.toHaveBeenCalled();
  });

  it('requestPermission 호출 시 loading 상태로 전환한다', () => {
    mockGetCurrentPosition.mockImplementation(() => {});

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPermission();
    });

    expect(result.current.status).toBe('loading');
  });

  it('권한 허용 시 위치 정보와 함께 granted 상태를 반환한다', async () => {
    const mockPosition = {
      coords: { latitude: 37.5665, longitude: 126.978 },
    };

    mockGetCurrentPosition.mockImplementation((success: (pos: typeof mockPosition) => void) => {
      success(mockPosition);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPermission();
    });

    expect(result.current.status).toBe('granted');
    expect(result.current.position).toEqual({ lat: 37.5665, lng: 126.978 });
    expect(result.current.error).toBeNull();
  });

  it('권한 거부 시 denied 상태와 에러 메시지를 반환한다', () => {
    const mockError = { code: 1, message: 'User denied geolocation' };

    mockGetCurrentPosition.mockImplementation((_success: unknown, error: (err: typeof mockError) => void) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPermission();
    });

    expect(result.current.status).toBe('denied');
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBe('User denied geolocation');
  });

  it('위치 조회 실패 시 error 상태와 에러 메시지를 반환한다', () => {
    const mockError = { code: 2, message: 'Position unavailable' };

    mockGetCurrentPosition.mockImplementation((_success: unknown, error: (err: typeof mockError) => void) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    act(() => {
      result.current.requestPermission();
    });

    expect(result.current.status).toBe('error');
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBe('Position unavailable');
  });

  it('Geolocation API 미지원 환경에서 초기 상태가 unsupported이다', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('unsupported');
    expect(result.current.position).toBeNull();
  });
});
