import { renderHook } from '@testing-library/react';
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
  it('shouldReturnLoadingStateInitially', () => {
    mockGetCurrentPosition.mockImplementation(() => {});

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('loading');
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('shouldReturnPositionWhenPermissionGranted', async () => {
    const mockPosition = {
      coords: { latitude: 37.5665, longitude: 126.978 },
    };

    mockGetCurrentPosition.mockImplementation((success) => {
      success(mockPosition);
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('granted');
    expect(result.current.position).toEqual({ lat: 37.5665, lng: 126.978 });
    expect(result.current.error).toBeNull();
  });

  it('shouldReturnDeniedStatusWhenPermissionDenied', () => {
    const mockError = { code: 1, message: 'User denied geolocation' };

    mockGetCurrentPosition.mockImplementation((_success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('denied');
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBe('User denied geolocation');
  });

  it('shouldReturnErrorStatusWhenGeolocationFails', () => {
    const mockError = { code: 2, message: 'Position unavailable' };

    mockGetCurrentPosition.mockImplementation((_success, error) => {
      error(mockError);
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('error');
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBe('Position unavailable');
  });

  it('shouldReturnUnsupportedStatusWhenGeolocationNotAvailable', () => {
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.status).toBe('unsupported');
    expect(result.current.position).toBeNull();
  });
});
