import { renderHook, waitFor } from '@testing-library/react';
import { useCafes } from '../../src/lib/useCafes';

const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockCafes = [
  {
    id: '1',
    name: '테스트 카페',
    address: '서울시 강남구',
    lat: 37.5,
    lng: 127.0,
    ageRange: { minAge: 0, maxAge: 7 },
    operatingHours: '월~금',
    phone: '02-1234-5678',
  },
];

beforeEach(() => {
  mockFetch.mockClear();
});

describe('useCafes', () => {
  it('shouldReturnLoadingStateInitially', () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));

    const { result } = renderHook(() => useCafes());

    expect(result.current.status).toBe('loading');
    expect(result.current.cafes).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('shouldReturnCafesWhenFetchSucceeds', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => mockCafes,
    });

    const { result } = renderHook(() => useCafes());

    await waitFor(() => {
      expect(result.current.status).toBe('success');
    });

    expect(result.current.cafes).toEqual(mockCafes);
    expect(result.current.error).toBeNull();
  });

  it('shouldReturnErrorWhenFetchFails', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useCafes());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.cafes).toEqual([]);
    expect(result.current.error).not.toBeNull();
  });

  it('shouldReturnErrorWhenNetworkFails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useCafes());

    await waitFor(() => {
      expect(result.current.status).toBe('error');
    });

    expect(result.current.error).toBe('Network error');
  });
});
